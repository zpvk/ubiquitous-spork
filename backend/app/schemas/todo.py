# app/schemas/todo.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from models.todo import TaskStatus

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None

class TodoClaim(BaseModel):
    assignee: str
    status: TaskStatus = TaskStatus.INPROGRESS

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assignee: Optional[str]
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)