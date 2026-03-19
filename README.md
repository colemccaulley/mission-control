# 🔴 Mission Control

A personal productivity dashboard built for [OpenClaw](https://github.com/openclaw/openclaw) — your AI agent's command center.

Dark-themed, Linear-inspired, and designed to give you full visibility into what your AI agent is doing, what's on your plate, and what's been accomplished.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

---

## 🚀 Quick Start

```bash
git clone https://github.com/colemccaulley/mission-control.git
cd mission-control
npm install
npm run dev
```

Open **http://localhost:3333** in your browser.

---

## 📋 Features

### Task Board (Default Screen)

A Kanban-style board for tracking everything you and your AI agent are working on.

- **Columns:** Backlog → In Progress → Review → Done
- **Assignees:** Color-coded by who's responsible (blue for you, red for your agent)
- **Drag tasks** between columns as work progresses
- **Priority levels** and descriptions for each task
- **Live activity feed** on the sidebar showing recent task movements

Your OpenClaw agent can check this board during heartbeats, pick up tasks from the backlog, and move them through the pipeline automatically.

**API Endpoints:**
- `GET /api/tasks` — List all tasks
- `POST /api/tasks` — Create a new task
- `PUT /api/tasks/:id` — Update a task (title, description, status, assignee)
- `DELETE /api/tasks/:id` — Remove a task

### Calendar

A monthly calendar view showing all your scheduled cron jobs and automated tasks.

- See when your agent's proactive tasks are scheduled
- Verify that cron jobs your agent claims to have set up actually exist
- Color-coded badges for different job types (research, nudges, briefs, etc.)
- Confirm your agent is being proactive — if you told it to do something weekly, you should see it here

**API Endpoint:**
- `GET /api/crons` — Returns cron job data (designed to be wired up to OpenClaw's cron system)

### Projects

Track your major goals and projects with progress indicators.

- **Project cards** showing: name, description, status, progress %, last activity
- **Click into a project** to see linked tasks, notes, and resources
- Helps prevent the scatter-brain problem — when you lose focus, come back here to see what actually moves the ball forward

Pre-seeded with starter projects, but fully customizable.

**API Endpoints:**
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create a new project
- `GET /api/projects/:id` — Get project details
- `PUT /api/projects/:id` — Update a project

### Memory Viewer

Browse your OpenClaw agent's memory files in a clean, readable format.

- **Timeline view** of daily memory files (`YYYY-MM-DD.md`)
- **Long-term memory tab** for your agent's curated `MEMORY.md`
- **Search** across all memories — find that conversation from last Tuesday
- **Rendered markdown** — no more reading raw `.md` files in your terminal

Reads from your OpenClaw workspace memory directory (configurable path).

**API Endpoint:**
- `GET /api/memory` — Returns parsed memory files and content

### Documents

A searchable library of every document your AI agent creates.

- Scans `~/Documents/Last30Days/` and other configurable directories
- Auto-categorizes documents by type
- **Full-text search** and filtering
- Click any document to view rendered markdown
- Great for finding research briefings, drafts, and generated content

**API Endpoint:**
- `GET /api/documents` — Returns document listings with metadata

---

## 🏗️ Architecture

```
mission-control/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Task Board (default)
│   │   ├── calendar/page.tsx   # Calendar view
│   │   ├── projects/page.tsx   # Project tracker
│   │   ├── projects/[id]/      # Project detail view
│   │   ├── memory/page.tsx     # Memory viewer
│   │   ├── documents/page.tsx  # Document browser
│   │   ├── layout.tsx          # Root layout with sidebar
│   │   ├── globals.css         # Tailwind + custom styles
│   │   └── api/                # API routes
│   │       ├── tasks/          # CRUD for tasks
│   │       ├── projects/       # CRUD for projects
│   │       ├── crons/          # Cron job data
│   │       ├── memory/         # Memory file reader
│   │       └── documents/      # Document scanner
│   ├── components/
│   │   └── Sidebar.tsx         # Navigation sidebar
│   └── lib/
│       ├── data.ts             # File I/O helpers
│       └── types.ts            # TypeScript interfaces
├── data/                       # Local JSON storage
│   ├── tasks.json              # Task board data
│   ├── projects.json           # Project data
│   └── crons.json              # Cron job data
├── package.json
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## 🔧 Configuration

### Memory Directory

By default, the memory viewer reads from:
```
/Users/<you>/.openclaw/workspace/memory/
```

Update the path in `src/app/api/memory/route.ts` to match your OpenClaw workspace location.

### Document Directories

By default, documents are scanned from:
```
~/Documents/Last30Days/
```

Update the path in `src/app/api/documents/route.ts` to add additional directories.

### Port

Runs on port **3333** by default. Change in `package.json` scripts if needed.

---

## 🤖 OpenClaw Integration

Mission Control is designed to work with OpenClaw's agent system:

1. **Heartbeat integration** — Tell your agent to check the task board during heartbeats and pick up assigned tasks
2. **Cron visibility** — Wire up `/api/crons` to read from OpenClaw's cron system for real-time schedule visibility
3. **Memory browsing** — Reads directly from your OpenClaw workspace memory files
4. **Document library** — Automatically indexes documents your agent creates

### Example: Agent Task Pickup

Add this to your agent's heartbeat instructions:
```
Check the Mission Control task board (GET http://localhost:3333/api/tasks).
If any tasks in "backlog" are assigned to you, pick one up,
move it to "in-progress", and start working on it.
```

---

## 🎨 Design

- **Dark theme** throughout — easy on the eyes, inspired by Linear's aesthetic
- **Color palette:** Dark grays (`#0a0a0a`, `#1a1a1a`, `#2a2a2a`) with blue (`#3b82f6`) and red (`#ef4444`) accents
- **Monospace font** for code and technical content
- **Responsive** but optimized for desktop use

---

## 📦 Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **TypeScript 5**
- **react-markdown** + **remark-gfm** for rendering markdown content
- **No database** — uses local JSON files and reads from the filesystem

---

## 📄 License

MIT — do whatever you want with it.

---

Built with ❤️ by [Cole McCaulley](https://github.com/colemccaulley) and Hal 🔴
