import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import type { Task } from '../../../core/models';
import { formatLocalDate } from '../../../shared/utils/task-date.util';
import { TaskCardComponent } from './task-card.component';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Fix the bug',
    description: 'A description of the bug',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-01-10',
    assignee: { id: 'u1', name: 'John Doe', avatar: 'JD', email: 'john@doe.com' },
    tags: ['Backend'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let confirmationService: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [provideNoopAnimations(), ConfirmationService],
    });
    fixture = TestBed.createComponent(TaskCardComponent);
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('renders the title and description', () => {
    fixture.componentRef.setInput('task', makeTask());
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.title')?.textContent).toBe('Fix the bug');
    expect(el.querySelector('.description')?.textContent).toBe('A description of the bug');
  });

  it('does not apply the overdue class for a task due in the future', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    fixture.componentRef.setInput('task', makeTask({ dueDate: formatLocalDate(future) }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-card').classList.contains('overdue')).toBe(
      false,
    );
  });

  it('applies the overdue class and icon for a past-due task', () => {
    fixture.componentRef.setInput('task', makeTask({ dueDate: '2020-01-01' }));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-card')?.classList.contains('overdue')).toBe(true);
    expect(el.querySelector('.due-row i')?.classList.contains('pi-exclamation-triangle')).toBe(
      true,
    );
  });

  it('renders the first tag when present', () => {
    fixture.componentRef.setInput('task', makeTask({ tags: ['Backend', 'Critical'] }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tag')?.textContent).toBe('Backend');
  });

  it('renders no tag element when the task has no tags', () => {
    fixture.componentRef.setInput('task', makeTask({ tags: [] }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tag')).toBeNull();
  });

  it('emits edit when the Edit menu item is invoked', () => {
    const task = makeTask();
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();

    let emitted: Task | undefined;
    fixture.componentInstance.edit.subscribe((t) => (emitted = t));
    const editItem = fixture.componentInstance['menuItems']()[0];
    editItem.command?.({} as never);

    expect(emitted).toEqual(task);
  });

  it('asks for confirmation before emitting delete, and only emits on accept', () => {
    const task = makeTask();
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();

    spyOn(confirmationService, 'confirm').and.callFake((options) => {
      options.accept?.();
      return confirmationService;
    });

    let emitted: Task | undefined;
    fixture.componentInstance.delete.subscribe((t) => (emitted = t));
    const deleteItem = fixture.componentInstance['menuItems']()[1];
    deleteItem.command?.({} as never);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(emitted).toEqual(task);
  });

  it('does not emit delete when the confirmation is rejected', () => {
    const task = makeTask();
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();

    spyOn(confirmationService, 'confirm').and.returnValue(confirmationService);

    let emitted: Task | undefined;
    fixture.componentInstance.delete.subscribe((t) => (emitted = t));
    const deleteItem = fixture.componentInstance['menuItems']()[1];
    deleteItem.command?.({} as never);

    expect(emitted).toBeUndefined();
  });
});
