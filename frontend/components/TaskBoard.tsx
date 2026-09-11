"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Project, Task } from "@/types";
import { createTask, deleteTask, updateTask, updateTaskStatus } from "@/lib/api";
import { Check, LoaderCircle, Pencil, Trash2, X } from "lucide-react";

const COLUMNS: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function TaskBoard({
  projectId,
  initialTasks,
  members,
  canManage
}: {
  projectId: string;
  initialTasks: Task[];
  members: Project["members"];
  canManage: boolean;
}) {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsAdding(true);
    setError("");
    try {
      const newTask = await createTask(getToken, { title: title.trim(), project: projectId,assignedTo:assignedTo || undefined });
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setAssignedTo("")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add task.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    const previousTask = tasks.find((task) => task._id === taskId);
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      await updateTaskStatus(getToken, taskId, status);
    } catch (requestError) {
      if (previousTask) setTasks((prev) => prev.map((task) => task._id === taskId ? previousTask : task));
      setError(requestError instanceof Error ? requestError.message : "Could not update task.");
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditAssignedTo(task.assignedTo?._id || "");
    setError("");
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setError("");
  };

  const handleTaskUpdate = async (event: React.FormEvent, taskId: string) => {
    event.preventDefault();
    if (!editTitle.trim()) {
      setError("Task title is required.");
      return;
    }
    setSavingTaskId(taskId);
    setError("");
    try {
      const updatedTask = await updateTask(getToken, taskId, {
        title: editTitle.trim(),
        priority: editPriority,
        assignedTo: editAssignedTo || null,
      });
      setTasks((prev) => prev.map((task) => task._id === taskId ? { ...task, ...updatedTask } : task));
      setEditingTaskId(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update task.");
    } finally {
      setSavingTaskId(null);
    }
  };

  const handleTaskDelete = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setDeletingTaskId(task._id);
    setError("");
    try {
      await deleteTask(getToken, task._id);
      setTasks((prev) => prev.filter((item) => item._id !== task._id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete task.");
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div>
      {canManage && <form onSubmit={handleAddTask} className="mb-5 flex min-w-0 flex-col gap-2.5 rounded-2xl border border-[#dfe4df] bg-white p-3 shadow-[0_12px_35px_rgba(22,51,59,.05)] sm:flex-row sm:gap-3 sm:p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add new task..."
          className="focus-ring min-w-0 flex-1 rounded-xl border border-[#dfe4df] bg-[#f6f7f4] px-3 py-3 text-sm outline-none transition focus:border-[#2d7a72]"
        />
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="focus-ring min-w-0 rounded-xl border border-[#dfe4df] bg-[#f6f7f4] px-3 py-3 text-sm text-[#69737d] outline-none focus:border-[#2d7a72] sm:max-w-48"
        >
          <option value="">Unassigned</option>
          {members?.map((m) => (
            <option key={m.user._id} value={m.user._id}>
              {m.user.name || m.user.email}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isAdding}
          className="button-shine focus-ring rounded-xl bg-[#16333b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d7a72] disabled:opacity-60"
        >
          {isAdding ? "Adding..." : "Add task"}
        </button>
      </form>}
      {error && <p className="mb-5 rounded-xl bg-[#fbe9e4] px-4 py-3 text-sm text-[#c4513d]">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="column-surface min-h-64 rounded-2xl border border-[#dfe4df] bg-[#edf0ec]/70 p-3">
            <h4 className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[.14em] text-[#69737d]">
              {col.label}<span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[11px] text-[#16333b]">{tasks.filter((t) => t.status === col.key).length}</span>
            </h4>
            <div className="flex flex-col gap-2">
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <div
                    key={task._id}
                    className="task-card rounded-xl border border-[#dfe4df] bg-white p-4 shadow-[0_8px_20px_rgba(22,51,59,.05)] transition duration-300 hover:-translate-y-1 hover:border-[#b8cdc8] hover:shadow-[0_12px_25px_rgba(22,51,59,.09)]"
                  >
                    {editingTaskId === task._id ? (
                      <form onSubmit={(event) => handleTaskUpdate(event, task._id)}>
                        <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={160} autoFocus className="focus-ring w-full rounded-lg border border-[#dfe4df] bg-[#f6f7f4] px-2.5 py-2 text-sm font-bold text-[#16333b] outline-none focus:border-[#2d7a72]" />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <select value={editPriority} onChange={(event) => setEditPriority(event.target.value as Task["priority"])} className="focus-ring rounded-lg border border-[#dfe4df] bg-[#f6f7f4] px-2 py-2 text-[11px] text-[#69737d] outline-none">
                            {(["low", "medium", "high"] as Task["priority"][]).map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                          </select>
                          <select value={editAssignedTo} onChange={(event) => setEditAssignedTo(event.target.value)} className="focus-ring min-w-0 rounded-lg border border-[#dfe4df] bg-[#f6f7f4] px-2 py-2 text-[11px] text-[#69737d] outline-none">
                            <option value="">Unassigned</option>
                            {members?.map((member) => <option key={member.user._id} value={member.user._id}>{member.user.name || member.user.email}</option>)}
                          </select>
                        </div>
                        <div className="mt-3 flex justify-end gap-1">
                          <button type="button" onClick={cancelEditing} className="focus-ring rounded-lg p-1.5 text-[#69737d] hover:bg-[#edf0ec]" aria-label="Cancel task edit"><X className="size-4" /></button>
                          <button type="submit" disabled={savingTaskId === task._id} className="focus-ring rounded-lg bg-[#dcefe8] p-1.5 text-[#287264] hover:bg-[#c7e5da] disabled:opacity-50" aria-label="Save task"><Check className="size-4" /></button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2"><p className="text-sm font-bold leading-5 text-[#16333b]">{task.title}</p>{canManage && <div className="flex shrink-0 gap-1"><button type="button" onClick={() => startEditing(task)} className="focus-ring rounded-lg p-1 text-[#69737d] hover:bg-[#edf0ec] hover:text-[#2d7a72]" aria-label="Edit task" title="Edit task"><Pencil className="size-3.5" /></button><button type="button" onClick={() => handleTaskDelete(task)} disabled={deletingTaskId === task._id} className="focus-ring rounded-lg p-1 text-[#c4513d] hover:bg-[#fbe9e4] disabled:opacity-50" aria-label="Delete task" title="Delete task">{deletingTaskId === task._id ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}</button></div>}</div>
                        {task.assignedTo && <p className="mt-1 text-xs text-gray-400">{task.assignedTo.name || task.assignedTo.email}</p>}
                        <div className="mt-2 flex items-center justify-between"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] ${priorityColors[task.priority]}`}>{task.priority}</span>{canManage ? <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value as Task["status"])} className="focus-ring rounded-lg border border-[#dfe4df] bg-[#f6f7f4] px-2 py-1 text-[11px] text-[#69737d] outline-none">{COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select> : <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#a0aaa9]">View only</span>}</div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}