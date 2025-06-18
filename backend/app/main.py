from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from routers.ws_route import router_ws
from routers.todo_routers import router
import os
import time
from collections import defaultdict

app = FastAPI(title="Todo App")

# --- Security Headers Middleware ---
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "same-origin"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# --- Simple In-Memory Rate Limiting Middleware ---
RATE_LIMIT = 100  # requests
RATE_PERIOD = 60  # seconds
client_requests = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        client_ip = request.client.host
        now = time.time()
        window = now - RATE_PERIOD
        # Remove old requests
        client_requests[client_ip] = [t for t in client_requests[client_ip] if t > window]
        if len(client_requests[client_ip]) >= RATE_LIMIT:
            return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})
        client_requests[client_ip].append(now)
        return await call_next(request)

app.add_middleware(RateLimitMiddleware)

# CORS: Open for dev, restrict for prod
ENV = os.getenv("ENV", "development")
if ENV == "production":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://your-frontend-domain.com"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins (dev only)
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# mount REST endpoints under /tasks
app.include_router(router)

# mount WebSocket endpoint at /ws/tasks
app.include_router(router_ws)

# Global error handler to avoid leaking stack traces
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

# Catch-all route handler for unknown endpoints - must be last
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def catch_all(request: Request, path: str):
    raise HTTPException(status_code=404, detail=f"Endpoint not found: {request.method} {request.url.path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)