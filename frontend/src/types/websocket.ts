import { Task } from './task';

// Define the message types
export type WebSocketMessageType = 'snapshot' | 'task_created' | 'task_updated';

// Base interface for all WebSocket messages
export interface WebSocketMessage {
  type: WebSocketMessageType;
}

// Snapshot message containing all tasks
export interface SnapshotMessage extends WebSocketMessage {
  type: 'snapshot';
  tasks: Task[];
}

// Message for a single task creation
export interface TaskCreatedMessage extends WebSocketMessage {
  type: 'task_created';
  task: Task;
}

// Message for a single task update
export interface TaskUpdatedMessage extends WebSocketMessage {
  type: 'task_updated';
  task: Task;
}

// Union type of all possible message formats
export type WebSocketMessageData = 
  | SnapshotMessage
  | TaskCreatedMessage
  | TaskUpdatedMessage;
