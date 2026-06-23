// ============================================================
// TMS Core Types — Structured Clarity Design System
// ============================================================

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "HOLD";
export type TaskPriority = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
export type IssueType = "COMMENT" | "BLOCKER" | "QUESTION" | "NOTE";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  initials: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  type: IssueType;
  content: string;
  createdAt: string;
  mentions: string[]; // user IDs
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  actionType: string;
  description: string;
  details?: {
    from?: string;
    to?: string;
  };
  createdAt: string;
}

export interface TaskDependency {
  predecessorId: string;
  successorId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  dueDate: string;
  startDate: string;
  assigneeId: string;
  creatorId: string;
  parentId?: string; // for sub-tasks
  subTasks: SubTask[];
  comments: Comment[];
  activityLog: ActivityLog[];
  dependencies: TaskDependency[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = "board" | "table" | "timeline" | "dashboard";

export interface FilterState {
  myTasksOnly: boolean;
  status: TaskStatus[];
  priority: TaskPriority[];
  assigneeIds: string[];
  search: string;
  sortBy: "dueDate" | "priority" | "createdAt" | "title";
  sortDir: "asc" | "desc";
}
