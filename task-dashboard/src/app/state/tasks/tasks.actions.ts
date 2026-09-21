import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Task, TaskStatus } from '../../core/models';

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    /** Dispatched by the dashboard/board on load; effect decides whether the cache is fresh enough to skip the request. */
    'Load Tasks': emptyProps(),
    'Load Tasks Success': props<{ tasks: Task[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),

    'Create Task': props<{ task: Task }>(),
    'Create Task Success': props<{ task: Task }>(),
    'Create Task Failure': props<{ error: string }>(),

    // `previous` is supplied by the caller (which already holds the current task) so the
    // effect can roll back on failure without racing the reducer's own optimistic update.
    'Update Task': props<{ id: string; changes: Partial<Task>; previous: Task }>(),
    'Update Task Success': props<{ task: Task }>(),
    'Update Task Failure': props<{ previous: Task; error: string }>(),

    'Delete Task': props<{ id: string; previous: Task }>(),
    'Delete Task Success': props<{ id: string }>(),
    'Delete Task Failure': props<{ previous: Task; error: string }>(),

    /** Drag-and-drop column change — applied optimistically, rolled back on failure. */
    'Move Task': props<{ id: string; status: TaskStatus; previous: Task }>(),
  },
});
