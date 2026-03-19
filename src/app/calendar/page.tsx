"use client";

import { useEffect, useState, useCallback } from "react";
import type { CronJob } from "@/lib/types";

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  backup: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400" },
  sync: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400" },
  report: { bg: "bg-purple-500/15", text: "text-purple-400", dot: "bg-purple-400" },
  maintenance: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" },
  custom: { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-400" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseCronSchedule(
  schedule: string
): { daysOfWeek: number[]; hours: number[]; daysOfMonth: number[] } {
  const parts = schedule.split(" ");
  const [, hourPart, dayOfMonthPart, , dayOfWeekPart] = parts;

  const parsePart = (part: string, max: number): number[] => {
    if (part === "*") return Array.from({ length: max }, (_, i) => i);
    if (part.includes("/")) {
      const [, step] = part.split("/");
      return Array.from({ length: Math.ceil(max / Number(step)) }, (_, i) => i * Number(step));
    }
    if (part.includes(",")) return part.split(",").map(Number);
    return [Number(part)];
  };

  return {
    hours: parsePart(hourPart, 24),
    daysOfMonth: parsePart(dayOfMonthPart, 32),
    daysOfWeek: parsePart(dayOfWeekPart, 7),
  };
}

function getJobsForDate(crons: CronJob[], date: Date): CronJob[] {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();

  return crons.filter((cron) => {
    if (!cron.enabled) return false;
    const parsed = parseCronSchedule(cron.schedule);
    const matchesDow = parsed.daysOfWeek.length === 7 || parsed.daysOfWeek.includes(dayOfWeek);
    const matchesDom = parsed.daysOfMonth.length >= 31 || parsed.daysOfMonth.includes(dayOfMonth);
    return matchesDow && matchesDom;
  });
}

export default function CalendarPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCrons = useCallback(async () => {
    const res = await fetch("/api/crons");
    const data = await res.json();
    setCrons(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCrons();
  }, [fetchCrons]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedJobs = selectedDate
    ? getJobsForDate(crons, selectedDate)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-lg font-semibold">Calendar</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {crons.filter((c) => c.enabled).length} active cron jobs
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6">
          {/* Calendar grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="bg-bg-secondary px-2 py-2 text-center text-xs font-medium text-text-muted"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                const dateObj = day ? new Date(year, month, day) : null;
                const jobs = dateObj ? getJobsForDate(crons, dateObj) : [];
                const isSelected =
                  selectedDate &&
                  day === selectedDate.getDate() &&
                  month === selectedDate.getMonth() &&
                  year === selectedDate.getFullYear();

                return (
                  <div
                    key={i}
                    className={`bg-bg-primary min-h-[80px] p-1.5 transition-colors ${
                      day
                        ? "cursor-pointer hover:bg-bg-tertiary"
                        : ""
                    } ${isSelected ? "bg-bg-tertiary ring-1 ring-accent-blue" : ""}`}
                    onClick={() => {
                      if (dateObj) setSelectedDate(dateObj);
                    }}
                  >
                    {day && (
                      <>
                        <span
                          className={`text-xs inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            isToday(day)
                              ? "bg-accent-blue text-white font-bold"
                              : "text-text-secondary"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {jobs.slice(0, 3).map((job) => (
                            <div
                              key={job.id}
                              className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[job.type]?.dot || "bg-gray-400"}`}
                              title={job.name}
                            />
                          ))}
                          {jobs.length > 3 && (
                            <span className="text-[9px] text-text-muted">
                              +{jobs.length - 3}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4">
              {Object.entries(TYPE_COLORS).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs text-text-muted capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar detail */}
          <div className="w-80 shrink-0">
            <div className="bg-bg-secondary border border-border rounded-xl p-4">
              <h3 className="text-sm font-medium mb-3">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </h3>
              {selectedDate && selectedJobs.length === 0 && (
                <p className="text-xs text-text-muted">
                  No scheduled jobs for this date.
                </p>
              )}
              <div className="space-y-2">
                {selectedJobs.map((job) => {
                  const colors = TYPE_COLORS[job.type] || TYPE_COLORS.custom;
                  return (
                    <div
                      key={job.id}
                      className="bg-bg-tertiary border border-border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="text-sm font-medium">{job.name}</span>
                      </div>
                      <p className="text-xs text-text-muted mb-2">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
                        >
                          {job.type}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">
                          {job.schedule}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All crons list */}
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wider">
                  All Cron Jobs
                </h4>
                <div className="space-y-2">
                  {crons.map((cron) => {
                    const colors = TYPE_COLORS[cron.type] || TYPE_COLORS.custom;
                    return (
                      <div
                        key={cron.id}
                        className={`flex items-center gap-2 text-xs ${
                          cron.enabled ? "" : "opacity-40"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        <span className="text-text-secondary flex-1 truncate">
                          {cron.name}
                        </span>
                        <span className="text-text-muted font-mono text-[10px]">
                          {cron.schedule}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
