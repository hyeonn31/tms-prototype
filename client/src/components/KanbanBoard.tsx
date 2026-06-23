// KanbanBoard.tsx — Kanban Board View with Drag & Drop
// Design: Column-based layout with colored headers, draggable task cards
import { useState, useRef } from "react";
import {
  Plus,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { STATUS_CONFIG, PRIORITY_CONFIG, MOCK_USERS } from "@/lib/mockData";
import type { Task, TaskStatus } from "@/lib/types";
import AddTaskDialog from "./AddTaskDialog";

const COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "HOLD"];

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date() && dueDate;
}

function isDueSoon(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function UserAvatar({ userId, size = "sm" }: { userId: string; size?: "sm" | "xs" }) {
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) return null;
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-600 text-white flex-shrink-0",
        size === "sm" ? "w-6 h-6 text-[10px]" : "w-5 h-5 text-[9px]"
      )}
      style={{ backgroundColor: user.avatarColor }}
      title={user.name}
    >
      {user.initials[0]}
    </div>
  );
}

function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const { selectTask } = useTaskContext();
  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate);
  const dueSoon = isDueSoon(task.dueDate);
  const completedSubs = task.subTasks.filter((s) => s.completed).length;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => selectTask(task)}
      className={cn(
        "bg-card border border-border rounded-xl p-3.5 cursor-pointer",
        "hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5",
        "transition-all duration-150 select-none",
        isDragging && "opacity-40 rotate-1 scale-105 shadow-xl"
      )}
    >
      {/* Priority + Tags row */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-600"
          style={{
            backgroundColor: priority.bg,
            color: priority.color,
          }}
        >
          {priority.icon} {priority.label}
        </span>
        {task.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[10px] font-500"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <p className="text-sm font-600 text-foreground leading-snug mb-2.5 line-clamp-2">
        {task.title}
      </p>

      {/* Progress bar */}
      {task.subTasks.length > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              {completedSubs}/{task.subTasks.length} 완료
            </span>
            <span className="text-[10px] font-600 text-foreground/70">
              {task.progress}%
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full progress-bar-fill"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <UserAvatar userId={task.assigneeId} />
          <span className="text-[10px] text-muted-foreground">
            {MOCK_USERS.find((u) => u.id === task.assigneeId)?.name.split("")[0]}
            {MOCK_USERS.find((u) => u.id === task.assigneeId)?.name.slice(1)}
          </span>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-500",
          overdue ? "text-destructive" : dueSoon ? "text-amber-600" : "text-muted-foreground"
        )}>
          {(overdue || dueSoon) && <AlertTriangle className="w-3 h-3" />}
          {!overdue && !dueSoon && <Clock className="w-3 h-3" />}
          {formatDate(task.dueDate)}
        </div>
      </div>

      {/* Comment count */}
      {task.comments.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/60 flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>💬 {task.comments.length}개 댓글</span>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  onDrop,
  dragOverStatus,
  onDragOver,
  onDragLeave,
  draggingTask,
  onDragStart,
  onDragEnd,
}: {
  status: TaskStatus;
  tasks: Task[];
  onDrop: (status: TaskStatus) => void;
  dragOverStatus: TaskStatus | null;
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onDragLeave: () => void;
  draggingTask: Task | null;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
}) {
  const config = STATUS_CONFIG[status];
  const isDragOver = dragOverStatus === status;
  const [addOpen, setAddOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-col w-[280px] min-w-[280px] rounded-xl border transition-all duration-150",
          isDragOver
            ? "border-primary/50 bg-accent/60 shadow-md"
            : "border-border/60 bg-muted/30"
        )}
        onDragOver={(e) => onDragOver(e, status)}
        onDragLeave={onDragLeave}
        onDrop={() => onDrop(status)}
      >
        {/* Column Header */}
        <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border/60">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-sm font-700 text-foreground/80 flex-1">
            {config.label}
          </span>
          <span
            className="text-[11px] font-600 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {tasks.length}
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            {collapsed ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Cards */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto tms-scroll p-3 space-y-2.5 min-h-[120px]">
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-2">
                  <Plus className="w-4 h-4" />
                </div>
                <p className="text-xs">태스크 없음</p>
              </div>
            )}
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggingTask?.id === task.id}
              />
            ))}
          </div>
        )}

        {/* Add Task Button */}
        {!collapsed && (
          <div className="p-3 pt-0">
            <button
              onClick={() => setAddOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm border border-dashed border-border/60 hover:border-primary/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              태스크 추가
            </button>
          </div>
        )}
      </div>

      <AddTaskDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultStatus={status}
      />
    </>
  );
}

export default function KanbanBoard() {
  const { filteredTasks, updateTaskStatus } = useTaskContext();
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const dragTaskRef = useRef<Task | null>(null);

  const handleDragStart = (_e: React.DragEvent, task: Task) => {
    setDraggingTask(task);
    dragTaskRef.current = task;
  };

  const handleDragEnd = () => {
    setDraggingTask(null);
    setDragOverStatus(null);
    dragTaskRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (status: TaskStatus) => {
    const task = dragTaskRef.current;
    if (task && task.status !== status) {
      updateTaskStatus(task.id, status);
    }
    setDraggingTask(null);
    setDragOverStatus(null);
    dragTaskRef.current = null;
  };

  const tasksByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = filteredTasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 tms-scroll px-1 pt-1">
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus[status]}
          onDrop={handleDrop}
          dragOverStatus={dragOverStatus}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          draggingTask={draggingTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}
