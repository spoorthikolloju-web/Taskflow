from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from routers import auth, tasks, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API", description="Task Management REST API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://taskflow-c8471491w-spoorthi-s-project.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "TaskFlow API is running", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
