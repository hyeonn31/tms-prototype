// Sidebar.tsx — TMS Navigation Sidebar
// Design: Dark navy sidebar with indigo accent, icon + label nav items
import { useState } from "react";
import {
  LayoutDashboard,
  Kanban,
  List,
  GanttChart,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Users,
  Settings,
  Bell,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import type { ViewMode } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mockData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
  { id: "board", label: "칸반 보드", icon: Kanban },
  { id: "table", label: "테이블 뷰", icon: List },
  { id: "timeline", label: "타임라인", icon: GanttChart },
];

export default function Sidebar() {
  const { viewMode, setViewMode } = useTaskContext();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b border-sidebar-border",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <CheckSquare className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-700 text-sidebar-foreground tracking-tight">TMS</span>
            <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">Task Manager</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto tms-scroll">
        <div className={cn("px-3 mb-1", collapsed && "px-2")}>
          {!collapsed && (
            <p className="text-[10px] font-600 text-sidebar-foreground/40 uppercase tracking-widest mb-2 px-1">
              뷰
            </p>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = viewMode === item.id;
            const btn = (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-all duration-150",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </div>

        {/* Team Members */}
        {!collapsed && (
          <div className="px-3 mt-4">
            <p className="text-[10px] font-600 text-sidebar-foreground/40 uppercase tracking-widest mb-2 px-1">
              팀원
            </p>
            <div className="space-y-0.5">
              {MOCK_USERS.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-600 text-white"
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      {user.initials[0]}
                    </div>
                    <Circle
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-emerald-400 text-emerald-400"
                    />
                  </div>
                  <span className="text-xs text-sidebar-foreground/70 truncate">
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom actions */}
      <div className={cn(
        "border-t border-sidebar-border py-3 px-3 space-y-1",
        collapsed && "px-2"
      )}>
        {[
          { icon: Bell, label: "알림" },
          { icon: Users, label: "팀 관리" },
          { icon: Settings, label: "설정" },
        ].map(({ icon: Icon, label }) => {
          const btn = (
            <button
              key={label}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                collapsed && "justify-center px-2"
              )}
              onClick={() => {}}
            >
              <Icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
              {!collapsed && <span>{label}</span>}
            </button>
          );
          if (collapsed) {
            return (
              <Tooltip key={label}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }
          return btn;
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <div className="flex items-center gap-1 text-xs">
            <ChevronLeft className="w-4 h-4" />
            <span>접기</span>
          </div>
        )}
      </button>
    </aside>
  );
}
