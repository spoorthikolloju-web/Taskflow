from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.task import PriorityEnum, StatusEnum

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    status: StatusEnum = StatusEnum.todo
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: PriorityEnum
    status: StatusEnum
    due_date: Optional[datetime]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    owner_id: int
    class Config:
        from_attributes = True
