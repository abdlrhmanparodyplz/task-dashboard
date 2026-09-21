import { createSelector } from '@ngrx/store';
import { isTaskOverdue } from '../../shared/utils/task-date.util';
import { selectAllTasks } from './tasks.reducer';

export const selectTodoTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'todo'),
);

export const selectInProgressTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'in_progress'),
);

export const selectDoneTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.status === 'done'),
);

export const selectOverdueTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter(isTaskOverdue),
);

export const selectTaskCounts = createSelector(
  selectAllTasks,
  selectOverdueTasks,
  (tasks, overdue) => ({
    total: tasks.length,
    completed: tasks.filter((task) => task.status === 'done').length,
    inProgress: tasks.filter((task) => task.status === 'in_progress').length,
    overdue: overdue.length,
  }),
);
