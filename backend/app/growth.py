import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import curve_fit
from typing import Dict, Any, Optional
import warnings

warnings.filterwarnings("ignore", category=RuntimeWarning)


# ── Models ─────────────────────────────────────────────────────────────────────

def exponential_model(t, N0, b):
    """Price's exponential growth: N = N0 * e^(b*t)"""
    return N0 * np.exp(b * t)


def logistic_model(t, K, r, t0):
    """Logistic / sigmoid growth: N = K / (1 + e^(-r*(t - t0)))"""
    return K / (1.0 + np.exp(-r * (t - t0)))


# ── Phase detection ────────────────────────────────────────────────────────────

def classify_phases(years, observed, logistic_params, exp_r2, log_r2):
    """
    Classify the timeline into Price's three phases:
      1. Pre-scientific: early sparse production (before sustained growth)
      2. Exponential: main growth period
      3. Stabilization: where logistic deceleration begins (if applicable)
    """
    K, r, t0 = logistic_params
    t = years - years[0]
    inflection_t = t0
    inflection_year = int(round(years[0] + inflection_t))

    # Determine if the field has reached maturity
    # Criteria: logistic fits notably better AND inflection point is within the data range
    is_mature = (
        log_r2 > exp_r2 + 0.02 and
        years[0] <= inflection_year <= years[-1]
    )

    # ── Phase boundaries ──
    # Pre-scientific: from start until production exceeds 5% of the peak
    peak_val = max(observed)
    threshold_pre = 0.05 * peak_val
    pre_end_idx = 0
    for i, val in enumerate(observed):
        if val >= threshold_pre:
            pre_end_idx = i
            break

    pre_end_year = int(years[pre_end_idx])

    if is_mature:
        # Stabilization starts around the inflection year
        stab_start_year = inflection_year
        phases = {
            "pre_scientific": {"start": int(years[0]), "end": pre_end_year},
            "exponential": {"start": pre_end_year, "end": stab_start_year},
            "stabilization": {"start": stab_start_year, "end": int(years[-1])},
        }
    else:
        phases = {
            "pre_scientific": {"start": int(years[0]), "end": pre_end_year},
            "exponential": {"start": pre_end_year, "end": int(years[-1])},
            "stabilization": None,
        }

    return phases, is_mature, inflection_year


# ── Main analysis ──────────────────────────────────────────────────────────────

def calculate_growth(data: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyse annual scientific production following Price's Law of
    Exponential Growth.

    Input : DataFrame with 'year' and 'record_count' columns.
    Output: dict with model parameters, phase classification, plot data.
    """
    if "year" not in data.columns or "record_count" not in data.columns:
        raise ValueError("Data must have 'year' and 'record_count' columns")

    # Clean & sort
    df = data[["year", "record_count"]].dropna()
    df = df.sort_values("year").reset_index(drop=True)
    df["year"] = df["year"].astype(int)
    df["record_count"] = df["record_count"].astype(float)

    years = df["year"].values.astype(float)
    observed = df["record_count"].values.astype(float)
    t = years - years[0]  # normalized time starting at 0

    if len(t) < 4:
        raise ValueError("At least 4 data points are required for curve fitting")

    # ── 1. Exponential fit: N = N0 * e^(b*t) ──────────────────────────────
    try:
        p0_exp = [max(observed[0], 1.0), 0.05]
        popt_exp, _ = curve_fit(
            exponential_model, t, observed,
            p0=p0_exp, maxfev=10000,
        )
        N0_est, b_est = popt_exp
        fitted_exp = exponential_model(t, *popt_exp)

        ss_res = np.sum((observed - fitted_exp) ** 2)
        ss_tot = np.sum((observed - np.mean(observed)) ** 2)
        r2_exp = float(1 - ss_res / ss_tot) if ss_tot > 0 else 0.0
    except Exception:
        N0_est, b_est = float(observed[0]), 0.0
        fitted_exp = np.full_like(observed, np.mean(observed))
        r2_exp = 0.0

    # ── 2. Logistic fit: N = K / (1 + e^(-r*(t - t0))) ────────────────────
    try:
        K_guess = max(observed) * 1.2
        t0_guess = t[len(t) // 2]
        r_guess = 0.1
        p0_log = [K_guess, r_guess, t0_guess]
        bounds_log = (
            [max(observed) * 0.5, 0.001, 0],
            [max(observed) * 10, 5.0, t[-1] * 2],
        )
        popt_log, _ = curve_fit(
            logistic_model, t, observed,
            p0=p0_log, bounds=bounds_log, maxfev=10000,
        )
        K_est, r_est, t0_est = popt_log
        fitted_log = logistic_model(t, *popt_log)

        ss_res_log = np.sum((observed - fitted_log) ** 2)
        r2_log = float(1 - ss_res_log / ss_tot) if ss_tot > 0 else 0.0
    except Exception:
        K_est, r_est, t0_est = float(max(observed)), 0.0, float(t[-1] / 2)
        fitted_log = np.full_like(observed, np.mean(observed))
        r2_log = 0.0

    # ── 3. Doubling time ───────────────────────────────────────────────────
    doubling_time = float(np.log(2) / b_est) if b_est > 0 else None

    # ── 4. Phase classification ────────────────────────────────────────────
    phases, is_mature, inflection_year = classify_phases(
        years, observed, (K_est, r_est, t0_est), r2_exp, r2_log
    )

    field_phase = "structural_maturity" if is_mature else "emergence"

    # ── 5. Build response ──────────────────────────────────────────────────
    return {
        "N0": float(N0_est),
        "b_constant": float(b_est),
        "doubling_time": doubling_time,
        "r_squared_exp": round(r2_exp, 6),
        "r_squared_logistic": round(r2_log, 6),
        "K_capacity": float(K_est),
        "logistic_r": float(r_est),
        "field_phase": field_phase,
        "inflection_year": inflection_year if is_mature else None,
        "phases": phases,
        "total_years": int(years[-1] - years[0]),
        "total_records": int(np.sum(observed)),
        "plot_data": {
            "years": years.astype(int).tolist(),
            "observed": observed.tolist(),
            "fitted_exponential": [round(float(v), 2) for v in fitted_exp],
            "fitted_logistic": [round(float(v), 2) for v in fitted_log],
        },
    }
