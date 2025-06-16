# app/routers/todo_router.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from schemas.todo import TodoCreate, TodoClaim, TodoResponse
from service.todo_service import TodoService
from database.connection import get_db
from core.ConnectionManager import manager
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[TodoResponse])
def list_tasks(db: Session = Depends(get_db)):
    return TodoService.get_all_tasks(db)

@router.post("/", response_model=TodoResponse, status_code=201)
async def create_task(
    payload: TodoCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db)
):
    todo = TodoService.create_task(db, payload)
    event = {
        "type": "task_created",
        "task": TodoResponse.from_orm(todo).dict()
    }
    # convert enums, datetimes, etc → plain JSON
    serializable_event = jsonable_encoder(event)
    background.add_task(manager.broadcast, serializable_event)
    return todo

@router.put("/{task_id}/claim", response_model=TodoResponse)
async def claim_task(
    task_id: int,
    payload: TodoClaim,
    background: BackgroundTasks,
    db: Session = Depends(get_db)
):
    todo = TodoService.claim_task(db, task_id, payload)
    if not todo:
        raise HTTPException(404, "Not found or already claimed")
    event = {
        "type": "task_updated",
        "task": TodoResponse.from_orm(todo).dict()
    }
    serializable_event = jsonable_encoder(event)
    background.add_task(manager.broadcast, serializable_event)
    return todo

@router.get("/search", response_model=List[TodoResponse], summary="Search tasks by title")
def search_tasks(
    title: str,
    db: Session = Depends(get_db),
):
    results = TodoService.search_tasks_by_title(db, title)
    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"No tasks found matching '{title}'")
    return results