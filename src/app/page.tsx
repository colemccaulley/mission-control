"use client";

import { useEffect, useState, useCallback } from "react";
import type { Task, TaskStatus, TaskPriority, Assignee } from "@/lib/types";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-green-500/20 text-green-400",
};

const ASSIGNEE_BORDER: Record<Assignee, string> = {
  Cole: "border-l-cole",
  Hal: "border-l-hal",
};

function TaskCard({
  task,
  onMove,
  onDelete,
}: {
  task: Task;
  onMove: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const colIndex = COLUMNS.findIndex((c) => c.key === task.status);

  return (
    <div
      className={`bg-bg-elevated border border-border rounded-lg p-3 border-l-[3px] ${ASSIGNEE_BORDER[task.assignee]} transition-all duration-150 hover:border-border-light group`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-text-primary leading-snug">
          {task.title}
        </h3>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all text-xs shrink-0"
          title="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {task.description && (
        <p className="text-xs text-text-muted mt-1.5 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </span>
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
              task.assignee === "Cole" ? "bg-cole" : "bg-hal"
            }`}
          >
            {task.assignee[0]}
          </span>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {colIndex > 0 && (
            <button
              onClick={() => onMove(task.id, COLUMNS[colIndex - 1].key)}
              className="text-text-muted hover:text-text-primary p-0.5"
              title={`Move to ${COLUMNS[colIndex - 1].label}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {colIndex < COLUMNS.length - 1 && (
            <button
              onClick={() => onMove(task.id, COLUMNS[colIndex + 1].key)}
              className="text-text-muted hover:text-text-primary p-0.5"
              title={`Move to ${COLUMNS[colIndex + 1].label}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<Assignee>("Cole");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("backlog");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">New Task</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue resize-none h-20"
          />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as Assignee)}
                className="w-full bg-bg-tertiary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              >
                <option value="Cole">Cole</option>
                <option value="Hal">Hal</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-bg-tertiary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-bg-tertiary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              >
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onSubmit({ title, description, assignee, priority, status });
              }
            }}
            className="px-4 py-1.5 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNewTask, setShowNewTask] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const moveTask = async (id: string, status: TaskStatus) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const createTask = async (task: Partial<Task>) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    setShowNewTask(false);
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Task Board</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {tasks.length} tasks across {COLUMNS.length} columns
          </p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.key);
            return (
              <div
                key={column.key}
                className="w-72 flex flex-col bg-bg-secondary/50 rounded-xl border border-border"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-text-secondary">
                      {column.label}
                    </h2>
                    <span className="text-xs text-text-muted bg-bg-hover px-1.5 py-0.5 rounded">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMove={moveTask}
                      onDelete={deleteTask}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="text-xs text-text-muted text-center py-8">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showNewTask && (
        <NewTaskModal
          onClose={() => setShowNewTask(false)}
          onSubmit={createTask}
        />
      )}
    </div>
  );
}
