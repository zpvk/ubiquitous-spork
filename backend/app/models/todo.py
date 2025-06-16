# app/models/todo.py
from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from enum import Enum as PyEnum

Base = declarative_base()

class TaskStatus(PyEnum):
    TODO = "todo"
    INPROGRESS = "inprogress"
    COMPLETED = "completed"

class Todo(Base):
    __tablename__ = "todos"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assignee    = Column(String(100), nullable=True)
    status      = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())