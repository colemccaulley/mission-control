import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SCAN_DIRS = [
  path.join(process.env.HOME || "", "Documents/Last30Days"),
];

function detectCategory(filePath: string, content: string): string {
  const lower = (filePath + " " + content.slice(0, 500)).toLowerCase();
  if (lower.includes("resume") || lower.includes("cover letter") || lower.includes("cv"))
    return "Career";
  if (lower.includes("meeting") || lower.includes("standup") || lower.includes("agenda"))
    return "Meetings";
  if (lower.includes("note") || lower.includes("journal") || lower.includes("daily"))
    return "Notes";
  if (lower.includes("spec") || lower.includes("design") || lower.includes("architecture") || lower.includes("rfc"))
    return "Technical";
  if (lower.includes("todo") || lower.includes("task") || lower.includes("checklist"))
    return "Planning";
  return "General";
}

function scanDirectory(dir: string): Array<{
  path: string;
  filename: string;
  title: string;
  category: string;
  date: string;
  preview: string;
  content: string;
}> {
  if (!fs.existsSync(dir)) return [];

  const results: ReturnType<typeof scanDirectory> = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          const stats = fs.statSync(fullPath);
          const titleMatch = content.match(/^#\s+(.+)/m);
          const title = titleMatch
            ? titleMatch[1]
            : entry.name.replace(".md", "").replace(/[-_]/g, " ");

          results.push({
            path: fullPath,
            filename: entry.name,
            title,
            category: detectCategory(fullPath, content),
            date: stats.mtime.toISOString().split("T")[0],
            preview: content.slice(0, 300).replace(/\n/g, " ").replace(/#/g, ""),
            content,
          });
        } catch {
          // Skip unreadable files
        }
      }
    }
  }

  walk(dir);
  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("file");
  const search = searchParams.get("search");
  const category = searchParams.get("category");

  // Return a specific file
  if (filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const filename = path.basename(filePath);
      const titleMatch = content.match(/^#\s+(.+)/m);
      return NextResponse.json({
        path: filePath,
        filename,
        title: titleMatch ? titleMatch[1] : filename.replace(".md", ""),
        content,
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  // Scan all dirs
  let docs = SCAN_DIRS.flatMap(scanDirectory);

  // Sort by date descending
  docs.sort((a, b) => b.date.localeCompare(a.date));

  if (search) {
    const term = search.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        d.content.toLowerCase().includes(term) ||
        d.filename.toLowerCase().includes(term)
    );
  }

  if (category) {
    docs = docs.filter((d) => d.category === category);
  }

  // Strip full content from list view
  const list = docs.map(({ content: _content, ...rest }) => rest);
  return NextResponse.json(list);
}
