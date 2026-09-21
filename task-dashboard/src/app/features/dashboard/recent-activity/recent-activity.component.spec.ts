import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import type { Task } from '../../../core/models';
import { selectAllTasks } from '../../../state/tasks';
import { RecentActivityComponent } from './recent-activity.component';

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
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('RecentActivityComponent', () => {
  let fixture: ComponentFixture<RecentActivityComponent>;

  function setup(tasks: Task[]) {
    TestBed.configureTestingModule({
      imports: [RecentActivityComponent],
      providers: [provideMockStore({ selectors: [{ selector: selectAllTasks, value: tasks }] })],
    });
    fixture = TestBed.createComponent(RecentActivityComponent);
    fixture.detectChanges();
  }

  it('shows an empty state when there are no tasks', () => {
    setup([]);
    expect(fixture.nativeElement.querySelector('.empty')?.textContent).toBe(
      'No recent activity yet.',
    );
  });

  it('renders a message describing each task by its status', () => {
    setup([
      makeTask({ id: 't1', status: 'done', title: 'Ship feature' }),
      makeTask({ id: 't2', status: 'in_progress', title: 'Build feature' }),
      makeTask({ id: 't3', status: 'todo', title: 'Plan feature' }),
    ]);
    const items: HTMLElement[] = fixture.nativeElement.querySelectorAll('li p');
    const texts = Array.from(items).map((el) => el.textContent);
    expect(texts.some((t) => t?.includes('completed "Ship feature"'))).toBe(true);
    expect(texts.some((t) => t?.includes('started working on "Build feature"'))).toBe(true);
    expect(texts.some((t) => t?.includes('updated "Plan feature"'))).toBe(true);
  });

  it('sorts by most recently updated and caps the list at 5 items', () => {
    const tasks = Array.from({ length: 7 }, (_, i) =>
      makeTask({
        id: `t${i}`,
        title: `Task ${i}`,
        updatedAt: new Date(Date.now() - i * 60_000).toISOString(),
      }),
    );
    setup(tasks);

    const items = fixture.nativeElement.querySelectorAll('li:not(.empty)');
    expect(items.length).toBe(5);
    expect(items[0].textContent).toContain('Task 0');
  });
});
