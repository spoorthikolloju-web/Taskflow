# ⚡ TaskFlow — Task Management App

Full-stack task management application built with **FastAPI** (Python) + **React** (Vite).

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, JWT Auth, Pydantic, Pytest
- **Frontend**: React 18, Vite, React Router, Axios, CSS Modules

## Project Structure
```
taskflow/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env
│   ├── core/
│   │   ├── database.py      # SQLAlchemy setup
│   │   └── security.py      # JWT + password hashing
│   ├── models/
│   │   ├── user.py          # User ORM model
│   │   └── task.py          # Task ORM model
│   ├── schemas/
│   │   ├── user.py          # Pydantic schemas
│   │   └── task.py
│   ├── routers/
│   │   ├── auth.py          # /api/auth routes
│   │   ├── users.py         # /api/users routes
│   │   └── tasks.py         # /api/tasks routes (full CRUD)
│   └── tests/
│       └── test_tasks.py    # Pytest test suite
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   ├── axios.js     # Axios instance + interceptors
        │   ├── auth.js      # Auth API calls
        │   └── tasks.js     # Tasks API calls
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   └── PrivateRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            └── *.module.css
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login + get JWT token |
| GET | /api/users/me | Get current user |
| GET | /api/tasks/ | List tasks (with filters) |
| POST | /api/tasks/ | Create task |
| GET | /api/tasks/{id} | Get single task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| PATCH | /api/tasks/{id}/complete | Toggle complete |
| GET | /api/tasks/stats/summary | Task statistics |

## Setup & Run

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Run Tests
```bash
cd backend
pytest tests/ -v
```

## Features
- JWT-based authentication (register/login)
- Full CRUD for tasks
- Filter by status & priority
- Toggle task completion
- Task statistics in sidebar
- Responsive dark UI
