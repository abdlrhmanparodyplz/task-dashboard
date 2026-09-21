import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MOCK_USERS } from '../../../core/data/mock-users';
import type { Task } from '../../../core/models';
import { TaskDialogService } from '../../../core/services/task-dialog.service';
import { TasksActions } from '../../../state/tasks';
import { TaskFormDialogComponent } from './task-form-dialog.component';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Existing task',
    description: 'Existing description here',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-06-15',
    assignee: MOCK_USERS[1],
    tags: ['Backend'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TaskFormDialogComponent', () => {
  let fixture: ComponentFixture<TaskFormDialogComponent>;
  let dialog: TaskDialogService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskFormDialogComponent],
      providers: [provideNoopAnimations(), provideMockStore()],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    dialog = TestBed.inject(TaskDialogService);
    fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.detectChanges();
  });

  function form() {
    return fixture.componentInstance['form'];
  }

  it('resets to blank defaults when opened for creation', () => {
    form().patchValue({ title: 'Leftover' });
    dialog.openCreate();
    fixture.detectChanges();

    expect(form().value.title).toBe('');
    expect(form().value.priority).toBe('medium');
    expect(form().value.status).toBe('todo');
    expect(form().value.assigneeId).toBe(MOCK_USERS[0].id);
  });

  it('populates the form from the task being edited', () => {
    const task = makeTask();
    dialog.openEdit(task);
    fixture.detectChanges();

    expect(form().value.title).toBe(task.title);
    expect(form().value.description).toBe(task.description);
    expect(form().value.priority).toBe('high');
    expect(form().value.status).toBe('in_progress');
    expect(form().value.assigneeId).toBe(task.assignee.id);
    expect(form().value.tag).toBe('Backend');
    expect((form().value.dueDate as Date).toISOString().split('T')[0]).toBe('2026-06-15');
  });

  it('marks all fields as touched and does not dispatch when submitting an invalid form', () => {
    dialog.openCreate();
    fixture.detectChanges();

    fixture.componentInstance['submit']();

    expect(form().controls.title.touched).toBe(true);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches createTask with a fresh task and closes the dialog on valid submit', () => {
    dialog.openCreate();
    fixture.detectChanges();
    form().setValue({
      title: 'Write tests',
      description: 'A sufficiently long description',
      priority: 'low',
      status: 'todo',
      dueDate: new Date('2027-01-01'),
      assigneeId: MOCK_USERS[2].id,
      tag: 'Testing',
    });

    fixture.componentInstance['submit']();

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = (store.dispatch as jasmine.Spy).calls.mostRecent().args[0];
    expect(dispatched.type).toBe(TasksActions.createTask.type);
    expect(dispatched.task.title).toBe('Write tests');
    expect(dispatched.task.assignee).toEqual(MOCK_USERS[2]);
    expect(dispatched.task.tags).toEqual(['Testing']);
    expect(dialog.visible()).toBe(false);
  });

  it('does not require a future due date when editing an already-overdue task', () => {
    const overdueTask = makeTask({ dueDate: '2020-01-01' });
    dialog.openEdit(overdueTask);
    fixture.detectChanges();

    expect(form().controls.dueDate.errors).toBeNull();
    expect(form().valid).toBe(true);
  });

  it('dispatches updateTask with the existing id when editing', () => {
    const task = makeTask();
    dialog.openEdit(task);
    fixture.detectChanges();
    form().patchValue({ title: 'Renamed task' });

    fixture.componentInstance['submit']();

    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: TasksActions.updateTask.type,
        id: task.id,
        previous: task,
        changes: jasmine.objectContaining({ title: 'Renamed task' }),
      }),
    );
  });

  it('omits tags entirely when the tag field is left blank', () => {
    dialog.openCreate();
    fixture.detectChanges();
    form().setValue({
      title: 'No tag task',
      description: 'A sufficiently long description',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date('2027-01-01'),
      assigneeId: MOCK_USERS[0].id,
      tag: '',
    });

    fixture.componentInstance['submit']();

    const dispatched = (store.dispatch as jasmine.Spy).calls.mostRecent().args[0];
    expect(dispatched.task.tags).toEqual([]);
  });

  it('closes the dialog when Cancel is clicked', () => {
    dialog.openCreate();
    fixture.detectChanges();
    spyOn(dialog, 'close');

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const cancelBtn = buttons.find((b) => b.textContent?.trim() === 'Cancel')!;
    cancelBtn.click();

    expect(dialog.close).toHaveBeenCalled();
  });
});
