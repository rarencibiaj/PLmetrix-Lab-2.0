from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PLmetrix Lab API",
    description="Backend API for PLmetrix Lab Scientometric Platform",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    # Allow localhost:3000 for frontend dev server
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import router as api_router

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to PLmetrix Lab API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
