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
  // Validate input data before sending to server
  private static validateTaskData(data: CreateTaskData): string | null {
    if (!data.title?.trim()) {
      return 'Title is required';
    }
    
    if (data.title.length > 100) {
      return 'Title must be less than 100 characters';
    }
    
    if (data.description && data.description.length > 500) {
      return 'Description must be less than 500 characters';
    }
    
    if (data.assignee) {
      if (data.assignee.length > 100) {
        return 'Assignee name must be less than 100 characters';
      }
      
      // Basic validation for name
      const nameRegex = /^[a-zA-Z0-9\s\.\-']+$/;
      if (!nameRegex.test(data.assignee)) {
        return 'Assignee name contains invalid characters';
      }
    }
    
    return null;
  }
  
  private static validateClaimData(data: ClaimTaskData): string | null {
    if (!data.assignee?.trim()) {
      return 'Assignee name is required';
    }
    
    if (data.assignee.length > 100) {
      return 'Assignee name must be less than 100 characters';
    }
    
    // Basic validation for name
    const nameRegex = /^[a-zA-Z0-9\s\.\-']+$/;
    if (!nameRegex.test(data.assignee)) {
      return 'Assignee name contains invalid characters';
    }
    
    return null;
  }
  
  private static sanitizeTaskInput(data: CreateTaskData): CreateTaskData {
    return {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : undefined,
      assignee: data.assignee ? data.assignee.trim() : undefined
    };
  }
  
  // Enhanced error handling for fetch requests
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Try to parse API error if available
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
      } catch (e) {
        if (e instanceof Error) {
          throw e;
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    }
    
    return response.json() as Promise<T>;
  }

  // Get all tasks
  static async getAllTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE}/tasks/`);
      return await this.handleResponse<Task[]>(response);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch tasks');
    }
  }

  // Create a new task
  static async createTask(data: CreateTaskData): Promise<Task> {
    // Validate input
    const validationError = this.validateTaskData(data);
    if (validationError) {
      throw new Error(validationError);
    }
    
    // Sanitize input
    const sanitizedData = this.sanitizeTaskInput(data);
    
    try {
      const response = await fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData)
      });
      
      return await this.handleResponse<Task>(response);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error instanceof Error ? error : new Error('Failed to create task');
    }
  }

  // Claim/assign a task
  static async claimTask(taskId: string, data: ClaimTaskData): Promise<Task> {
    // Validate input
    const validationError = this.validateClaimData(data);
    if (validationError) {
      throw new Error(validationError);
    }
    
    // Validate task ID
    if (!taskId) {
      throw new Error('Invalid task ID');
    }
    
    try {
      const response = await fetch(`${API_BASE}/tasks/${encodeURIComponent(taskId)}/claim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee: data.assignee.trim() })
      });
      
      return await this.handleResponse<Task>(response);
    } catch (error) {
      console.error('Failed to claim task:', error);
      throw error instanceof Error ? error : new Error('Failed to claim task');
    }
  }

  // Search tasks by title
  static async searchTasks(title: string): Promise<Task[]> {
    // Input validation
    if (!title?.trim()) {
      return [];
    }
    
    if (title.length > 100) {
      throw new Error('Search query too long');
    }
    
    try {
      const response = await fetch(`${API_BASE}/tasks/search/?title=${encodeURIComponent(title.trim())}`);
      
      if (response.status === 404) {
        return []; // Return empty array if no tasks found
      }
      
      return await this.handleResponse<Task[]>(response);
    } catch (error) {
      console.error('Failed to search tasks:', error);
      throw error instanceof Error ? error : new Error('Failed to search tasks');
    }
  }
}