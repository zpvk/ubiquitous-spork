from typing import Optional, List
from sqlalchemy.orm import Session
from models.todo import TaskStatus, Todo
from repositories.todo import TodoRepository
from schemas.todo import TodoCreate, TodoClaim

class TodoService:
    @staticmethod
    def create_task(db: Session, data: TodoCreate) -> Todo:
        todo = Todo(**data.dict(), status=TaskStatus.TODO)
        return TodoRepository.save(db, todo)

    @staticmethod
    def claim_task(db: Session, task_id: int, data: TodoClaim) -> Optional[Todo]:
        todo = TodoRepository.get_by_id(db, task_id)
        if not todo:
            return None
        if todo.status != TaskStatus.TODO:
            raise ValueError("Only TODO tasks can be claimed")
        todo.assignee = data.assignee
        todo.status   = data.status
        return TodoRepository.save(db, todo)
    
    @staticmethod
    def get_all_tasks(db: Session) -> List[Todo]:
        """Return every Todo in the database."""
        return db.query(Todo).all()
    
    @staticmethod
    def search_tasks_by_title(db: Session, title: str) -> List[Todo]:
        """
        Business-level search; you can add permissions/pagination here.
        """
        return TodoRepository.search_by_title(db, title)