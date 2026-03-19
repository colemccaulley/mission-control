import fs from "fs";
import path from "path";
import type { Task, Project, CronJob } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJSON<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getTasks(): Task[] {
  return readJSON<Task[]>("tasks.json");
}

export function getTask(id: string): Task | undefined {
  return getTasks().find((t) => t.id === id);
}

export function saveTasks(tasks: Task[]): void {
  writeJSON("tasks.json", tasks);
}

export function getProjects(): Project[] {
  return readJSON<Project[]>("projects.json");
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function saveProjects(projects: Project[]): void {
  writeJSON("projects.json", projects);
}

export function getCrons(): CronJob[] {
  return readJSON<CronJob[]>("crons.json");
}
