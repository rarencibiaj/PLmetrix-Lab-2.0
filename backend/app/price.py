import re
import datetime
from collections import Counter
from typing import Dict, Any

def extract_years(text: str) -> list[int]:
    """
    Extracts years from text.
    Heuristic: 4 digit numbers starting with 19 or 20.
    """
    # Regex for years 1900-2099
    years = re.findall(r'\b(19\d{2}|20\d{2})\b', text)
    return [int(y) for y in years]

def calculate_price_index(text: str, current_year: int = None) -> Dict[str, Any]:
    """
    Computes Price Index.
    Input: Text containing references.
    Output: Price Index %, Total References, Age Distribution.
    """
    if current_year is None:
        current_year = datetime.datetime.now().year
        
    # extract reference section (simple heuristic)
    # Look for "References" or "Bibliography"
    # If not found, scan whole text (less accurate but fallback)
    ref_patterns = [r"references\s*\n", r"bibliography\s*\n", r"literatura citada\s*\n", r"referencias\s*\n"]
    
    ref_start = -1
    text_lower = text.lower()
    
    for pattern in ref_patterns:
        match = re.search(pattern, text_lower)
        if match:
            ref_start = match.start()
            break
            
    if ref_start != -1:
        # potential references section
        ref_text = text[ref_start:]
    else:
        # assume whole text might contain references (or user uploaded just refs)
        ref_text = text

    years = extract_years(ref_text)
    
    if not years:
        return {"error": "No years found in text"}

    # Filter years to reasonable range (e.g. not future, not too old)
    valid_years = [y for y in years if 1800 <= y <= current_year + 1]
    
    if not valid_years:
        return {"error": "No valid publication years found"}
        
    total_refs = len(valid_years)
    recent_refs = len([y for y in valid_years if y >= (current_year - 5)])
    
    price_index = (recent_refs / total_refs) * 100 if total_refs > 0 else 0
    
    # Interpretation
    interpretation = "Low recency"
    if price_index > 70:
        interpretation = "High recency" 
    elif price_index > 50:
        interpretation = "Moderate recency"
        
    # Histogram data
    age_counts = Counter(valid_years)
    sorted_years = sorted(age_counts.items())
    
    return {
        "price_index_percent": round(price_index, 2),
        "total_references": total_refs,
        "recent_references": recent_refs,
        "interpretation": interpretation,
        "plot_data": {
            "years": [item[0] for item in sorted_years],
            "counts": [item[1] for item in sorted_years]
        }
    }
