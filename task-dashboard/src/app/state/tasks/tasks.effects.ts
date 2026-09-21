import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import type { Task } from '../../core/models';
import { TaskApiService } from '../../core/services/task-api.service';
import { TasksActions } from './tasks.actions';
import { selectTasksState } from './tasks.reducer';

/** Cached task list is considered fresh for this long before a reload actually hits the network. */
const CACHE_TTL_MS = 60_000;

function errorMessage(error: unknown): string {
  return error instanceof HttpErrorResponse
    ? ((error.error as { message?: string })?.message ?? error.message)
    : 'Something went wrong. Please try again.';
}

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly taskApi = inject(TaskApiService);

  /**
   * Skips the HTTP call when a fresh copy is already cached — but always resolves with a
   * `loadTasksSuccess` (even the cached, no-op kind) so `loading` never gets stuck `true`
   * with nothing left to flip it back.
   */
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      withLatestFrom(this.store.select(selectTasksState)),
      switchMap(([, state]) => {
        const isFresh = !!state.lastFetchedAt && Date.now() - state.lastFetchedAt <= CACHE_TTL_MS;
        if (isFresh) {
          return of(
            TasksActions.loadTasksSuccess({ tasks: Object.values(state.entities) as Task[] }),
          );
        }
        return this.taskApi.getTasks().pipe(
          map((tasks) => TasksActions.loadTasksSuccess({ tasks })),
          catchError((error) => of(TasksActions.loadTasksFailure({ error: errorMessage(error) }))),
        );
      }),
    ),
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      switchMap(({ task }) =>
        this.taskApi.createTask(task).pipe(
          map((created) => TasksActions.createTaskSuccess({ task: created })),
          catchError((error) => of(TasksActions.createTaskFailure({ error: errorMessage(error) }))),
        ),
      ),
    ),
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      switchMap(({ id, changes, previous }) =>
        this.taskApi.updateTask(id, changes).pipe(
          map((task) => TasksActions.updateTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.updateTaskFailure({ previous, error: errorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  /** A board drag-and-drop move is just a status update under the hood. */
  moveTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.moveTask),
      switchMap(({ id, status, previous }) =>
        this.taskApi.updateTask(id, { status }).pipe(
          map((task) => TasksActions.updateTaskSuccess({ task })),
          catchError((error) =>
            of(TasksActions.updateTaskFailure({ previous, error: errorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      switchMap(({ id, previous }) =>
        this.taskApi.deleteTask(id).pipe(
          map(() => TasksActions.deleteTaskSuccess({ id })),
          catchError((error) =>
            of(TasksActions.deleteTaskFailure({ previous, error: errorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}
