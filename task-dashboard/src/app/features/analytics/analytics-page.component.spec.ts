import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { Task } from '../../core/models';
import { TasksActions, selectAllTasks } from '../../state/tasks';
import { AnalyticsPageComponent } from './analytics-page.component';

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
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('AnalyticsPageComponent', () => {
  let fixture: ComponentFixture<AnalyticsPageComponent>;
  let store: MockStore;

  function setup(tasks: Task[]) {
    TestBed.configureTestingModule({
      imports: [AnalyticsPageComponent],
      providers: [provideMockStore({ selectors: [{ selector: selectAllTasks, value: tasks }] })],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AnalyticsPageComponent);
    fixture.detectChanges();
  }

  // See TaskBoardComponent's spec for why this matters: overriding a shared
  // selector export leaks across spec files in the same Karma run otherwise.
  afterEach(() => store?.resetSelectors());

  it('dispatches loadTasks on init', () => {
    setup([]);
    expect(store.dispatch).toHaveBeenCalledWith(TasksActions.loadTasks());
  });

  it('computes the status chart data from the task list', () => {
    setup([
      makeTask({ status: 'todo' }),
      makeTask({ status: 'todo' }),
      makeTask({ status: 'in_progress' }),
      makeTask({ status: 'done' }),
    ]);
    const data = fixture.componentInstance['statusChartData']();
    expect(data.datasets[0].data).toEqual([2, 1, 1]);
  });

  it('computes the priority chart data from the task list', () => {
    setup([
      makeTask({ priority: 'high' }),
      makeTask({ priority: 'high' }),
      makeTask({ priority: 'medium' }),
      makeTask({ priority: 'low' }),
    ]);
    const data = fixture.componentInstance['priorityChartData']();
    expect(data.datasets[0].data).toEqual([2, 1, 1]);
  });

  it('renders both chart cards', () => {
    setup([]);
    const cards = fixture.nativeElement.querySelectorAll('.chart-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Tasks by Status');
    expect(cards[1].textContent).toContain('Tasks by Priority');
  });
});
