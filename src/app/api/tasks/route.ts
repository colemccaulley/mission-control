import { NextRequest, NextResponse } from "next/server";
import { getTasks, saveTasks } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";
import type { Task } from "@/lib/types";

export async function GET() {
  const tasks = getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const tasks = getTasks();

  const newTask: Task = {
    id: `task-${uuidv4().slice(0, 8)}`,
    title: body.title,
    description: body.description || "",
    status: body.status || "backlog",
    assignee: body.assignee || "Cole",
    priority: body.priority || "medium",
    createdAt: new Date().toISOString(),
    projectId: body.projectId,
  };

  tasks.push(newTask);
  saveTasks(tasks);

  return NextResponse.json(newTask, { status: 201 });
}
