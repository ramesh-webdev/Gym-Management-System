/**
 * Date range presets and helpers for dashboard filters.
 */

export type DateRangePreset =
  | 'last_7'
  | 'last_30'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'year_to_date'
  | 'all';

export interface DateRange {
  dateFrom: string; // ISO date (start of day UTC)
  dateTo: string;   // ISO date (end of day UTC)
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setUTCDate(1);
  return startOfDay(x);
}

function endOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + 1, 0);
  return endOfDay(x);
}

function startOfQuarter(d: Date): Date {
  const x = new Date(d);
  const q = Math.floor(x.getUTCMonth() / 3) + 1;
  x.setUTCMonth((q - 1) * 3, 1);
  return startOfDay(x);
}

function endOfQuarter(d: Date): Date {
  const x = new Date(d);
  const q = Math.floor(x.getUTCMonth() / 3) + 1;
  x.setUTCMonth(q * 3, 0);
  return endOfDay(x);
}

/**
 * Get date range for a preset. Uses current date as reference.
 * "all" returns null (no filter).
 */
export function getPresetRange(preset: DateRangePreset): DateRange | null {
  const now = new Date();
  if (preset === 'all') return null;

  let from: Date;
  let to: Date = endOfDay(new Date(now));

  switch (preset) {
    case 'last_7': {
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      from = startOfDay(from);
      break;
    }
    case 'last_30': {
      from = new Date(now);
      from.setDate(from.getDate() - 29);
      from = startOfDay(from);
      break;
    }
    case 'this_month': {
      from = startOfMonth(now);
      to = endOfDay(now);
      break;
    }
    case 'last_month': {
      const last = new Date(now.getFullYear(), now.getMonth() - 1);
      from = startOfMonth(last);
      to = endOfMonth(last);
      break;
    }
    case 'this_quarter': {
      from = startOfQuarter(now);
      to = endOfDay(now);
      break;
    }
    case 'last_quarter': {
      const lastQ = new Date(now);
      lastQ.setMonth(now.getMonth() - 3);
      from = startOfQuarter(lastQ);
      to = endOfQuarter(lastQ);
      break;
    }
    case 'year_to_date': {
      from = new Date(now.getFullYear(), 0, 1);
      from = startOfDay(from);
      to = endOfDay(now);
      break;
    }
    default:
      return null;
  }

  return {
    dateFrom: from.toISOString().slice(0, 10) + 'T00:00:00.000Z',
    dateTo: to.toISOString().slice(0, 10) + 'T23:59:59.999Z',
  };
}

/** Preset label for UI */
export function getPresetLabel(preset: DateRangePreset): string {
  switch (preset) {
    case 'last_7': return 'Last 7 days';
    case 'last_30': return 'Last 30 days';
    case 'this_month': return 'This month';
    case 'last_month': return 'Last month';
    case 'this_quarter': return 'This quarter';
    case 'last_quarter': return 'Last quarter';
    case 'year_to_date': return 'Year to date';
    case 'all': return 'All time';
    default: return preset;
  }
}

/** Format range for display (e.g. "1 Jan 2025 – 31 Jan 2025") */
export function formatRangeLabel(dateFrom: string, dateTo: string): string {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${from.toLocaleDateString('en-IN', opts)} – ${to.toLocaleDateString('en-IN', opts)}`;
}

/** Check if a date string (ISO) falls within range [dateFrom, dateTo] (inclusive). */
export function isDateInRange(
  dateStr: string | null | undefined,
  dateFrom: string,
  dateTo: string
): boolean {
  if (!dateStr) return false;
  const t = new Date(dateStr).getTime();
  return t >= new Date(dateFrom).getTime() && t <= new Date(dateTo).getTime();
}
