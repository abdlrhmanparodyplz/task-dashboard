import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import type { Task } from '../../core/models';
import { TasksActions } from './tasks.actions';

export interface TasksState extends EntityState<Task> {
  loading: boolean;
  error: string | null;
  /** epoch ms of the last successful load, used to skip refetching fresh data. */
  lastFetchedAt: number | null;
}

export const tasksAdapter = createEntityAdapter<Task>();

const initialState: TasksState = tasksAdapter.getInitialState({
  loading: false,
  error: null,
  lastFetchedAt: null,
});

export const tasksFeature = createFeature({
  name: 'tasks',
  reducer: createReducer(
    initialState,

    on(TasksActions.loadTasks, (state) => ({ ...state, loading: true, error: null })),
    on(TasksActions.loadTasksSuccess, (state, { tasks }) =>
      tasksAdapter.setAll(tasks, { ...state, loading: false, lastFetchedAt: Date.now() }),
    ),
    on(TasksActions.loadTasksFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(TasksActions.createTask, (state) => ({ ...state, error: null })),
    on(TasksActions.createTaskSuccess, (state, { task }) => tasksAdapter.addOne(task, state)),
    on(TasksActions.createTaskFailure, (state, { error }) => ({ ...state, error })),

    // Optimistic update: apply immediately, effect confirms or rolls back.
    on(TasksActions.updateTask, (state, { id, changes }) =>
      tasksAdapter.updateOne({ id, changes }, { ...state, error: null }),
    ),
    on(TasksActions.updateTaskSuccess, (state, { task }) => tasksAdapter.upsertOne(task, state)),
    on(TasksActions.updateTaskFailure, (state, { previous, error }) =>
      tasksAdapter.upsertOne(previous, { ...state, error }),
    ),

    on(TasksActions.moveTask, (state, { id, status }) =>
      tasksAdapter.updateOne({ id, changes: { status } }, state),
    ),

    // Optimistic delete: remove immediately, restore on failure.
    on(TasksActions.deleteTask, (state, { id }) =>
      tasksAdapter.removeOne(id, { ...state, error: null }),
    ),
    on(TasksActions.deleteTaskFailure, (state, { previous, error }) =>
      tasksAdapter.addOne(previous, { ...state, error }),
    ),
  ),
  extraSelectors: ({ selectTasksState }) => tasksAdapter.getSelectors(selectTasksState),
});

export const {
  name: tasksFeatureKey,
  reducer: tasksReducer,
  selectTasksState,
  selectEntities: selectTaskEntities,
  selectAll: selectAllTasks,
  selectLoading: selectTasksLoading,
  selectError: selectTasksError,
} = tasksFeature;
