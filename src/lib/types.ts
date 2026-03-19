export type TaskStatus = "backlog" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type Assignee = "Cole" | "Hal";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: Assignee;
  priority: TaskPriority;
  createdAt: string;
  projectId?: string;
}

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  lastActivity: string;
  color: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  description: string;
  type: "backup" | "sync" | "report" | "maintenance" | "custom";
  nextRun: string;
  lastRun?: string;
  enabled: boolean;
}

export interface MemoryFile {
  filename: string;
  date: string;
  content: string;
  preview: string;
}

export interface Document {
  path: string;
  filename: string;
  title: string;
  category: string;
  date: string;
  preview: string;
  content: string;
}
