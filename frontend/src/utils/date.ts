/**
 * Format a date for display as DD-MM-YYYY (used across all pages).
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (value == null) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format date and time as DD-MM-YYYY, HH:mm (e.g. for notifications).
 */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (value == null) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const datePart = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${datePart}, ${hours}:${minutes}`;
}
