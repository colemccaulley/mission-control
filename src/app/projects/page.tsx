"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-500/15 text-green-400",
  "On Hold": "bg-yellow-500/15 text-yellow-400",
  Completed: "bg-blue-500/15 text-blue-400",
  Archived: "bg-gray-500/15 text-gray-400",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {projects.filter((p) => p.status === "Active").length} active projects
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group bg-bg-secondary border border-border rounded-xl p-5 transition-all duration-150 hover:border-border-light hover:bg-bg-tertiary"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                    {project.name}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[project.status] || ""}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-xs text-text-muted mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-muted">Progress</span>
                  <span className="text-[10px] text-text-secondary font-medium">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full h-1 bg-bg-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-text-muted">
                Last activity:{" "}
                {new Date(project.lastActivity).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
