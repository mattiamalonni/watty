export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function shortDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short' });
}

export function monthLabel(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return d.toLocaleDateString([], { month: 'long', year: 'numeric' });
}

export function monthStartISO(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return d.toISOString().slice(0, 10);
}

export function weekLabel(offset: number): string {
  if (offset === 0) return 'This Week';
  if (offset === 1) return 'Last Week';
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() - offset * 7);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  const fmt = (d: Date): string => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function windowStartISO(offset: number): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (offset * 7 + 6));
  return start.toISOString().slice(0, 10);
}

export function dayISO(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

export function dayLabel(offset: number): string {
  if (offset === 0) return 'Today';
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
