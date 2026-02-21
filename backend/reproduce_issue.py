import httpx
import pandas as pd
import io

# Create a dummy excel file with wrong columns
df = pd.DataFrame({'wrong_col_1': [1, 2, 3], 'wrong_col_2': [4, 5, 6]})
output = io.BytesIO()
with pd.ExcelWriter(output, engine='openpyxl') as writer:
    df.to_excel(writer, index=False)
output.seek(0)

url = 'http://localhost:8000/api/analyze/lotka'
files = {'file': ('test.xlsx', output, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}

try:
    response = httpx.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
