# app/routers/ws_router.py
from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from core.ConnectionManager import manager

router_ws = APIRouter()

@router_ws.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Client says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A client disconnected")