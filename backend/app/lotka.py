import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import curve_fit
from typing import Dict, Any

def calculate_lotka(data: pd.DataFrame) -> Dict[str, Any]:
    """
    Fits Lotka's Law: An = A1 / n^c
    Input: DataFrame with columns 'n_publications' (n) and 'n_authors' (An)
    Output: Dictionary with estimated c, R-squared, KS test results.
    """
    # Ensure columns exist
    if 'n_publications' not in data.columns or 'n_authors' not in data.columns:
        raise ValueError("Data must have 'n_publications' and 'n_authors' columns")

    n = data['n_publications'].values
    An = data['n_authors'].values

    # Avoid log(0)
    valid_mask = (n > 0) & (An > 0)
    n_log = np.log(n[valid_mask])
    An_log = np.log(An[valid_mask])

    # Linear regression on log-log data: log(An) = log(A1) - c * log(n)
    slope, intercept, r_value, p_value, std_err = stats.linregress(n_log, An_log)
    c_estimated = -slope
    A1_estimated = np.exp(intercept)
    r_squared = r_value ** 2

    # Theoretical distribution
    total_authors = np.sum(An)
    # P(n) = C / n^c
    # We use the estimated c to generate theoretical An
    # Theoretical An = A1_estimated / n^c
    An_theoretical = A1_estimated / (n ** c_estimated)

    # KS Test
    # Compare cumulative distribution functions (CDF)
    # Normalize to probabilities
    prob_empirical = An / total_authors
    prob_theoretical = An_theoretical / np.sum(An_theoretical)

    cdf_empirical = np.cumsum(prob_empirical)
    cdf_theoretical = np.cumsum(prob_theoretical)

    ks_stat, ks_p_value = stats.ks_2samp(cdf_empirical, cdf_theoretical)
    
    # Interpretation
    fit_status = "Does not fit"
    if ks_p_value > 0.05: # Fail to reject H0: distributions are same
        fit_status = "Distribution fits Lotka"
    elif ks_p_value > 0.01:
        fit_status = "Partial fit"

    return {
        "exponent_c": float(c_estimated),
        "constant_A1": float(A1_estimated),
        "r_squared": float(r_squared),
        "ks_statistic": float(ks_stat),
        "ks_p_value": float(ks_p_value),
        "fit_status": fit_status,
        "plot_data": {
            "n": n.tolist(),
            "An_empirical": An.tolist(),
            "An_theoretical": An_theoretical.tolist()
        }
    }
