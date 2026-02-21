from fastapi.testclient import TestClient
from main import app
import pandas as pd
import io

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_lotka():
    # Create dummy Excel file
    df = pd.DataFrame({
        'n_publications': [1, 2, 3, 4, 5],
        'n_authors': [100, 25, 11, 6, 4]
    })
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    
    files = {'file': ('test.xlsx', output, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
    response = client.post("/api/analyze/lotka", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "exponent_c" in data
    assert "r_squared" in data

def test_bradford():
    # Create dummy CSV file
    csv_content = "journal,articles\nJ1,100\nJ2,80\nJ3,60\nJ4,40\nJ5,20\nJ6,10"
    files = {'file': ('test.csv', io.BytesIO(csv_content.encode('utf-8')), 'text/csv')}
    response = client.post("/api/analyze/bradford", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "zones_count" in data
    assert "bradford_multiplier_k" in data

def test_zipf_txt():
    # Create dummy txt
    txt_content = "the quick brown fox jumps over the lazy dog the the the"
    files = {'file': ('test.txt', io.BytesIO(txt_content.encode('utf-8')), 'text/plain')}
    response = client.post("/api/analyze/zipf", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "exponent_s" in data
    assert "top_50_words" in data

def test_price():
    # Create dummy txt with references
    # Heuristic looks for "References"
    content = "Some text.\nReferences\nSmith (2020)\nJones (2024)\nOld (1990)"
    files = {'file': ('test.txt', io.BytesIO(content.encode('utf-8')), 'text/plain')}
    response = client.post("/api/analyze/price", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "price_index_percent" in data
    assert data["total_references"] == 3
    # 2020 and 2024 are recent (<5 years from specialized assumed current year or real time)
    # 2026 is current year according to metadata.
    # 2026-5 = 2021+. So 2024 is recent. 2020 is old. 1990 is old.
    # recent_refs = 1 (2024).
    assert "recent_references" in data
