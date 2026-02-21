"""Quick test to verify Lotka endpoint handles raw author+articles data."""
import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from main import app
import pandas as pd
import io

client = TestClient(app)

# Test 1: Raw data with author names + article counts (user's format)
print("=" * 50)
print("Test 1: Raw data - authors (text) + articles (numeric)")
df = pd.DataFrame({
    'authors': ['Author A', 'Author B', 'Author C', 'Author D', 'Author E',
                'Author F', 'Author G', 'Author H', 'Author I', 'Author J'],
    'articles': [5, 3, 1, 1, 2, 1, 1, 1, 1, 1]
})
buf = io.BytesIO()
with pd.ExcelWriter(buf, engine='openpyxl') as w:
    df.to_excel(w, index=False)
buf.seek(0)

resp = client.post("/api/analyze/lotka", files={"file": ("test.xlsx", buf, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Exponent c: {data.get('exponent_c')}")
    print(f"Fit status: {data.get('fit_status')}")
    print(f"Plot data keys: {list(data.get('plot_data', {}).keys())}")
    print("PASS")
else:
    print(f"FAIL ✗ - {resp.text}")

# Test 2: Spanish columns with accents
print("\n" + "=" * 50)
print("Test 2: Spanish columns - autores + artículos")
df2 = pd.DataFrame({
    'Autores': ['Autor A', 'Autor B', 'Autor C', 'Autor D', 'Autor E',
                'Autor F', 'Autor G', 'Autor H'],
    'Artículos': [4, 2, 1, 1, 3, 1, 1, 1]
})
buf2 = io.BytesIO()
with pd.ExcelWriter(buf2, engine='openpyxl') as w:
    df2.to_excel(w, index=False)
buf2.seek(0)

resp2 = client.post("/api/analyze/lotka", files={"file": ("test2.xlsx", buf2, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
print(f"Status: {resp2.status_code}")
if resp2.status_code == 200:
    data2 = resp2.json()
    print(f"Exponent c: {data2.get('exponent_c')}")
    print(f"Fit status: {data2.get('fit_status')}")
    print("PASS")
else:
    print(f"FAIL ✗ - {resp2.text}")

# Test 3: Pre-aggregated two numeric columns
print("\n" + "=" * 50)
print("Test 3: Pre-aggregated - n_publications + n_authors")
df3 = pd.DataFrame({
    'n_publications': [1, 2, 3, 4, 5],
    'n_authors': [100, 25, 11, 6, 4]
})
buf3 = io.BytesIO()
df3.to_csv(buf3, index=False)
buf3.seek(0)

resp3 = client.post("/api/analyze/lotka", files={"file": ("test3.csv", buf3, "text/csv")})
print(f"Status: {resp3.status_code}")
if resp3.status_code == 200:
    data3 = resp3.json()
    print(f"Exponent c: {data3.get('exponent_c')}")
    print(f"Fit status: {data3.get('fit_status')}")
    print("PASS")
else:
    print(f"FAIL ✗ - {resp3.text}")

print("\n" + "=" * 50)
print("All tests complete.")
