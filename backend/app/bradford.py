import pandas as pd
import numpy as np
from typing import Dict, Any

def calculate_bradford(data: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes Bradford's Law metrics.
    Input: DataFrame with 'journal' and 'articles' columns.
    Output: Zones, multiplier k, core journals.
    """
    if 'journal' not in data.columns or 'articles' not in data.columns:
        raise ValueError("Data must have 'journal' and 'articles' columns")

    # Sort by articles descending
    df_sorted = data.sort_values(by='articles', ascending=False).reset_index(drop=True)
    
    total_articles = df_sorted['articles'].sum()
    total_journals = len(df_sorted)
    
    # Divide into 3 zones (approx equal articles)
    target_articles_per_zone = total_articles / 3
    
    zones = []
    current_zone = []
    current_articles = 0
    zone_article_counts = []
    
    for _, row in df_sorted.iterrows():
        current_zone.append(row['journal'])
        current_articles += row['articles']
        
        # If we reached the target and haven't filled 3 zones yet
        if current_articles >= target_articles_per_zone and len(zones) < 2:
            zones.append(current_zone)
            zone_article_counts.append(current_articles)
            current_zone = []
            current_articles = 0
            
    # Add remaining to last zone
    if current_zone:
        zones.append(current_zone)
        zone_article_counts.append(current_articles)
        
    # Calculate Multiplier k
    # k = n2/n1, n3/n2 approx
    n_journals = [len(z) for z in zones]
    
    # Bradford multiplier k (average ratio)
    k_ratios = []
    if len(n_journals) >= 2:
        for i in range(len(n_journals) - 1):
            if n_journals[i] > 0:
                k_ratios.append(n_journals[i+1] / n_journals[i])
    
    k_multiplier = np.mean(k_ratios) if k_ratios else 0
    
    # Core journals (Zone 1)
    core_journals = zones[0] if zones else []

    # Build zone labels for each journal (1-indexed zone number)
    zone_labels = []
    for zone_idx, zone_journals in enumerate(zones):
        zone_labels.extend([zone_idx + 1] * len(zone_journals))

    return {
        "zones_count": len(zones),
        "articles_per_zone": zone_article_counts,
        "journals_per_zone": n_journals,
        "bradford_multiplier_k": float(k_multiplier),
        "core_journals": core_journals,
        "plot_data": {
            "rank": list(range(1, total_journals + 1)),
            "cumulative_articles": df_sorted['articles'].cumsum().tolist(),
            "log_rank": np.log(list(range(1, total_journals + 1))).tolist(),
            "zone_labels": zone_labels
        }
    }
