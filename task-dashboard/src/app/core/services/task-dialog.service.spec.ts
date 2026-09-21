import type { Task } from '../models';
import { TaskDialogService } from './task-dialog.service';

function makeTask(): Task {
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
  };
}

describe('TaskDialogService', () => {
  let service: TaskDialogService;

  beforeEach(() => {
    service = new TaskDialogService();
  });

  it('starts closed with no task being edited', () => {
    expect(service.visible()).toBe(false);
    expect(service.editingTask()).toBeNull();
  });

  it('openCreate shows the dialog with no editing task', () => {
    service.openEdit(makeTask());
    service.openCreate();

    expect(service.visible()).toBe(true);
    expect(service.editingTask()).toBeNull();
  });

  it('openEdit shows the dialog with the given task', () => {
    const task = makeTask();
    service.openEdit(task);

    expect(service.visible()).toBe(true);
    expect(service.editingTask()).toEqual(task);
  });

  it('close hides the dialog and clears the editing task', () => {
    service.openEdit(makeTask());
    service.close();

    expect(service.visible()).toBe(false);
    expect(service.editingTask()).toBeNull();
  });
});
