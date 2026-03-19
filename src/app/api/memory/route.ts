import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_DIR = "/Users/colemccaulley/.openclaw/workspace/memory";
const MEMORY_FILE = "/Users/colemccaulley/.openclaw/workspace/MEMORY.md";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const type = searchParams.get("type");
  const search = searchParams.get("search");

  // Return the long-term MEMORY.md
  if (type === "long-term") {
    try {
      const content = fs.readFileSync(MEMORY_FILE, "utf-8");
      return NextResponse.json({ content, filename: "MEMORY.md" });
    } catch {
      return NextResponse.json({ content: "No MEMORY.md found.", filename: "MEMORY.md" });
    }
  }

  // Return a specific date's memory
  if (date) {
    const filePath = path.join(MEMORY_DIR, `${date}.md`);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ content, date, filename: `${date}.md` });
    } catch {
      return NextResponse.json({ content: null, date, filename: `${date}.md` });
    }
  }

  // List all memory files
  try {
    let files: string[] = [];
    if (fs.existsSync(MEMORY_DIR)) {
      files = fs.readdirSync(MEMORY_DIR)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse();
    }

    const memories = files.map((f) => {
      const content = fs.readFileSync(path.join(MEMORY_DIR, f), "utf-8");
      const dateMatch = f.match(/^(\d{4}-\d{2}-\d{2})/);
      return {
        filename: f,
        date: dateMatch ? dateMatch[1] : f.replace(".md", ""),
        preview: content.slice(0, 200).replace(/\n/g, " "),
        content,
      };
    });

    // Filter by search term
    if (search) {
      const term = search.toLowerCase();
      const filtered = memories.filter(
        (m) =>
          m.content.toLowerCase().includes(term) ||
          m.filename.toLowerCase().includes(term)
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(memories);
  } catch {
    return NextResponse.json([]);
  }
}
