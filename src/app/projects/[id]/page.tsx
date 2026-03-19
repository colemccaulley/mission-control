"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import type { Project, Task, TaskPriority } from "@/lib/types";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-green-500/20 text-green-400",
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<(Project & { tasks: Task[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Project not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/projects"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <span className="text-xs text-text-muted bg-bg-hover px-2 py-0.5 rounded-full ml-1">
            {project.status}
          </span>
        </div>
        <p className="text-sm text-text-secondary ml-7">
          {project.description}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-6">
          {/* Progress */}
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Progress</h3>
              <span className="text-sm font-medium" style={{ color: project.color }}>
                {project.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-bg-hover rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: project.color,
                }}
              />
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Linked Tasks
              <span className="text-text-muted ml-2">
                ({project.tasks.length})
              </span>
            </h3>
            {project.tasks.length === 0 ? (
              <div className="bg-bg-secondary border border-border rounded-xl p-8 text-center">
                <p className="text-sm text-text-muted">
                  No tasks linked to this project yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-bg-secondary border border-border rounded-lg p-3 border-l-[3px] ${
                      task.assignee === "Cole" ? "border-l-cole" : "border-l-hal"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-text-muted bg-bg-hover px-1.5 py-0.5 rounded">
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-xs text-text-muted mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                          task.assignee === "Cole" ? "bg-cole" : "bg-hal"
                        }`}
                      >
                        {task.assignee[0]}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
