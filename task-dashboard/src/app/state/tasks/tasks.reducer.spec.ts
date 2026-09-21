import type { Task } from '../../core/models';
import { TasksActions } from './tasks.actions';
import { tasksReducer, tasksAdapter } from './tasks.reducer';
import type { TasksState } from './tasks.reducer';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task one',
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

const initialState: TasksState = tasksAdapter.getInitialState({
  loading: false,
  error: null,
  lastFetchedAt: null,
});

describe('tasksReducer', () => {
  it('returns the initial state for an unknown action', () => {
    const state = tasksReducer(undefined, { type: 'noop' });
    expect(state.ids).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('sets loading true and clears error on loadTasks', () => {
    const withError = { ...initialState, error: 'boom' };
    const state = tasksReducer(withError, TasksActions.loadTasks());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('populates entities and stamps lastFetchedAt on loadTasksSuccess', () => {
    const tasks = [makeTask({ id: 't1' }), makeTask({ id: 't2' })];
    const state = tasksReducer(initialState, TasksActions.loadTasksSuccess({ tasks }));
    expect(state.ids).toEqual(['t1', 't2']);
    expect(state.loading).toBe(false);
    expect(state.lastFetchedAt).not.toBeNull();
  });

  it('replaces the entity set (not merges) on repeated loadTasksSuccess', () => {
    const first = tasksReducer(
      initialState,
      TasksActions.loadTasksSuccess({ tasks: [makeTask({ id: 't1' })] }),
    );
    const second = tasksReducer(
      first,
      TasksActions.loadTasksSuccess({ tasks: [makeTask({ id: 't2' })] }),
    );
    expect(second.ids).toEqual(['t2']);
  });

  it('records the error and stops loading on loadTasksFailure', () => {
    const loading = { ...initialState, loading: true };
    const state = tasksReducer(loading, TasksActions.loadTasksFailure({ error: 'network down' }));
    expect(state.loading).toBe(false);
    expect(state.error).toBe('network down');
  });

  it('adds a new task on createTaskSuccess', () => {
    const task = makeTask({ id: 't1' });
    const state = tasksReducer(initialState, TasksActions.createTaskSuccess({ task }));
    expect(state.ids).toEqual(['t1']);
    expect(state.entities['t1']).toEqual(task);
  });

  it('records the error on createTaskFailure without mutating entities', () => {
    const state = tasksReducer(initialState, TasksActions.createTaskFailure({ error: 'bad' }));
    expect(state.error).toBe('bad');
    expect(state.ids).toEqual([]);
  });

  it('optimistically applies changes on updateTask before the request resolves', () => {
    const seeded = tasksReducer(
      initialState,
      TasksActions.loadTasksSuccess({ tasks: [makeTask({ id: 't1', title: 'Old title' })] }),
    );
    const state = tasksReducer(
      seeded,
      TasksActions.updateTask({
        id: 't1',
        changes: { title: 'New title' },
        previous: seeded.entities['t1']!,
      }),
    );
    expect(state.entities['t1']?.title).toBe('New title');
  });

  it('reconciles with the server response on updateTaskSuccess', () => {
    const seeded = tasksReducer(
      initialState,
      TasksActions.loadTasksSuccess({ tasks: [makeTask({ id: 't1' })] }),
    );
    const serverTask = makeTask({ id: 't1', title: 'Server title' });
    const state = tasksReducer(seeded, TasksActions.updateTaskSuccess({ task: serverTask }));
    expect(state.entities['t1']?.title).toBe('Server title');
  });

  it('rolls back to the previous task and records the error on updateTaskFailure', () => {
    const original = makeTask({ id: 't1', title: 'Original' });
    const seeded = tasksReducer(initialState, TasksActions.loadTasksSuccess({ tasks: [original] }));
    const optimistic = tasksReducer(
      seeded,
      TasksActions.updateTask({ id: 't1', changes: { title: 'Optimistic' }, previous: original }),
    );
    const rolledBack = tasksReducer(
      optimistic,
      TasksActions.updateTaskFailure({ previous: original, error: 'failed' }),
    );
    expect(rolledBack.entities['t1']?.title).toBe('Original');
    expect(rolledBack.error).toBe('failed');
  });

  it('applies a status change optimistically on moveTask', () => {
    const seeded = tasksReducer(
      initialState,
      TasksActions.loadTasksSuccess({ tasks: [makeTask({ id: 't1', status: 'todo' })] }),
    );
    const state = tasksReducer(
      seeded,
      TasksActions.moveTask({ id: 't1', status: 'done', previous: seeded.entities['t1']! }),
    );
    expect(state.entities['t1']?.status).toBe('done');
  });

  it('optimistically removes the task on deleteTask', () => {
    const task = makeTask({ id: 't1' });
    const seeded = tasksReducer(initialState, TasksActions.loadTasksSuccess({ tasks: [task] }));
    const state = tasksReducer(seeded, TasksActions.deleteTask({ id: 't1', previous: task }));
    expect(state.ids).toEqual([]);
  });

  it('restores the task and records the error on deleteTaskFailure', () => {
    const task = makeTask({ id: 't1' });
    const seeded = tasksReducer(initialState, TasksActions.loadTasksSuccess({ tasks: [task] }));
    const deleted = tasksReducer(seeded, TasksActions.deleteTask({ id: 't1', previous: task }));
    const restored = tasksReducer(
      deleted,
      TasksActions.deleteTaskFailure({ previous: task, error: 'failed' }),
    );
    expect(restored.ids).toEqual(['t1']);
    expect(restored.error).toBe('failed');
  });
});
