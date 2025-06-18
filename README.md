# Real-Time Task Management Application

A modern full-stack application for real-time task management with a secure Python backend and React TypeScript frontend.

## Project Structure

This project is organized as a monorepo with two main directories:

- `backend/`: FastAPI-based RESTful API and WebSocket server
- `frontend/`: React TypeScript application with Material-UI

## Features

- **Real-time updates** via WebSockets
- **Responsive design** for desktop and mobile
- **Task creation** with title and description
- **Task claiming** by assignee
- **Task search** functionality
- **Security** with best practices implemented

## Backend Architecture Overview

- **REST for Commands**  
  - POST /tasks to create a new task  
  - PUT /tasks/{id}/claim to assign and mark in-progress  
  - GET /tasks to fetch current state (initial snapshot)

- **WebSocket for Events**  
  - Single endpoint: ws://…/ws/tasks  
  - Sends delta events only:  
    - snapshot on connect (initial list)  
    - task_created when a new task is added  
    - task_updated when a task is claimed or changed

## Bandwidth Optimization

- **Delta-Only Broadcasts**  
  - Avoid full-list pushes after each mutation  
  - Clients maintain local cache and apply incremental updates

- **Client Bootstrap**  
  - One-time GET /tasks on load (or WS snapshot)  
  - Subsequent updates rely solely on small JSON events

## Frontend Architecture

The frontend is built with:

- **React** for UI components and state management
- **TypeScript** for type safety
- **Material-UI** for component design
- **Vite** for fast development and building

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
clone repo
cd ubiquitous-spork
cd backend
python -m venv todoo
source todoo/bin/activate  # On Windows: todoon\Scripts\activate
pip install -r requirements.txt
cd app
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser to see the application running.

## Development Workflow

1. Run both backend and frontend servers
2. Make changes to the code
3. The servers will automatically reload with your changes
4. For database schema changes, use Alembic to create and apply migrations

## Security Features

This application implements several security best practices:

- **HTTP Security Headers**
- **Rate Limiting**
- **CORS Configuration**
- **Input Validation**
- **Error Handling**
- **Production Safeguards**


## WebSocket Protocol

Real-time updates are delivered via WebSocket at `ws://localhost:8000/ws/tasks`.

The WebSocket protocol has three message types:
- `snapshot`: Initial list of all tasks
- `task_created`: Notification when a new task is created
- `task_updated`: Notification when a task is updated

## License

MIT
## Main Interface
![Main Interface](https://github.com/user-attachments/assets/ff81632c-417f-430d-aa4a-12b3c7198dc9)


## Contributors

- [Rohan K](https://github.com/zpvk)
