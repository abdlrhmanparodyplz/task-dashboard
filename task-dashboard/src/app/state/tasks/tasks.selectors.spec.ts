import type { Task } from '../../core/models';
import { TasksActions } from './tasks.actions';
import { tasksAdapter, tasksReducer } from './tasks.reducer';
import type { TasksState } from './tasks.reducer';
import {
  selectDoneTasks,
  selectInProgressTasks,
  selectOverdueTasks,
  selectTaskCounts,
  selectTodoTasks,
} from './tasks.selectors';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 't1',
    title: 'Task',
    description: 'Description',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-01',
    assignee: { id: 'u1', name: 'John Doe', avatar: 'JD', email: 'john@doe.com' },
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function stateWith(tasks: Task[]): { tasks: TasksState } {
  const initial: TasksState = tasksAdapter.getInitialState({
    loading: false,
    error: null,
    lastFetchedAt: null,
  });
  return { tasks: tasksReducer(initial, TasksActions.loadTasksSuccess({ tasks })) };
}

describe('tasks selectors', () => {
  const rootState = stateWith([
    makeTask({ id: 'todo-1', status: 'todo', dueDate: daysFromNow(5) }),
    makeTask({ id: 'todo-overdue', status: 'todo', dueDate: daysFromNow(-2) }),
    makeTask({ id: 'in-progress-1', status: 'in_progress', dueDate: daysFromNow(1) }),
    makeTask({ id: 'done-1', status: 'done', dueDate: daysFromNow(-10) }),
  ]);

  it('selectTodoTasks returns only todo tasks', () => {
    const ids = selectTodoTasks(rootState).map((t) => t.id);
    expect(ids).toEqual(['todo-1', 'todo-overdue']);
  });

  it('selectInProgressTasks returns only in-progress tasks', () => {
    const ids = selectInProgressTasks(rootState).map((t) => t.id);
    expect(ids).toEqual(['in-progress-1']);
  });

  it('selectDoneTasks returns only done tasks', () => {
    const ids = selectDoneTasks(rootState).map((t) => t.id);
    expect(ids).toEqual(['done-1']);
  });

  it('selectOverdueTasks excludes done tasks even with a past due date', () => {
    const ids = selectOverdueTasks(rootState).map((t) => t.id);
    expect(ids).toEqual(['todo-overdue']);
  });

  it('selectTaskCounts summarizes total/completed/inProgress/overdue', () => {
    expect(selectTaskCounts(rootState)).toEqual({
      total: 4,
      completed: 1,
      inProgress: 1,
      overdue: 1,
    });
  });

  it('returns empty results for an empty store', () => {
    const empty = stateWith([]);
    expect(selectTodoTasks(empty)).toEqual([]);
    expect(selectTaskCounts(empty)).toEqual({ total: 0, completed: 0, inProgress: 0, overdue: 0 });
  });
});
