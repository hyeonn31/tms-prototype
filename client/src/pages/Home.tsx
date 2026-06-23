// Home.tsx — Main TMS Application Page
// Layout: Sidebar (left) + FilterBar (top) + MainContent (center) + TaskDrawer (right overlay)
import { useTaskContext } from "@/contexts/TaskContext";
import Sidebar from "@/components/Sidebar";
import FilterBar from "@/components/FilterBar";
import KanbanBoard from "@/components/KanbanBoard";
import TableView from "@/components/TableView";
import TimelineView from "@/components/TimelineView";
import DashboardView from "@/components/DashboardView";
import TaskDrawer from "@/components/TaskDrawer";

export default function Home() {
  const { viewMode } = useTaskContext();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Filter Bar */}
        <FilterBar />

        {/* View Content */}
        <main className="flex-1 overflow-hidden p-4">
          {viewMode === "dashboard" && <DashboardView />}
          {viewMode === "board" && <KanbanBoard />}
          {viewMode === "table" && <TableView />}
          {viewMode === "timeline" && <TimelineView />}
        </main>
      </div>

      {/* Right Drawer (overlay) */}
      <TaskDrawer />
    </div>
  );
}
