// Shared visual mapping for the Sport Live design system.
// Colors reference the --sl-* CSS variables defined in globals.css so they
// track the active (dark/light) theme automatically.

export interface Styled {
  color: string;
  label: string;
  bg: string;
}

export function statusStyle(status: string): Styled {
  const map: Record<string, [string, string]> = {
    live: ["var(--sl-live)", "Live"],
    scheduled: ["var(--sl-scheduled)", "Scheduled"],
    finished: ["var(--sl-finished)", "Final"],
  };
  const [color, label] = map[status] || ["var(--sl-muted)", status];
  return { color, label, bg: `color-mix(in srgb, ${color} 15%, transparent)` };
}

export function eventStyle(type: string): Styled {
  const map: Record<string, [string, string]> = {
    goal: ["var(--sl-accent)", "GOAL"],
    "yellow-card": ["#eab308", "Yellow"],
    "red-card": ["#ef4444", "Red Card"],
    substitution: ["#3b82f6", "Sub"],
    corner: ["#8b8b96", "Corner"],
    penalty: ["var(--sl-accent2)", "Penalty"],
  };
  const key = (type || "").toLowerCase();
  const [color, label] = map[key] || ["#8b8b96", type || "Note"];
  return { color, label, bg: `color-mix(in srgb, ${color} 16%, transparent)` };
}

export function accentBar(status: string): string {
  if (status === "live") return "var(--sl-grad)";
  if (status === "finished") return "var(--sl-finished)";
  return "var(--sl-scheduled)";
}

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export const fmtDateLong = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
