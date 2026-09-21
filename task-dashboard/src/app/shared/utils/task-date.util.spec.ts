import type { Task } from '../../core/models';
import { getDueDateLabel, isTaskOverdue } from './task-date.util';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task',
    description: 'Description',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    assignee: { id: 'u1', name: 'John Doe', avatar: 'JD', email: 'john@doe.com' },
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

describe('isTaskOverdue', () => {
  it('returns false for a task due today', () => {
    expect(isTaskOverdue(makeTask({ dueDate: daysFromNow(0) }))).toBe(false);
  });

  it('returns true for a task due in the past that is not done', () => {
    expect(isTaskOverdue(makeTask({ status: 'todo', dueDate: daysFromNow(-2) }))).toBe(true);
  });

  it('returns false for a done task even if the due date has passed', () => {
    expect(isTaskOverdue(makeTask({ status: 'done', dueDate: daysFromNow(-2) }))).toBe(false);
  });

  it('returns true when isOverdue is explicitly set, regardless of due date', () => {
    expect(isTaskOverdue(makeTask({ dueDate: daysFromNow(5), isOverdue: true }))).toBe(true);
  });

  it('returns false for a future due date', () => {
    expect(isTaskOverdue(makeTask({ dueDate: daysFromNow(3) }))).toBe(false);
  });
});

describe('getDueDateLabel', () => {
  it('labels a task due today', () => {
    expect(getDueDateLabel(makeTask({ dueDate: daysFromNow(0) }))).toBe('Due today');
  });

  it('labels a task due tomorrow', () => {
    expect(getDueDateLabel(makeTask({ dueDate: daysFromNow(1) }))).toBe('Due tomorrow');
  });

  it('labels a task due in a few days', () => {
    expect(getDueDateLabel(makeTask({ dueDate: daysFromNow(3) }))).toBe('Due in 3 days');
  });

  it('labels a task due in exactly one week as weeks', () => {
    expect(getDueDateLabel(makeTask({ dueDate: daysFromNow(7) }))).toBe('Due in 1 week');
  });

  it('labels a task due in exactly two weeks as weeks', () => {
    expect(getDueDateLabel(makeTask({ dueDate: daysFromNow(14) }))).toBe('Due in 2 weeks');
  });

  it('labels an overdue task by a single day', () => {
    expect(getDueDateLabel(makeTask({ dueDate: daysFromNow(-1) }))).toBe('Overdue by 1 day');
  });

  it('labels an overdue task by multiple days', () => {
    expect(getDueDateLabel(makeTask({ dueDate: daysFromNow(-4) }))).toBe('Overdue by 4 days');
  });

  it('labels a task completed today', () => {
    const completedAt = new Date().toISOString();
    expect(getDueDateLabel(makeTask({ status: 'done', completedAt }))).toBe('Completed today');
  });

  it('labels a task completed yesterday', () => {
    const completedAt = new Date(Date.now() - 86_400_000).toISOString();
    expect(getDueDateLabel(makeTask({ status: 'done', completedAt }))).toBe('Completed yesterday');
  });

  it('labels a task completed several days ago', () => {
    const completedAt = new Date(Date.now() - 3 * 86_400_000).toISOString();
    expect(getDueDateLabel(makeTask({ status: 'done', completedAt }))).toBe('Completed 3 days ago');
  });

  it('falls back to "Completed" when a done task has no completedAt', () => {
    expect(getDueDateLabel(makeTask({ status: 'done', completedAt: undefined }))).toBe('Completed');
  });
});
