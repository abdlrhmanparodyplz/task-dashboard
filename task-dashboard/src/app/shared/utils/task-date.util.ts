import type { Task } from '../../core/models';

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Parses a date-only string ("YYYY-MM-DD") as local midnight rather than UTC
 * midnight. `new Date("2026-09-22")` is UTC per the ISO 8601 spec, which
 * silently shifts the calendar day by one for any timezone behind UTC — a
 * task due "today" would otherwise read as due yesterday for those users.
 */
export function parseLocalDate(dateOnly: string): Date {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** The inverse of {@link parseLocalDate} — formats a Date using its local calendar fields. */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'done') {
    return false;
  }
  if (task.isOverdue) {
    return true;
  }
  return startOfDay(parseLocalDate(task.dueDate)) < startOfDay(new Date());
}

/** Human-readable due/overdue/completed label matching the design's card copy. */
export function getDueDateLabel(task: Task): string {
  if (task.status === 'done') {
    if (!task.completedAt) {
      return 'Completed';
    }
    const days = Math.round(
      (startOfDay(new Date()).getTime() - startOfDay(new Date(task.completedAt)).getTime()) /
        86_400_000,
    );
    if (days <= 0) return 'Completed today';
    if (days === 1) return 'Completed yesterday';
    return `Completed ${days} days ago`;
  }

  const dayDiff = Math.round(
    (startOfDay(parseLocalDate(task.dueDate)).getTime() - startOfDay(new Date()).getTime()) /
      86_400_000,
  );

  if (dayDiff < 0) {
    const overdueBy = Math.abs(dayDiff);
    return `Overdue by ${overdueBy} day${overdueBy === 1 ? '' : 's'}`;
  }
  if (dayDiff === 0) return 'Due today';
  if (dayDiff === 1) return 'Due tomorrow';
  if (dayDiff >= 7 && dayDiff % 7 === 0) {
    const weeks = dayDiff / 7;
    return `Due in ${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  return `Due in ${dayDiff} days`;
}
