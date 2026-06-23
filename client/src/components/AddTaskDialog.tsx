// AddTaskDialog.tsx — New Task Creation Dialog
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskContext } from "@/contexts/TaskContext";
import { MOCK_USERS, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/mockData";
import type { TaskStatus, TaskPriority } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export default function AddTaskDialog({ open, onClose, defaultStatus }: Props) {
  const { addTask } = useTaskContext();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || "TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState(MOCK_USERS[0].id);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("태스크명을 입력해주세요.");
      return;
    }
    addTask({ title: title.trim(), status, priority, assigneeId, dueDate, description });
    toast.success("태스크가 추가되었습니다.");
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-700">새 태스크 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-600">태스크명 *</Label>
            <Input
              placeholder="태스크명을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-600">설명</Label>
            <textarea
              placeholder="태스크 설명을 입력하세요 (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-600">상태</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
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
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-600">우선순위</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["HIGHEST", "HIGH", "MEDIUM", "LOW"] as TaskPriority[]).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-600">담당자</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_USERS.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-600">마감일</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button size="sm" onClick={handleSubmit} className="font-600">
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
