export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  status: 'todo' | 'inprogress' | 'completed';
  created_at: string;
  updated_at?: string;
}