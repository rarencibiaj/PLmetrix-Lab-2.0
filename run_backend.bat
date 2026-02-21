@echo off
cd backend
echo Starting Backend Server...
venv\Scripts\uvicorn main:app --reload
pause
