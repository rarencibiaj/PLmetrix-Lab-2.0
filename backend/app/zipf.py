import re
import pandas as pd
import numpy as np
from collections import Counter
from scipy import stats
from typing import Dict, Any

def clean_text(text: str) -> list[str]:
    """Tokenizes and cleans text."""
    # Convert to lowercase and remove non-alphabetic characters
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    # Basic whitespace splitting
    words = text.split()
    # Remove common stopwords (minimal list for now, can be expanded)
    stopwords = {"the", "and", "of", "to", "a", "in", "that", "is", "for", "on", "with", "as", "by", "this", "it", "at", "from"}
    return [w for w in words if w not in stopwords and len(w) > 2]

def calculate_zipf(text: str) -> Dict[str, Any]:
    """
    Computes Zipf's Law metrics.
    Input: Full text string.
    Output: Top words, exponent s, R-squared.
    """
    words = clean_text(text)
    if not words:
        return {"error": "No valid words found in text"}
    
    # Count frequencies
    counter = Counter(words)
    common_words = counter.most_common()
    
    # Create DataFrame
    df = pd.DataFrame(common_words, columns=['word', 'frequency'])
    df['rank'] = range(1, len(df) + 1)
    
    # Fit Zipf: log(f) = log(C) - s * log(r)
    # Valid mask for log
    valid_mask = (df['frequency'] > 0)
    
    log_f = np.log(df.loc[valid_mask, 'frequency'])
    log_r = np.log(df.loc[valid_mask, 'rank'])
    
    slope, intercept, r_value, p_value, std_err = stats.linregress(log_r, log_f)
    
    s_estimated = -slope
    r_squared = r_value ** 2
    
    
    # Sanitize plot_data for JSON serialization
    plot_data = {
        "rank": df['rank'].head(100).tolist(),
        "frequency": df['frequency'].head(100).tolist(),
        "log_rank": [float(x) if np.isfinite(x) else 0.0 for x in log_r.head(100)],
        "log_frequency": [float(x) if np.isfinite(x) else 0.0 for x in log_f.head(100)]
    }

    return {
        "exponent_s": float(s_estimated) if np.isfinite(s_estimated) else 0.0,
        "r_squared": float(r_squared) if np.isfinite(r_squared) else 0.0,
        "top_50_words": df.head(50).to_dict(orient='records'),
        "total_words": int(len(words)),
        "unique_words": int(len(df)),
        "plot_data": plot_data
    }
