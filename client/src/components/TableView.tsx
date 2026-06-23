// TableView.tsx — Spreadsheet-style Table View
// Design: Dense table with sortable columns, inline status/priority badges
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { STATUS_CONFIG, PRIORITY_CONFIG, MOCK_USERS } from "@/lib/mockData";
import type { Task } from "@/lib/types";

function UserAvatar({ userId }: { userId: string }) {
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-600 text-white flex-shrink-0"
        style={{ backgroundColor: user.avatarColor }}
      >
        {user.initials[0]}
      </div>
      <span className="text-xs text-foreground/80">{user.name}</span>
    </div>
  );
}

function ProgressCell({ progress }: { progress: number }) {
  const color =
    progress >= 80
      ? "#059669"
      : progress >= 50
      ? "#2563EB"
      : progress >= 20
      ? "#D97706"
      : "#94A3B8";

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-600 text-foreground/60 w-8 text-right">
        {progress}%
      </span>
    </div>
  );
}

function DueDateCell({ dueDate }: { dueDate: string }) {
  const d = new Date(dueDate);
  const now = Date.now();
  const diff = d.getTime() - now;
  const overdue = diff < 0;
  const dueSoon = diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;

  const formatted = d.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });

  return (
    <span
      className={cn(
        "text-xs font-500",
        overdue
          ? "text-destructive font-600"
          : dueSoon
          ? "text-amber-600 font-600"
          : "text-muted-foreground"
      )}
    >
      {overdue && "⚠ "}
      {formatted}
    </span>
  );
}

type SortKey = "title" | "status" | "priority" | "dueDate" | "progress" | "assignee";

export default function TableView() {
  const { filteredTasks, selectTask } = useTaskContext();
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const PRIORITY_ORDER: Record<string, number> = {
    HIGHEST: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };
  const STATUS_ORDER: Record<string, number> = {
    IN_PROGRESS: 0,
    REVIEW: 1,
    TODO: 2,
    HOLD: 3,
    DONE: 4,
  };

  const sorted = [...filteredTasks].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "title") cmp = a.title.localeCompare(b.title);
    else if (sortKey === "status")
      cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortKey === "priority")
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    else if (sortKey === "dueDate")
      cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    else if (sortKey === "progress") cmp = a.progress - b.progress;
    else if (sortKey === "assignee") {
      const ua = MOCK_USERS.find((u) => u.id === a.assigneeId)?.name || "";
      const ub = MOCK_USERS.find((u) => u.id === b.assigneeId)?.name || "";
      cmp = ua.localeCompare(ub);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ChevronsUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary" />
    );
  };

  const ColHeader = ({
    col,
    label,
    className,
  }: {
    col: SortKey;
    label: string;
    className?: string;
  }) => (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-700 text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors",
        className
      )}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon col={col} />
      </div>
    </th>
  );

  return (
    <div className="h-full overflow-auto tms-scroll">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
          <tr>
            <ColHeader col="title" label="태스크명" className="min-w-[260px]" />
            <ColHeader col="status" label="상태" className="w-28" />
            <ColHeader col="priority" label="우선순위" className="w-24" />
            <ColHeader col="assignee" label="담당자" className="w-36" />
            <ColHeader col="dueDate" label="마감일" className="w-28" />
            <ColHeader col="progress" label="진행률" className="w-36" />
            <th className="px-4 py-3 text-left text-xs font-700 text-muted-foreground uppercase tracking-wider w-20">
              태그
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                조건에 맞는 태스크가 없습니다.
              </td>
            </tr>
          )}
          {sorted.map((task: Task, idx) => {
            const statusCfg = STATUS_CONFIG[task.status];
            const priorityCfg = PRIORITY_CONFIG[task.priority];
            return (
              <tr
                key={task.id}
                onClick={() => selectTask(task)}
                className={cn(
                  "border-b border-border/60 cursor-pointer transition-colors",
                  idx % 2 === 0 ? "bg-card" : "bg-muted/20",
                  "hover:bg-accent/40"
                )}
              >
                {/* Title */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-600 text-foreground line-clamp-1">
                      {task.title}
                    </span>
                    {task.subTasks.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        서브태스크 {task.subTasks.filter((s) => s.completed).length}/
                        {task.subTasks.length}
                      </span>
                    )}
                  </div>
                </td>
                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-600"
                    style={{
                      backgroundColor: statusCfg.bg,
                      color: statusCfg.color,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusCfg.color }}
                    />
                    {statusCfg.label}
                  </span>
                </td>
                {/* Priority */}
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-600"
                    style={{
                      backgroundColor: priorityCfg.bg,
                      color: priorityCfg.color,
                    }}
                  >
                    {priorityCfg.icon} {priorityCfg.label}
                  </span>
                </td>
                {/* Assignee */}
                <td className="px-4 py-3">
                  <UserAvatar userId={task.assigneeId} />
                </td>
                {/* Due Date */}
                <td className="px-4 py-3">
                  <DueDateCell dueDate={task.dueDate} />
                </td>
                {/* Progress */}
                <td className="px-4 py-3">
                  <ProgressCell progress={task.progress} />
                </td>
                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[10px] font-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
