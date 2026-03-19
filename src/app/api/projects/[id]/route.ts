import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProjects, getTasks } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projects = getProjects();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const tasks = getTasks().filter((t) => t.projectId === id);

  return NextResponse.json({ ...project, tasks });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  projects[index] = { ...projects[index], ...body };
  saveProjects(projects);

  return NextResponse.json(projects[index]);
}
