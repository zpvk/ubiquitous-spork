import type { Task } from '../types/task';

const API_BASE = '/api';

interface CreateTaskData {
  title: string;
  description?: string;
  assignee?: string;
}

interface ClaimTaskData {
  assignee: string;
}

export class TaskService {
  // Get all tasks
  static async getAllTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/tasks/`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  }

  // Create a new task
  static async createTask(data: CreateTaskData): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create task: ${error}`);
    }
    return response.json();
  }

  // Claim/assign a task
  static async claimTask(taskId: string, data: ClaimTaskData): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/claim`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to claim task');
    }
    return response.json();
  }

  // Search tasks by title
  static async searchTasks(title: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/tasks/search/?title=${encodeURIComponent(title)}`);
    
    if (response.status === 404) {
      return []; // Return empty array if no tasks found
    }
    
    if (!response.ok) {
      throw new Error('Failed to search tasks');
    }
    return response.json();
  }
}