// DashboardView.tsx — Dashboard with KPI widgets and charts
import { useMemo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { STATUS_CONFIG, PRIORITY_CONFIG, MOCK_USERS } from "@/lib/mockData";
import type { TaskStatus } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-600 text-muted-foreground mb-0.5">{title}</p>
        <p className="text-2xl font-800 text-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function MiniProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full rounded-full progress-bar-fill"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function DashboardView() {
  const { tasks, selectTask } = useTaskContext();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== "DONE" &&
        t.status !== "HOLD" &&
        new Date(t.dueDate) < new Date()
    ).length;
    const dueSoon = tasks.filter((t) => {
      const diff = new Date(t.dueDate).getTime() - Date.now();
      return (
        t.status !== "DONE" &&
        t.status !== "HOLD" &&
        diff > 0 &&
        diff < 3 * 24 * 60 * 60 * 1000
      );
    }).length;
    const urgent = tasks.filter((t) => t.priority === "HIGHEST").length;

    const byStatus: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
      HOLD: 0,
    };
    tasks.forEach((t) => byStatus[t.status]++);

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      inProgress,
      overdue,
      dueSoon,
      urgent,
      byStatus,
      completionRate,
    };
  }, [tasks]);

  // Per-member stats
  const memberStats = useMemo(() => {
    return MOCK_USERS.map((user) => {
      const userTasks = tasks.filter((t) => t.assigneeId === user.id);
      const done = userTasks.filter((t) => t.status === "DONE").length;
      const total = userTasks.length;
      const avgProgress =
        total > 0
          ? Math.round(
              userTasks.reduce((s, t) => s + t.progress, 0) / total
            )
          : 0;
      return { user, total, done, avgProgress };
    });
  }, [tasks]);

  // Recent activity tasks
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  }, [tasks]);

  // Urgent tasks
  const urgentTasks = useMemo(() => {
    return tasks
      .filter(
        (t) =>
          (t.priority === "HIGHEST" || t.priority === "HIGH") &&
          t.status !== "DONE" &&
          t.status !== "HOLD"
      )
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="h-full overflow-y-auto tms-scroll p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="전체 태스크"
            value={stats.total}
            subtitle={`완료율 ${stats.completionRate}%`}
            icon={TrendingUp}
            color="#4F46E5"
            bg="#EEF2FF"
          />
          <StatCard
            title="완료"
            value={stats.done}
            subtitle="DONE"
            icon={CheckCircle2}
            color="#059669"
            bg="#ECFDF5"
          />
          <StatCard
            title="진행중"
            value={stats.inProgress}
            subtitle="IN PROGRESS"
            icon={Clock}
            color="#2563EB"
            bg="#EFF6FF"
          />
          <StatCard
            title="기한 초과"
            value={stats.overdue}
            subtitle="OVERDUE"
            icon={AlertTriangle}
            color="#DC2626"
            bg="#FEF2F2"
          />
          <StatCard
            title="마감 임박"
            value={stats.dueSoon}
            subtitle="3일 이내"
            icon={Clock}
            color="#D97706"
            bg="#FFFBEB"
          />
          <StatCard
            title="긴급 태스크"
            value={stats.urgent}
            subtitle="HIGHEST"
            icon={Zap}
            color="#DC2626"
            bg="#FEF2F2"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-4">상태별 분포</h3>
            <div className="space-y-3">
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => {
                const cfg = STATUS_CONFIG[status];
                const count = stats.byStatus[status];
                const pct =
                  stats.total > 0
                    ? Math.round((count / stats.total) * 100)
                    : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span className="text-xs font-500 text-foreground/80">
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-600 text-foreground">
                          {count}
                        </span>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <MiniProgressBar value={pct} color={cfg.color} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              팀원별 현황
            </h3>
            <div className="space-y-3">
              {memberStats.map(({ user, total, done, avgProgress }) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-600 text-white flex-shrink-0"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.initials[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-600 text-foreground">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {done}/{total} 완료
                      </span>
                    </div>
                    <MiniProgressBar
                      value={total > 0 ? (done / total) * 100 : 0}
                      color={user.avatarColor}
                    />
                  </div>
                  <span className="text-xs font-700 text-foreground/60 w-8 text-right">
                    {avgProgress}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-4">우선순위 분포</h3>
            <div className="space-y-3">
              {(["HIGHEST", "HIGH", "MEDIUM", "LOW"] as const).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const count = tasks.filter((t) => t.priority === p).length;
                const pct =
                  tasks.length > 0
                    ? Math.round((count / tasks.length) * 100)
                    : 0;
                return (
                  <div key={p}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-500 text-foreground/80">
                        {cfg.icon} {cfg.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-600 text-foreground">
                          {count}
                        </span>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <MiniProgressBar value={pct} color={cfg.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Tasks */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-destructive" />
              긴급/높음 우선순위 태스크
            </h3>
            <div className="space-y-2">
              {urgentTasks.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  긴급 태스크 없음
                </p>
              )}
              {urgentTasks.map((task) => {
                const statusCfg = STATUS_CONFIG[task.status];
                const priorityCfg = PRIORITY_CONFIG[task.priority];
                const user = MOCK_USERS.find((u) => u.id === task.assigneeId);
                return (
                  <div
                    key={task.id}
                    onClick={() => selectTask(task)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-border/60"
                  >
                    <span
                      className="text-sm font-700"
                    >
                      {priorityCfg.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-foreground truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[10px] font-500"
                          style={{ color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </span>
                        <span className="text-muted-foreground text-[10px]">·</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(task.dueDate).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {user && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-600 text-white flex-shrink-0"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.initials[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-700 text-foreground mb-4">최근 업데이트</h3>
            <div className="space-y-2">
              {recentTasks.map((task) => {
                const statusCfg = STATUS_CONFIG[task.status];
                const user = MOCK_USERS.find((u) => u.id === task.assigneeId);
                const updatedAt = new Date(task.updatedAt);
                const timeAgo = (() => {
                  const diff = Date.now() - updatedAt.getTime();
                  const hours = Math.floor(diff / (1000 * 60 * 60));
                  if (hours < 1) return "방금 전";
                  if (hours < 24) return `${hours}시간 전`;
                  return `${Math.floor(hours / 24)}일 전`;
                })();

                return (
                  <div
                    key={task.id}
                    onClick={() => selectTask(task)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: statusCfg.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-foreground truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={cn(
                            "text-[10px] font-600 px-1.5 py-0.5 rounded-full"
                          )}
                          style={{
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.color,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {user && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-600 text-white mb-1 ml-auto"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.initials[0]}
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
