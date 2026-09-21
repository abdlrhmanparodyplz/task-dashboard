import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import type { Task } from '../../core/models';
import { TaskApiService } from '../../core/services/task-api.service';
import { TasksActions } from './tasks.actions';
import { TasksEffects } from './tasks.effects';
import { tasksAdapter } from './tasks.reducer';
import type { TasksState } from './tasks.reducer';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
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

describe('TasksEffects', () => {
  let actions$: Observable<unknown>;
  let taskApi: jasmine.SpyObj<TaskApiService>;
  let effects: TasksEffects;

  function setup(initialTasksState: TasksState) {
    taskApi = jasmine.createSpyObj<TaskApiService>('TaskApiService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask',
    ]);
    TestBed.configureTestingModule({
      providers: [
        TasksEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { tasks: initialTasksState } }),
        { provide: TaskApiService, useValue: taskApi },
      ],
    });
    effects = TestBed.inject(TasksEffects);
  }

  const staleState: TasksState = tasksAdapter.getInitialState({
    loading: false,
    error: null,
    lastFetchedAt: null,
  });

  describe('loadTasks$', () => {
    it('fetches from the API and emits loadTasksSuccess when the cache is stale', async () => {
      setup(staleState);
      const tasks = [makeTask()];
      taskApi.getTasks.and.returnValue(of(tasks));
      actions$ = of(TasksActions.loadTasks());

      const result = await firstValueFrom(effects.loadTasks$.pipe(take(1)));
      expect(taskApi.getTasks).toHaveBeenCalled();
      expect(result).toEqual(TasksActions.loadTasksSuccess({ tasks }));
    });

    it('skips the API call and resolves from cache when fresh', async () => {
      const task = makeTask();
      const freshState = tasksAdapter.setAll([task], {
        ...staleState,
        lastFetchedAt: Date.now(),
      });
      setup(freshState);
      actions$ = of(TasksActions.loadTasks());

      const result = await firstValueFrom(effects.loadTasks$.pipe(take(1)));
      expect(taskApi.getTasks).not.toHaveBeenCalled();
      expect(result).toEqual(TasksActions.loadTasksSuccess({ tasks: [task] }));
    });

    it('emits loadTasksFailure when the API call errors', async () => {
      setup(staleState);
      taskApi.getTasks.and.returnValue(
        throwError(
          () => new HttpErrorResponse({ status: 500, error: { message: 'Server error' } }),
        ),
      );
      actions$ = of(TasksActions.loadTasks());

      const result = await firstValueFrom(effects.loadTasks$.pipe(take(1)));
      expect(result).toEqual(TasksActions.loadTasksFailure({ error: 'Server error' }));
    });

    it('surfaces the mock API error message when present', async () => {
      setup(staleState);
      taskApi.getTasks.and.returnValue(
        throwError(
          () => new HttpErrorResponse({ status: 503, error: { message: 'Temporary hiccup' } }),
        ),
      );
      actions$ = of(TasksActions.loadTasks());

      const result = await firstValueFrom(effects.loadTasks$.pipe(take(1)));
      expect(result).toEqual(TasksActions.loadTasksFailure({ error: 'Temporary hiccup' }));
    });
  });

  describe('createTask$', () => {
    it('emits createTaskSuccess on success', async () => {
      setup(staleState);
      const task = makeTask();
      taskApi.createTask.and.returnValue(of(task));
      actions$ = of(TasksActions.createTask({ task }));

      const result = await firstValueFrom(effects.createTask$.pipe(take(1)));
      expect(result).toEqual(TasksActions.createTaskSuccess({ task }));
    });

    it('emits createTaskFailure on error', async () => {
      setup(staleState);
      taskApi.createTask.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      actions$ = of(TasksActions.createTask({ task: makeTask() }));

      const result = await firstValueFrom(effects.createTask$.pipe(take(1)));
      expect(result.type).toBe(TasksActions.createTaskFailure.type);
    });
  });

  describe('updateTask$', () => {
    it('emits updateTaskSuccess on success', async () => {
      setup(staleState);
      const updated = makeTask({ title: 'Updated' });
      taskApi.updateTask.and.returnValue(of(updated));
      actions$ = of(
        TasksActions.updateTask({ id: 't1', changes: { title: 'Updated' }, previous: makeTask() }),
      );

      const result = await firstValueFrom(effects.updateTask$.pipe(take(1)));
      expect(result).toEqual(TasksActions.updateTaskSuccess({ task: updated }));
    });

    it('rolls back with the previous task on error', async () => {
      setup(staleState);
      const previous = makeTask();
      taskApi.updateTask.and.returnValue(
        throwError(
          () => new HttpErrorResponse({ status: 500, error: { message: 'Server error' } }),
        ),
      );
      actions$ = of(TasksActions.updateTask({ id: 't1', changes: {}, previous }));

      const result = await firstValueFrom(effects.updateTask$.pipe(take(1)));
      expect(result).toEqual(
        TasksActions.updateTaskFailure({
          previous,
          error: 'Server error',
        }),
      );
    });
  });

  describe('moveTask$', () => {
    it('updates status via the same update endpoint', async () => {
      setup(staleState);
      const moved = makeTask({ status: 'done' });
      taskApi.updateTask.and.returnValue(of(moved));
      actions$ = of(TasksActions.moveTask({ id: 't1', status: 'done', previous: makeTask() }));

      const result = await firstValueFrom(effects.moveTask$.pipe(take(1)));
      expect(taskApi.updateTask).toHaveBeenCalledWith('t1', { status: 'done' });
      expect(result).toEqual(TasksActions.updateTaskSuccess({ task: moved }));
    });

    it('rolls back on error', async () => {
      setup(staleState);
      const previous = makeTask();
      taskApi.updateTask.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      actions$ = of(TasksActions.moveTask({ id: 't1', status: 'done', previous }));

      const result = await firstValueFrom(effects.moveTask$.pipe(take(1)));
      expect(result.type).toBe(TasksActions.updateTaskFailure.type);
    });
  });

  describe('deleteTask$', () => {
    it('emits deleteTaskSuccess on success', async () => {
      setup(staleState);
      taskApi.deleteTask.and.returnValue(of(undefined));
      actions$ = of(TasksActions.deleteTask({ id: 't1', previous: makeTask() }));

      const result = await firstValueFrom(effects.deleteTask$.pipe(take(1)));
      expect(result).toEqual(TasksActions.deleteTaskSuccess({ id: 't1' }));
    });

    it('restores the task on error', async () => {
      setup(staleState);
      const previous = makeTask();
      taskApi.deleteTask.and.returnValue(
        throwError(
          () => new HttpErrorResponse({ status: 500, error: { message: 'Server error' } }),
        ),
      );
      actions$ = of(TasksActions.deleteTask({ id: 't1', previous }));

      const result = await firstValueFrom(effects.deleteTask$.pipe(take(1)));
      expect(result).toEqual(
        TasksActions.deleteTaskFailure({
          previous,
          error: 'Server error',
        }),
      );
    });
  });
});
