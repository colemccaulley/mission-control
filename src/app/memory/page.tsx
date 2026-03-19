"use client";

import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MemoryEntry {
  filename: string;
  date: string;
  preview: string;
  content: string;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [longTermMemory, setLongTermMemory] = useState<string>("");
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"daily" | "long-term">("daily");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMemories = useCallback(async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/memory${params}`);
    const data = await res.json();
    setMemories(data);
    setLoading(false);
  }, [search]);

  const fetchLongTerm = useCallback(async () => {
    const res = await fetch("/api/memory?type=long-term");
    const data = await res.json();
    setLongTermMemory(data.content || "");
  }, []);

  useEffect(() => {
    fetchMemories();
    fetchLongTerm();
  }, [fetchMemories, fetchLongTerm]);

  // Group memories by month
  const grouped = memories.reduce<Record<string, MemoryEntry[]>>((acc, m) => {
    const monthKey = m.date.slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(m);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Memory</h1>
            <p className="text-xs text-text-muted mt-0.5">
              {memories.length} memory files
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex bg-bg-tertiary rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "daily"
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Daily Memories
            </button>
            <button
              onClick={() => setActiveTab("long-term")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "long-term"
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              MEMORY.md
            </button>
          </div>

          {activeTab === "daily" && (
            <div className="flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search memories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeTab === "long-term" ? (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto bg-bg-secondary border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-blue">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-sm font-medium">MEMORY.md</span>
                <span className="text-xs text-text-muted">Long-term memory</span>
              </div>
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {longTermMemory}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Timeline sidebar */}
            <div className="w-72 border-r border-border overflow-y-auto shrink-0">
              {loading ? (
                <div className="p-4 text-xs text-text-muted">Loading...</div>
              ) : memories.length === 0 ? (
                <div className="p-4">
                  <p className="text-xs text-text-muted">
                    {search
                      ? "No memories match your search."
                      : "No memory files found. Memory files should be stored as YYYY-MM-DD.md files."}
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([month, entries]) => (
                  <div key={month}>
                    <div className="px-4 py-2 bg-bg-secondary text-xs font-medium text-text-muted uppercase tracking-wider sticky top-0">
                      {new Date(month + "-01").toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    {entries.map((memory) => (
                      <button
                        key={memory.filename}
                        onClick={() => setSelectedMemory(memory)}
                        className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${
                          selectedMemory?.filename === memory.filename
                            ? "bg-bg-tertiary"
                            : "hover:bg-bg-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                          <span className="text-xs font-medium text-text-primary">
                            {new Date(memory.date + "T12:00:00").toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted line-clamp-2 ml-3.5">
                          {memory.preview}
                        </p>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedMemory ? (
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <span className="text-sm font-medium">
                      {new Date(selectedMemory.date + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-text-muted font-mono">
                      {selectedMemory.filename}
                    </span>
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedMemory.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-text-muted">
                    Select a memory entry to view
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
