// FilterBar.tsx — TMS Top Filter Bar
// Design: Clean white bar with search, filter chips, sort controls
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  User,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { MOCK_USERS, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/mockData";
import type { TaskStatus, TaskPriority } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddTaskDialog from "./AddTaskDialog";

export default function FilterBar() {
  const { filter, setFilter, viewMode } = useTaskContext();
  const [addOpen, setAddOpen] = useState(false);

  const activeFilterCount =
    (filter.myTasksOnly ? 1 : 0) +
    filter.status.length +
    filter.priority.length +
    filter.assigneeIds.length;

  const toggleStatus = (s: TaskStatus) => {
    setFilter({
      status: filter.status.includes(s)
        ? filter.status.filter((x) => x !== s)
        : [...filter.status, s],
    });
  };

  const togglePriority = (p: TaskPriority) => {
    setFilter({
      priority: filter.priority.includes(p)
        ? filter.priority.filter((x) => x !== p)
        : [...filter.priority, p],
    });
  };

  const toggleAssignee = (id: string) => {
    setFilter({
      assigneeIds: filter.assigneeIds.includes(id)
        ? filter.assigneeIds.filter((x) => x !== id)
        : [...filter.assigneeIds, id],
    });
  };

  const VIEW_LABELS: Record<string, string> = {
    dashboard: "대시보드",
    board: "칸반 보드",
    table: "테이블 뷰",
    timeline: "타임라인",
  };

  return (
    <>
      <div className="flex items-center gap-3 px-5 py-3 bg-card border-b border-border">
        {/* View Title */}
        <h2 className="text-sm font-700 text-foreground/80 min-w-[80px]">
          {VIEW_LABELS[viewMode]}
        </h2>

        <div className="w-px h-4 bg-border" />

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="태스크 검색..."
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/60 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:bg-card transition-all"
          />
          {filter.search && (
            <button
              onClick={() => setFilter({ search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* My Tasks Toggle */}
        <button
          onClick={() => setFilter({ myTasksOnly: !filter.myTasksOnly })}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 border transition-all",
            filter.myTasksOnly
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
          )}
        >
          <User className="w-3.5 h-3.5" />
          내 업무
        </button>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 border transition-all",
                filter.status.length > 0
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              상태
              {filter.status.length > 0 && (
                <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground">
                  {filter.status.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">상태 필터</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={filter.status.includes(s)}
                onCheckedChange={() => toggleStatus(s)}
                className="text-xs"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: STATUS_CONFIG[s].color }}
                />
                {STATUS_CONFIG[s].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 border transition-all",
                filter.priority.length > 0
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              우선순위
              {filter.priority.length > 0 && (
                <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground">
                  {filter.priority.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">우선순위 필터</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["HIGHEST", "HIGH", "MEDIUM", "LOW"] as TaskPriority[]).map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={filter.priority.includes(p)}
                onCheckedChange={() => togglePriority(p)}
                className="text-xs"
              >
                <span className="mr-2">{PRIORITY_CONFIG[p].icon}</span>
                {PRIORITY_CONFIG[p].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Assignee Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 border transition-all",
                filter.assigneeIds.length > 0
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              담당자
              {filter.assigneeIds.length > 0 && (
                <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground">
                  {filter.assigneeIds.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs">담당자 필터</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {MOCK_USERS.map((u) => (
              <DropdownMenuCheckboxItem
                key={u.id}
                checked={filter.assigneeIds.includes(u.id)}
                onCheckedChange={() => toggleAssignee(u.id)}
                className="text-xs"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-600 text-white mr-2"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {u.initials[0]}
                </div>
                {u.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 border border-border bg-card text-muted-foreground hover:border-primary/50 transition-all">
              <ArrowUpDown className="w-3.5 h-3.5" />
              정렬
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs">정렬 기준</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={filter.sortBy}
              onValueChange={(v) => setFilter({ sortBy: v as typeof filter.sortBy })}
            >
              <DropdownMenuRadioItem value="dueDate" className="text-xs">마감일순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="priority" className="text-xs">우선순위순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="createdAt" className="text-xs">생성일순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="title" className="text-xs">이름순</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={filter.sortDir}
              onValueChange={(v) => setFilter({ sortDir: v as "asc" | "desc" })}
            >
              <DropdownMenuRadioItem value="asc" className="text-xs">오름차순</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc" className="text-xs">내림차순</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={() =>
              setFilter({
                myTasksOnly: false,
                status: [],
                priority: [],
                assigneeIds: [],
                search: "",
              })
            }
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
            초기화 ({activeFilterCount})
          </button>
        )}

        <div className="flex-1" />

        {/* Add Task */}
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs font-600"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" />
          태스크 추가
        </Button>
      </div>

      <AddTaskDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
