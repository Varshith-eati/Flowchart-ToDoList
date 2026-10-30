export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Creative' | 'Finance' | 'General';

export interface ISubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ITask {
  id: string;
  taskName: string;
  deadline: number; // in days
  category: TaskCategory;
  priority: PriorityLevel;
  completed: boolean;
  pinned: boolean;
  createdAt: number;
  completedAt?: number;
  subtasks: ISubTask[];
  notes?: string;
}

export interface IActivityDay {
  day: string;
  completedCount: number;
}
