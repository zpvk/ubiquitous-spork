# app/routers/ws_router.py
from fastapi import APIRouter, WebSocket, Depends
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from database.connection import get_db
from schemas.todo import TodoResponse
from service.todo_service import TodoService
from core.ConnectionManager import manager

router_ws = APIRouter()

@router_ws.websocket("/ws/tasks")
async def ws_tasks(ws: WebSocket, db: Session = Depends(get_db)):
    # 1) accept & track
    await manager.connect(ws)

    # 2) send initial snapshot
    todos = TodoService.get_all_tasks(db)
    snapshot = {
        "type": "snapshot",
        "tasks": [TodoResponse.from_orm(t).dict() for t in todos]
    }
    serializable = jsonable_encoder(snapshot)
    await ws.send_json(serializable)

    # 3) then just keep the connection open
    try:
        while True:
            # ignore incoming—this socket is read-only from the client side
            await ws.receive_text()
    except Exception:
        manager.disconnect(ws)