from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi import logger
from pydantic import BaseModel
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from routers.ws_route import router_ws
from routers.todo_routers import router

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

# mount REST endpoints under /tasks
app.include_router(router)

# mount WebSocket endpoint at /ws/tasks
app.include_router(router_ws)