import { addDays, format, getDaysInMonth, parse, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';

/** Parse a YYYY-MM-DD string as local midnight (avoids UTC-midnight pitfall). */
function parseLocal(dateStr: string): Date {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
}

export function localDateISO(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function shortDay(dateStr: string): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(parseLocal(dateStr));
}

export function monthLabel(offset: number): string {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
    subMonths(startOfMonth(new Date()), offset),
  );
}

export function monthStartISO(offset: number): string {
  return format(subMonths(startOfMonth(new Date()), offset), 'yyyy-MM-dd');
}

export function weekLabel(offset: number): string {
  const monday = startOfWeek(subWeeks(new Date(), offset), { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  const crossYear = monday.getFullYear() !== sunday.getFullYear();
  const opts: Intl.DateTimeFormatOptions = crossYear
    ? { month: 'short', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric' };
  const fmt = new Intl.DateTimeFormat(undefined, opts);
  return `${fmt.format(monday)} – ${fmt.format(sunday)}`;
}

export function windowStartISO(offset: number): string {
  return format(startOfWeek(subWeeks(new Date(), offset), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function dayISO(offset: number): string {
  return format(subDays(new Date(), offset), 'yyyy-MM-dd');
}

export function dayLabel(offset: number): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(
    subDays(new Date(), offset),
  );
}

export function daysInMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month));
}

/** Returns the ISO date string (YYYY-MM-DD) of the Monday of the given date's week. */
export function getMondayStr(now: Date): string {
  return format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}
