import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MOCK_USERS } from '../../core/data/mock-users';
import type { Task } from '../../core/models';
import { TasksActions, selectAllTasks } from '../../state/tasks';
import { TeamPageComponent } from './team-page.component';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 't1',
    title: 'Task',
    description: 'Description',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-01',
    assignee: MOCK_USERS[0],
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TeamPageComponent', () => {
  let fixture: ComponentFixture<TeamPageComponent>;
  let store: MockStore;

  function setup(tasks: Task[]) {
    TestBed.configureTestingModule({
      imports: [TeamPageComponent],
      providers: [provideMockStore({ selectors: [{ selector: selectAllTasks, value: tasks }] })],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(TeamPageComponent);
    fixture.detectChanges();
  }

  it('dispatches loadTasks on init', () => {
    setup([]);
    expect(store.dispatch).toHaveBeenCalledWith(TasksActions.loadTasks());
  });

  it('renders one card per mock user', () => {
    setup([]);
    expect(fixture.nativeElement.querySelectorAll('.member-card').length).toBe(MOCK_USERS.length);
  });

  it('counts only non-done tasks assigned to each user', () => {
    setup([
      makeTask({ id: 't1', assignee: MOCK_USERS[0], status: 'todo' }),
      makeTask({ id: 't2', assignee: MOCK_USERS[0], status: 'in_progress' }),
      makeTask({ id: 't3', assignee: MOCK_USERS[0], status: 'done' }),
      makeTask({ id: 't4', assignee: MOCK_USERS[1], status: 'todo' }),
    ]);

    const counts: HTMLElement[] = fixture.nativeElement.querySelectorAll('.task-count');
    expect(counts[0].textContent).toBe('2 tasks');
    expect(counts[1].textContent).toBe('1 tasks');
    expect(counts[2].textContent).toBe('0 tasks');
  });
});
