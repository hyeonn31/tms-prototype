// TaskDrawer.tsx — Right-side Task Detail Drawer
// Design: Slide-in panel with full task details, subtasks, comments, activity log
import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronDown,
  Plus,
  Send,
  CheckSquare,
  Square,
  MessageSquare,
  Activity,
  GitBranch,
  Calendar,
  User,
  Tag,
  Trash2,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  MOCK_USERS,
  ISSUE_TYPE_CONFIG,
  CURRENT_USER,
} from "@/lib/mockData";
import type { TaskStatus, TaskPriority, Comment } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function UserAvatar({ userId, size = "md" }: { userId: string; size?: "sm" | "md" | "lg" }) {
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) return null;
  const sizeClass = size === "sm" ? "w-5 h-5 text-[9px]" : size === "lg" ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs";
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-600 text-white flex-shrink-0", sizeClass)}
      style={{ backgroundColor: user.avatarColor }}
      title={user.name}
    >
      {user.initials[0]}
    </div>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function CommentItem({ comment }: { comment: Comment }) {
  const user = MOCK_USERS.find((u) => u.id === comment.userId);
  const typeCfg = ISSUE_TYPE_CONFIG[comment.type];
  return (
    <div className="flex gap-3">
      <UserAvatar userId={comment.userId} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-700 text-foreground">{user?.name}</span>
          <span
            className="text-[10px] font-600 px-1.5 py-0.5 rounded"
            style={{ backgroundColor: typeCfg.bg, color: typeCfg.color }}
          >
            {typeCfg.label}
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {formatDateTime(comment.createdAt)}
          </span>
        </div>
        <div className="bg-muted/50 rounded-lg px-3 py-2.5 text-xs text-foreground/80 leading-relaxed">
          {comment.content}
        </div>
      </div>
    </div>
  );
}

export default function TaskDrawer() {
  const {
    selectedTask,
    drawerOpen,
    closeDrawer,
    updateTaskStatus,
    updateTask,
    addComment,
    toggleSubTask,
    addSubTask,
  } = useTaskContext();

  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState<Comment["type"]>("COMMENT");
  const [newSubTask, setNewSubTask] = useState("");
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (drawerOpen) setActiveTab("comments");
  }, [selectedTask?.id, drawerOpen]);

  if (!selectedTask) return null;

  const task = selectedTask;
  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const assignee = MOCK_USERS.find((u) => u.id === task.assigneeId);
  const creator = MOCK_USERS.find((u) => u.id === task.creatorId);
  const completedSubs = task.subTasks.filter((s) => s.completed).length;

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    addComment(task.id, commentText.trim(), commentType);
    setCommentText("");
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    addSubTask(task.id, newSubTask.trim());
    setNewSubTask("");
    setAddingSubTask(false);
  };

  const isOverdue =
    task.status !== "DONE" &&
    task.status !== "HOLD" &&
    new Date(task.dueDate) < new Date();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-30 transition-opacity duration-280",
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[480px] bg-card border-l border-border shadow-2xl z-40",
          "flex flex-col transition-transform duration-280 ease-out",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border bg-card">
          <div className="flex-1 min-w-0">
            {/* Task ID + Status */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-700 text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                #{task.id.slice(0, 6).toUpperCase()}
              </span>
              <Select
                value={task.status}
                onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}
              >
                <SelectTrigger className="h-6 text-[11px] font-600 border-0 p-0 gap-1 w-auto shadow-none bg-transparent focus:ring-0"
                  style={{ color: statusCfg.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: statusCfg.color }}
                  />
                  <SelectValue />
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: STATUS_CONFIG[s].color }}
                      />
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-600 ml-auto"
                style={{ backgroundColor: priorityCfg.bg, color: priorityCfg.color }}
              >
                {priorityCfg.icon} {priorityCfg.label}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-base font-700 text-foreground leading-snug">
              {task.title}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta Info */}
        <div className="px-5 py-3 border-b border-border/60 bg-muted/20">
          <div className="grid grid-cols-2 gap-3">
            {/* Assignee */}
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">담당자</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <UserAvatar userId={task.assigneeId} size="sm" />
                  <span className="text-xs font-600 text-foreground">{assignee?.name}</span>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">마감일</p>
                <p className={cn("text-xs font-600 mt-0.5", isOverdue ? "text-destructive" : "text-foreground")}>
                  {isOverdue && "⚠ "}
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">생성자</p>
                <p className="text-xs font-600 text-foreground mt-0.5">{creator?.name}</p>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">시작일</p>
                <p className="text-xs font-600 text-foreground mt-0.5">{formatDate(task.startDate)}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto tms-scroll">
          {/* Description */}
          {task.description && (
            <div className="px-5 py-4 border-b border-border/60">
              <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-2">
                설명
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Progress */}
          <div className="px-5 py-4 border-b border-border/60">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider">
                진행률
              </h3>
              <span className="text-sm font-700 text-foreground">{task.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full progress-bar-fill"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          {/* Sub-tasks */}
          <div className="px-5 py-4 border-b border-border/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider">
                  하위 작업
                </h3>
                <span className="text-[10px] font-600 text-muted-foreground">
                  {completedSubs}/{task.subTasks.length}
                </span>
              </div>
              <button
                onClick={() => setAddingSubTask(true)}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-600 transition-colors"
              >
                <Plus className="w-3 h-3" />
                추가
              </button>
            </div>

            <div className="space-y-1.5">
              {task.subTasks.map((sub) => {
                const subUser = MOCK_USERS.find((u) => u.id === sub.assigneeId);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <button
                      onClick={() => toggleSubTask(task.id, sub.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {sub.completed ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-xs",
                        sub.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {sub.title}
                    </span>
                    {subUser && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-600 text-white flex-shrink-0 opacity-60 group-hover:opacity-100"
                        style={{ backgroundColor: subUser.avatarColor }}
                      >
                        {subUser.initials[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add subtask input */}
            {addingSubTask && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="하위 작업명 입력..."
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSubTask();
                    if (e.key === "Escape") setAddingSubTask(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/40"
                  autoFocus
                />
                <button
                  onClick={handleAddSubTask}
                  className="px-2.5 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-600 hover:bg-primary/90 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => setAddingSubTask(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Dependencies */}
          {task.dependencies.length > 0 && (
            <div className="px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-xs font-700 text-muted-foreground uppercase tracking-wider">
                  의존성
                </h3>
              </div>
              <div className="space-y-1.5">
                {task.dependencies.map((dep, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                      선행: #{dep.predecessorId.slice(0, 6).toUpperCase()}
                    </span>
                    <span>→</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                      후속: #{dep.successorId.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs: Comments + Activity */}
          <div className="px-5 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4 h-9">
                <TabsTrigger value="comments" className="flex-1 text-xs gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  댓글 ({task.comments.length})
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 text-xs gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  히스토리 ({task.activityLog.length})
                </TabsTrigger>
              </TabsList>

              {/* Comments Tab */}
              <TabsContent value="comments" className="mt-0">
                <div className="space-y-4 mb-4">
                  {task.comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      아직 댓글이 없습니다.
                    </div>
                  )}
                  {task.comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>

                {/* Comment Input */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-muted/30">
                    <UserAvatar userId={CURRENT_USER.id} size="sm" />
                    <span className="text-xs font-600 text-foreground/70">{CURRENT_USER.name}</span>
                    <div className="ml-auto">
                      <Select
                        value={commentType}
                        onValueChange={(v) => setCommentType(v as Comment["type"])}
                      >
                        <SelectTrigger className="h-6 text-[10px] border-0 bg-transparent shadow-none focus:ring-0 gap-1 w-auto px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ISSUE_TYPE_CONFIG) as Comment["type"][]).map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">
                              {ISSUE_TYPE_CONFIG[t].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <textarea
                    ref={commentInputRef}
                    placeholder="댓글을 입력하세요... (@멘션 지원)"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleSubmitComment();
                      }
                    }}
                    className="w-full px-3 py-2.5 text-xs bg-card resize-none h-20 focus:outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground">
                      Ctrl+Enter로 전송
                    </span>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-600 rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      전송
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-0">
                <div className="space-y-1">
                  {task.activityLog.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      활동 내역이 없습니다.
                    </div>
                  )}
                  {[...task.activityLog].reverse().map((log) => {
                    const user = MOCK_USERS.find((u) => u.id === log.userId);
                    return (
                      <div key={log.id} className="flex items-start gap-3 py-2.5">
                        <div className="flex-shrink-0 mt-0.5">
                          <UserAvatar userId={log.userId} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs font-700 text-foreground">
                              {user?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {log.description}
                            </span>
                          </div>
                          {log.details && (
                            <div className="flex items-center gap-1.5 mt-1">
                              {log.details.from && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground line-through">
                                  {log.details.from}
                                </span>
                              )}
                              {log.details.from && log.details.to && (
                                <span className="text-[10px] text-muted-foreground">→</span>
                              )}
                              {log.details.to && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-600">
                                  {log.details.to}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
