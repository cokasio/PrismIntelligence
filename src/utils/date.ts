/**
 * Date and time utilities for Prism Intelligence
 * These functions handle the complexities of date manipulation
 * Working with dates is tricky - these helpers make it reliable
 */

/**
 * Format dates consistently across the application
 * This ensures all dates display the same way to users
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Calculate the number of days between two dates
 * Useful for determining how long properties have been vacant
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

/**
 * Check if a date falls within a specific range
 * This helps with filtering reports by date periods
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}
