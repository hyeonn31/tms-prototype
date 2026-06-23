import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Task,
  TaskStatus,
  FilterState,
  ViewMode,
  Comment,
  SubTask,
} from "@/lib/types";
import { MOCK_TASKS, CURRENT_USER } from "@/lib/mockData";
import { nanoid } from "nanoid";

interface TaskContextValue {
  tasks: Task[];
  selectedTask: Task | null;
  viewMode: ViewMode;
  filter: FilterState;
  drawerOpen: boolean;

  setViewMode: (mode: ViewMode) => void;
  setFilter: (patch: Partial<FilterState>) => void;
  selectTask: (task: Task | null) => void;
  closeDrawer: () => void;

  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  addComment: (
    taskId: string,
    content: string,
    type: Comment["type"]
  ) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  addTask: (task: Partial<Task>) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;

  filteredTasks: Task[];
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [filter, setFilterState] = useState<FilterState>({
    myTasksOnly: false,
    status: [],
    priority: [],
    assigneeIds: [],
    search: "",
    sortBy: "dueDate",
    sortDir: "asc",
  });

  const setFilter = useCallback((patch: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const selectTask = useCallback(
    (task: Task | null) => {
      if (task) {
        // Always get latest from tasks array
        const latest = tasks.find((t) => t.id === task.id) || task;
        setSelectedTask(latest);
        setDrawerOpen(true);
      } else {
        setSelectedTask(null);
        setDrawerOpen(false);
      }
    },
    [tasks]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  }, []);

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      const STATUS_LABELS: Record<TaskStatus, string> = {
        TODO: "대기",
        IN_PROGRESS: "진행중",
        REVIEW: "검토/QA",
        DONE: "완료",
        HOLD: "보류",
      };
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const newLog = {
            id: nanoid(),
            taskId,
            userId: CURRENT_USER.id,
            actionType: "STATUS_CHANGED",
            description: "상태를 변경했습니다.",
            details: {
              from: STATUS_LABELS[t.status],
              to: STATUS_LABELS[status],
            },
            createdAt: new Date().toISOString(),
          };
          const updated = {
            ...t,
            status,
            progress: status === "DONE" ? 100 : t.progress,
            activityLog: [...t.activityLog, newLog],
            updatedAt: new Date().toISOString(),
          };
          return updated;
        })
      );
      setSelectedTask((prev) => {
        if (!prev || prev.id !== taskId) return prev;
        return { ...prev, status };
      });
    },
    []
  );

  const updateTaskProgress = useCallback(
    (taskId: string, progress: number) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, progress, updatedAt: new Date().toISOString() }
            : t
        )
      );
    },
    []
  );

  const addComment = useCallback(
    (taskId: string, content: string, type: Comment["type"]) => {
      const newComment: Comment = {
        id: nanoid(),
        taskId,
        userId: CURRENT_USER.id,
        type,
        content,
        createdAt: new Date().toISOString(),
        mentions: [],
      };
      const newLog = {
        id: nanoid(),
        taskId,
        userId: CURRENT_USER.id,
        actionType: "COMMENT_ADDED",
        description: "댓글을 추가했습니다.",
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: [...t.comments, newComment],
                activityLog: [...t.activityLog, newLog],
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      setSelectedTask((prev) => {
        if (!prev || prev.id !== taskId) return prev;
        return {
          ...prev,
          comments: [...prev.comments, newComment],
          activityLog: [...prev.activityLog, newLog],
        };
      });
    },
    []
  );

  const toggleSubTask = useCallback((taskId: string, subTaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = t.subTasks.map((s) =>
          s.id === subTaskId ? { ...s, completed: !s.completed } : s
        );
        const completedCount = updatedSubs.filter((s) => s.completed).length;
        const progress =
          updatedSubs.length > 0
            ? Math.round((completedCount / updatedSubs.length) * 100)
            : t.progress;
        return {
          ...t,
          subTasks: updatedSubs,
          progress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      const updatedSubs = prev.subTasks.map((s) =>
        s.id === subTaskId ? { ...s, completed: !s.completed } : s
      );
      const completedCount = updatedSubs.filter((s) => s.completed).length;
      const progress =
        updatedSubs.length > 0
          ? Math.round((completedCount / updatedSubs.length) * 100)
          : prev.progress;
      return { ...prev, subTasks: updatedSubs, progress };
    });
  }, []);

  const addSubTask = useCallback((taskId: string, title: string) => {
    const newSub: SubTask = {
      id: nanoid(),
      title,
      completed: false,
      assigneeId: CURRENT_USER.id,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = [...t.subTasks, newSub];
        const completedCount = updatedSubs.filter((s) => s.completed).length;
        const progress = Math.round(
          (completedCount / updatedSubs.length) * 100
        );
        return {
          ...t,
          subTasks: updatedSubs,
          progress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      const updatedSubs = [...prev.subTasks, newSub];
      const completedCount = updatedSubs.filter((s) => s.completed).length;
      const progress = Math.round((completedCount / updatedSubs.length) * 100);
      return { ...prev, subTasks: updatedSubs, progress };
    });
  }, []);

  const addTask = useCallback((partial: Partial<Task>) => {
    const newTask: Task = {
      id: nanoid(),
      title: partial.title || "새 태스크",
      description: partial.description || "",
      status: partial.status || "TODO",
      priority: partial.priority || "MEDIUM",
      progress: 0,
      dueDate:
        partial.dueDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      startDate: partial.startDate || new Date().toISOString().split("T")[0],
      assigneeId: partial.assigneeId || CURRENT_USER.id,
      creatorId: CURRENT_USER.id,
      subTasks: [],
      comments: [],
      activityLog: [
        {
          id: nanoid(),
          taskId: "",
          userId: CURRENT_USER.id,
          actionType: "TASK_CREATED",
          description: "태스크를 생성했습니다.",
          createdAt: new Date().toISOString(),
        },
      ],
      dependencies: [],
      tags: partial.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newTask.activityLog[0].taskId = newTask.id;
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, ...patch, updatedAt: new Date().toISOString() }
          : t
      )
    );
    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return { ...prev, ...patch };
    });
  }, []);

  // Filtering logic
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];

    if (filter.myTasksOnly) {
      result = result.filter((t) => t.assigneeId === CURRENT_USER.id);
    }
    if (filter.status.length > 0) {
      result = result.filter((t) => filter.status.includes(t.status));
    }
    if (filter.priority.length > 0) {
      result = result.filter((t) => filter.priority.includes(t.priority));
    }
    if (filter.assigneeIds.length > 0) {
      result = result.filter((t) =>
        filter.assigneeIds.includes(t.assigneeId)
      );
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    const PRIORITY_ORDER: Record<string, number> = {
      HIGHEST: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    result.sort((a, b) => {
      let cmp = 0;
      if (filter.sortBy === "dueDate") {
        cmp =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (filter.sortBy === "priority") {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else if (filter.sortBy === "createdAt") {
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (filter.sortBy === "title") {
        cmp = a.title.localeCompare(b.title);
      }
      return filter.sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, filter]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        selectedTask,
        viewMode,
        filter,
        drawerOpen,
        setViewMode,
        setFilter,
        selectTask,
        closeDrawer,
        updateTaskStatus,
        updateTaskProgress,
        addComment,
        toggleSubTask,
        addSubTask,
        addTask,
        updateTask,
        filteredTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider");
  return ctx;
}
