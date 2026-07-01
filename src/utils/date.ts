import { format, getDaysInMonth, parse, startOfMonth, startOfWeek, subDays, subMonths } from 'date-fns';

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
  return format(parseLocal(dateStr), 'EEE');
}

export function monthLabel(offset: number): string {
  return format(subMonths(startOfMonth(new Date()), offset), 'MMMM yyyy');
}

export function monthStartISO(offset: number): string {
  return format(subMonths(startOfMonth(new Date()), offset), 'yyyy-MM-dd');
}

export function weekLabel(offset: number): string {
  if (offset === 0) return 'This Week';
  if (offset === 1) return 'Last Week';
  const end = subDays(new Date(), offset * 7);
  const start = subDays(end, 6);
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
}

export function windowStartISO(offset: number): string {
  return format(subDays(new Date(), offset * 7 + 6), 'yyyy-MM-dd');
}

export function dayISO(offset: number): string {
  return format(subDays(new Date(), offset), 'yyyy-MM-dd');
}

export function dayLabel(offset: number): string {
  if (offset === 0) return 'Today';
  return format(subDays(new Date(), offset), 'EEE, MMM d');
}

export function daysInMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month));
}

/** Returns the ISO date string (YYYY-MM-DD) of the Monday of the given date's week. */
export function getMondayStr(now: Date): string {
  return format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}
