from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.task import Task, PriorityEnum, StatusEnum
from schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()

@router.get("/stats/summary")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.owner_id == current_user.id).all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.is_completed)
    return {
        "total": total,
        "completed": completed,
        "pending": total - completed,
        "by_priority": {
            "high": sum(1 for t in tasks if t.priority == "high"),
            "medium": sum(1 for t in tasks if t.priority == "medium"),
            "low": sum(1 for t in tasks if t.priority == "low"),
        },
        "by_status": {
            "todo": sum(1 for t in tasks if t.status == "todo"),
            "in_progress": sum(1 for t in tasks if t.status == "in_progress"),
            "done": sum(1 for t in tasks if t.status == "done"),
        }
    }

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[StatusEnum] = Query(None),
    priority: Optional[PriorityEnum] = Query(None),
    is_completed: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).filter(Task.owner_id == current_user.id)
    if status: query = query.filter(Task.status == status)
    if priority: query = query.filter(Task.priority == priority)
    if is_completed is not None: query = query.filter(Task.is_completed == is_completed)
    return query.order_by(Task.created_at.desc()).all()

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = Task(**task_data.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task_data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()

@router.patch("/{task_id}/complete", response_model=TaskResponse)
def toggle_complete(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not task: raise HTTPException(status_code=404, detail="Task not found")
    task.is_completed = not task.is_completed
    task.status = StatusEnum.done if task.is_completed else StatusEnum.todo
    db.commit()
    db.refresh(task)
    return task
