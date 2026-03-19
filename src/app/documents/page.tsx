"use client";

import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocEntry {
  path: string;
  filename: string;
  title: string;
  category: string;
  date: string;
  preview: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Career: "bg-orange-500/15 text-orange-400",
  Meetings: "bg-blue-500/15 text-blue-400",
  Notes: "bg-green-500/15 text-green-400",
  Technical: "bg-purple-500/15 text-purple-400",
  Planning: "bg-yellow-500/15 text-yellow-400",
  General: "bg-gray-500/15 text-gray-400",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocEntry[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<{
    path: string;
    filename: string;
    title: string;
    content: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    const qs = params.toString();
    const res = await fetch(`/api/documents${qs ? `?${qs}` : ""}`);
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const openDocument = async (filePath: string) => {
    const res = await fetch(
      `/api/documents?file=${encodeURIComponent(filePath)}`
    );
    const data = await res.json();
    setSelectedDoc(data);
  };

  const categories = Array.from(
    new Set(documents.map((d) => d.category))
  ).sort();

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Documents</h1>
            <p className="text-xs text-text-muted mt-0.5">
              {documents.length} documents found
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {selectedDoc ? (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to list
              </button>

              <div className="bg-bg-secondary border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-blue">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-sm font-medium">
                    {selectedDoc.title}
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    {selectedDoc.filename}
                  </span>
                </div>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedDoc.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            {loading ? (
              <div className="text-sm text-text-muted text-center py-8">
                Scanning directories...
              </div>
            ) : documents.length === 0 ? (
              <div className="max-w-md mx-auto text-center py-16">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-text-muted mb-3">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p className="text-sm text-text-muted">
                  No documents found. Documents are scanned from
                  ~/Documents/Last30Days/
                </p>
              </div>
            ) : (
              <div className="max-w-4xl space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.path}
                    onClick={() => openDocument(doc.path)}
                    className="w-full text-left bg-bg-secondary border border-border rounded-lg p-4 transition-all duration-150 hover:border-border-light hover:bg-bg-tertiary group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">
                            {doc.title}
                          </h3>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                              CATEGORY_COLORS[doc.category] ||
                              CATEGORY_COLORS.General
                            }`}
                          >
                            {doc.category}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted line-clamp-1">
                          {doc.preview}
                        </p>
                      </div>
                      <span className="text-[10px] text-text-muted shrink-0">
                        {doc.date}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
