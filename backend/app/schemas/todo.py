# app/schemas/todo.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from models.todo import TaskStatus

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    assignee: Optional[str] = Field(None, max_length=100)

class TodoClaim(BaseModel):
    assignee: str = Field(..., min_length=1, max_length=100)
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