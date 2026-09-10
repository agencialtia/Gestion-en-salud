/**
 * Utility functions for date formatting across the application.
 * All displayed dates are formatted strictly as DD/MM/YYYY (e.g. 03/07/2026).
 */

/**
 * Formats a date string (e.g. "2026-07-03", "2026/07/03", "2026-07-03T14:30:00Z")
 * to standard DD/MM/YYYY format: "03/07/2026".
 * If empty or invalid, returns fallback.
 */
export function formatDate(dateInput?: string | Date | null, fallback: string = '—'): string {
  if (!dateInput) return fallback;
  
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return fallback;
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const str = String(dateInput).trim();
  if (!str) return fallback;

  // If already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Match YYYY-MM-DD or YYYY/MM/DD (with optional time or extra string)
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // Match DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}/${month}/${year}`;
  }

  // Try standard Date parsing
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    // fallback
  }

  return str;
}

/**
 * Formats date and time: "03/07/2026 14:30"
 */
export function formatDateTime(dateInput?: string | Date | null, fallback: string = '—'): string {
  if (!dateInput) return fallback;
  const str = String(dateInput).trim();
  if (!str) return fallback;

  // If ISO string or YYYY-MM-DD HH:MM
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[T\s](\d{1,2}):(\d{2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    const hour = isoMatch[4].padStart(2, '0');
    const min = isoMatch[5];
    return `${day}/${month}/${year} ${hour}:${min}`;
  }

  return formatDate(str, fallback);
}

/**
 * Formats a month/year string (e.g. "2026-08" -> "08/2026")
 */
export function formatMonthYear(monthStr?: string, fallback: string = '—'): string {
  if (!monthStr) return fallback;
  const str = String(monthStr).trim();
  const m = str.match(/^(\d{4})[-/](\d{1,2})$/);
  if (m) {
    const year = m[1];
    const month = m[2].padStart(2, '0');
    return `${month}/${year}`;
  }
  return formatDate(str, fallback);
}
