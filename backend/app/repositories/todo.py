# app/repositories/todo.py
from typing import Optional, List
from sqlalchemy.orm import Session
from models.todo import Todo, TaskStatus

class TodoRepository:
    @staticmethod
    def get_by_id(db: Session, task_id: int) -> Optional[Todo]:
        return db.query(Todo).filter(Todo.id == task_id).first()

    @staticmethod
    def save(db: Session, todo: Todo) -> Todo:
        db.add(todo)
        db.commit()
        db.refresh(todo)
        return todo
    
    @staticmethod
    def search_by_title(db: Session, title: str) -> List[Todo]:
        """
        Returns all Todo rows whose title contains the `title` substring,
        case-insensitive.
        """
        return (
            db.query(Todo)
              .filter(Todo.title.ilike(f"%{title}%"))
              .all()
        )

    @staticmethod
    def update_assignee_and_status(
        db: Session,
        task_id: int,
        assignee: str,
        status: TaskStatus
    ) -> Optional[Todo]:
        todo = TodoRepository.get_by_id(db, task_id)
        if not todo:
            return None
        todo.assignee = assignee
        todo.status   = status
        # updated_at will be auto‐set by SQLAlchemy on commit
        return TodoRepository.save(db, todo)