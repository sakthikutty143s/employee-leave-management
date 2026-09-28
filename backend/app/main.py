from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, employees, leaves, documents


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Employee Leave Management System",
    version="1.0.0"
)


# ==============================
# CORS Configuration
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# API Routers
# ==============================

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(leaves.router)
app.include_router(documents.router)


# ==============================
# Root
# ==============================

@app.get("/")
def root():
    return {
        "message": "Employee Leave Management API is running"
    }


# ==============================
# Health Check
# ==============================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }