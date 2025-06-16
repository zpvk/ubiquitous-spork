from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi import logger
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from core.ConnectionManager import ConnectionManager
from routers.ws_route import router_ws

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


app = FastAPI(title="Todo App")

# mount WebSocket endpoint at /ws/tasks
app.include_router(router_ws)