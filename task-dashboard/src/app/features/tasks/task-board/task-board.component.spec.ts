import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ConfirmationService } from 'primeng/api';
import type { Task, TaskStatus } from '../../../core/models';
import { TaskFilterService } from '../../../core/services/task-filter.service';
import { TasksActions, selectTasksError, selectTasksLoading } from '../../../state/tasks';
import {
  selectDoneTasks,
  selectInProgressTasks,
  selectTodoTasks,
} from '../../../state/tasks/tasks.selectors';
import { TaskBoardComponent } from './task-board.component';

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

describe('TaskBoardComponent', () => {
  let fixture: ComponentFixture<TaskBoardComponent>;
  let store: MockStore;
  let filter: TaskFilterService;

  function setup(selectors: {
    todo?: Task[];
    inProgress?: Task[];
    done?: Task[];
    loading?: boolean;
    error?: string | null;
  }) {
    TestBed.configureTestingModule({
      imports: [TaskBoardComponent],
      providers: [
        provideNoopAnimations(),
        ConfirmationService,
        provideMockStore({
          selectors: [
            { selector: selectTodoTasks, value: selectors.todo ?? [] },
            { selector: selectInProgressTasks, value: selectors.inProgress ?? [] },
            { selector: selectDoneTasks, value: selectors.done ?? [] },
            { selector: selectTasksLoading, value: selectors.loading ?? false },
            { selector: selectTasksError, value: selectors.error ?? null },
          ],
        }),
      ],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    filter = TestBed.inject(TaskFilterService);
    fixture = TestBed.createComponent(TaskBoardComponent);
    fixture.detectChanges();
  }

  afterEach(() => {
    filter?.reset();
    // provideMockStore's `selectors` option overrides the *shared, module-level*
    // selector functions in place — without resetting, that override leaks into
    // every other spec file in the same Karma run that imports the same selector.
    store?.resetSelectors();
  });

  it('dispatches loadTasks on init', () => {
    setup({});
    expect(store.dispatch).toHaveBeenCalledWith(TasksActions.loadTasks());
  });

  it('shows a loading spinner when loading and no tasks are cached yet', () => {
    setup({ loading: true });
    expect(fixture.nativeElement.querySelector('.loading')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.board')).toBeNull();
  });

  it('shows the board (not the spinner) once tasks exist, even while loading', () => {
    setup({ todo: [makeTask()], loading: true });
    expect(fixture.nativeElement.querySelector('.loading')).toBeNull();
    expect(fixture.nativeElement.querySelector('.board')).not.toBeNull();
  });

  it('renders three columns with the right counts', () => {
    setup({
      todo: [makeTask({ id: 't1' }), makeTask({ id: 't2' })],
      inProgress: [makeTask({ id: 't3' })],
      done: [],
    });
    const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.column-header h3');
    const counts: HTMLElement[] = fixture.nativeElement.querySelectorAll('.count');
    expect(Array.from(headers).map((h) => h.textContent)).toEqual(['To Do', 'In Progress', 'Done']);
    expect(Array.from(counts).map((c) => c.textContent)).toEqual(['2', '1', '0']);
  });

  it('shows an error message when the store has an error', () => {
    setup({ todo: [makeTask()], error: 'Network error' });
    expect(fixture.nativeElement.querySelector('.board-error')?.textContent).toContain(
      'Network error',
    );
  });

  it('filters tasks by search query across title and description', () => {
    setup({
      todo: [
        makeTask({ id: 't1', title: 'Fix login bug' }),
        makeTask({ id: 't2', title: 'Update docs', description: 'contains bug info' }),
        makeTask({ id: 't3', title: 'Unrelated task' }),
      ],
    });
    filter.searchQuery.set('bug');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-task-card');
    expect(cards.length).toBe(2);
  });

  it('filters tasks by priority', () => {
    setup({
      todo: [makeTask({ id: 't1', priority: 'high' }), makeTask({ id: 't2', priority: 'low' })],
    });
    filter.priorityFilter.set('high');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-task-card').length).toBe(1);
  });

  it('shows only the matching column when a status filter is applied', () => {
    setup({
      todo: [makeTask()],
      inProgress: [makeTask({ id: 't2' })],
      done: [makeTask({ id: 't3' })],
    });
    filter.statusFilter.set('done');
    fixture.detectChanges();

    const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('.column-header h3');
    expect(headers.length).toBe(1);
    expect(headers[0].textContent).toBe('Done');
  });

  it('dispatches moveTask when a card is dropped into a different column', () => {
    setup({ todo: [makeTask({ id: 't1' })] });
    const task = makeTask({ id: 't1' });
    const event = {
      previousContainer: { data: 'todo' },
      container: { data: 'done' as TaskStatus },
      item: { data: task },
    } as unknown as CdkDragDrop<TaskStatus>;

    fixture.componentInstance['onDrop'](event);

    expect(store.dispatch).toHaveBeenCalledWith(
      TasksActions.moveTask({ id: 't1', status: 'done', previous: task }),
    );
  });

  it('does nothing when a card is dropped back into the same column', () => {
    setup({ todo: [makeTask({ id: 't1' })] });
    const sameContainer = { data: 'todo' as TaskStatus };
    const event = {
      previousContainer: sameContainer,
      container: sameContainer,
      item: { data: makeTask({ id: 't1' }) },
    } as unknown as CdkDragDrop<TaskStatus>;

    fixture.componentInstance['onDrop'](event);

    expect(store.dispatch).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ type: TasksActions.moveTask.type }),
    );
  });

  it('dispatches deleteTask when a card requests deletion', () => {
    setup({ todo: [makeTask({ id: 't1' })] });
    const task = makeTask({ id: 't1' });

    fixture.componentInstance['onDelete'](task);

    expect(store.dispatch).toHaveBeenCalledWith(
      TasksActions.deleteTask({ id: 't1', previous: task }),
    );
  });
});
