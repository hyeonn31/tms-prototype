// TimelineView.tsx — Gantt Chart Timeline View
// Design: Date-axis horizontal bars with dependency arrows
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { STATUS_CONFIG, PRIORITY_CONFIG, MOCK_USERS } from "@/lib/mockData";

const DAY_WIDTH = 36; // px per day
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 56;
const LEFT_COL_WIDTH = 220;

function getDateRange(tasks: { startDate: string; dueDate: string }[]) {
  if (tasks.length === 0) {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 2, 0),
    };
  }
  const dates = tasks.flatMap((t) => [
    new Date(t.startDate),
    new Date(t.dueDate),
  ]);
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  // Pad 3 days on each side
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 7);
  return { start: minDate, end: maxDate };
}

function getDaysBetween(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export default function TimelineView() {
  const { filteredTasks, selectTask } = useTaskContext();

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getDateRange(filteredTasks),
    [filteredTasks]
  );

  const totalDays = getDaysBetween(rangeStart, rangeEnd);
  const today = new Date();
  const todayOffset = getDaysBetween(rangeStart, today);

  // Generate day columns
  const days = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => addDays(rangeStart, i));
  }, [rangeStart, totalDays]);

  // Group days by month for header
  const months = useMemo(() => {
    const groups: { label: string; count: number; startIdx: number }[] = [];
    let currentMonth = -1;
    let currentGroup: (typeof groups)[0] | null = null;
    days.forEach((day, idx) => {
      const month = day.getMonth();
      if (month !== currentMonth) {
        currentMonth = month;
        currentGroup = {
          label: day.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
          }),
          count: 1,
          startIdx: idx,
        };
        groups.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.count++;
      }
    });
    return groups;
  }, [days]);

  const getBarStyle = (task: { startDate: string; dueDate: string }) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.dueDate);
    const left = getDaysBetween(rangeStart, taskStart) * DAY_WIDTH;
    const width = Math.max(
      (getDaysBetween(taskStart, taskEnd) + 1) * DAY_WIDTH,
      DAY_WIDTH
    );
    return { left, width };
  };

  return (
    <div className="h-full overflow-auto tms-scroll">
      <div
        style={{
          minWidth: LEFT_COL_WIDTH + totalDays * DAY_WIDTH,
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-20 bg-card border-b border-border"
          style={{ height: HEADER_HEIGHT }}
        >
          {/* Month row */}
          <div
            className="flex border-b border-border/60"
            style={{ paddingLeft: LEFT_COL_WIDTH }}
          >
            {months.map((m) => (
              <div
                key={m.label}
                className="text-xs font-700 text-foreground/70 px-3 py-1.5 border-r border-border/40"
                style={{ width: m.count * DAY_WIDTH }}
              >
                {m.label}
              </div>
            ))}
          </div>
          {/* Day row */}
          <div className="flex" style={{ paddingLeft: LEFT_COL_WIDTH }}>
            {days.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-center text-[10px] font-500 border-r border-border/30",
                  isWeekend(day) ? "bg-muted/60 text-muted-foreground/60" : "text-muted-foreground",
                  isSameDay(day, today) && "bg-primary/10 text-primary font-700"
                )}
                style={{ width: DAY_WIDTH, height: 28 }}
              >
                {day.getDate()}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative">
          {/* Today line */}
          {todayOffset >= 0 && todayOffset <= totalDays && (
            <div
              className="absolute top-0 bottom-0 w-px bg-primary/60 z-10 pointer-events-none"
              style={{
                left: LEFT_COL_WIDTH + todayOffset * DAY_WIDTH + DAY_WIDTH / 2,
              }}
            />
          )}

          {/* Weekend shading */}
          {days.map((day, idx) =>
            isWeekend(day) ? (
              <div
                key={idx}
                className="absolute top-0 bottom-0 bg-muted/30 pointer-events-none"
                style={{
                  left: LEFT_COL_WIDTH + idx * DAY_WIDTH,
                  width: DAY_WIDTH,
                }}
              />
            ) : null
          )}

          {/* Task rows */}
          {filteredTasks.length === 0 && (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              표시할 태스크가 없습니다.
            </div>
          )}
          {filteredTasks.map((task, rowIdx) => {
            const statusCfg = STATUS_CONFIG[task.status];
            const priorityCfg = PRIORITY_CONFIG[task.priority];
            const user = MOCK_USERS.find((u) => u.id === task.assigneeId);
            const { left, width } = getBarStyle(task);

            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center border-b border-border/40 relative",
                  rowIdx % 2 === 0 ? "bg-card" : "bg-muted/10"
                )}
                style={{ height: ROW_HEIGHT }}
              >
                {/* Left: Task name column */}
                <div
                  className="sticky left-0 z-10 flex items-center gap-2.5 px-4 border-r border-border/60 h-full"
                  style={{
                    width: LEFT_COL_WIDTH,
                    backgroundColor: rowIdx % 2 === 0 ? "var(--card)" : "oklch(0.978 0.003 247 / 0.5)",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusCfg.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-600 text-foreground truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {user && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-600 text-white"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.initials[0]}
                        </div>
                      )}
                      <span
                        className="text-[10px] font-600 px-1 rounded"
                        style={{
                          backgroundColor: priorityCfg.bg,
                          color: priorityCfg.color,
                        }}
                      >
                        {priorityCfg.icon}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Gantt bar area */}
                <div className="relative flex-1 h-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-lg cursor-pointer hover:brightness-95 transition-all shadow-sm"
                    style={{
                      left,
                      width,
                      height: 32,
                      backgroundColor: statusCfg.color,
                      opacity: task.status === "DONE" ? 0.6 : 0.85,
                    }}
                    onClick={() => selectTask(task)}
                    title={`${task.title} (${task.startDate} ~ ${task.dueDate})`}
                  >
                    {/* Progress fill */}
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-l-lg opacity-30"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: "white",
                      }}
                    />
                    {/* Label */}
                    {width > 80 && (
                      <span className="absolute inset-0 flex items-center px-2 text-[11px] font-600 text-white truncate">
                        {task.title}
                      </span>
                    )}
                    {/* Progress % */}
                    {width > 60 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-700 text-white/90">
                        {task.progress}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
