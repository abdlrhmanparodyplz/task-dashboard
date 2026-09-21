import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import type { Task, TaskStatus } from '../../../core/models';
import { TaskDialogService } from '../../../core/services/task-dialog.service';
import { TaskFilterService } from '../../../core/services/task-filter.service';
import { TasksActions, selectTasksError, selectTasksLoading } from '../../../state/tasks';
import {
  selectDoneTasks,
  selectInProgressTasks,
  selectTodoTasks,
} from '../../../state/tasks/tasks.selectors';
import { TaskCardComponent } from '../task-card/task-card.component';

interface Column {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    TaskCardComponent,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    ProgressSpinnerModule,
    MessageModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading() && !hasAnyTasks()) {
      <div class="loading">
        <p-progressSpinner class="spinner" strokeWidth="4" />
      </div>
    } @else {
      @if (error()) {
        <p-message severity="error" class="board-error">{{ error() }}</p-message>
      }

      <div class="board" cdkDropListGroup>
        @for (column of columns(); track column.status) {
          <section class="column">
            <header class="column-header">
              <h3>{{ column.title }}</h3>
              <span class="count">{{ column.tasks.length }}</span>
            </header>

            <div
              class="column-body"
              cdkDropList
              [cdkDropListData]="column.status"
              (cdkDropListDropped)="onDrop($event)"
            >
              @for (task of column.tasks; track task.id) {
                <div cdkDrag [cdkDragData]="task">
                  <app-task-card
                    [task]="task"
                    (edit)="taskDialog.openEdit($event)"
                    (delete)="onDelete($event)"
                  />
                </div>
              } @empty {
                <p class="empty">No tasks here.</p>
              }
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: `
    .loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      align-items: start;
    }
    .column {
      background: var(--color-bg-page);
      border-radius: var(--radius-card);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      min-height: 120px;
    }
    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.25rem;
    }
    .column-header h3 {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }
    .count {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: 999px;
      padding: 0.05rem 0.55rem;
      font-size: 0.72rem;
      color: var(--color-text-secondary);
    }
    .column-body {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      min-height: 60px;
    }
    .empty {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      text-align: center;
      padding: 1rem 0;
      margin: 0;
    }
    .cdk-drag-preview {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      border-radius: var(--radius-card);
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
  `,
})
export class TaskBoardComponent implements OnInit {
  private readonly store = inject(Store);
  protected readonly taskDialog = inject(TaskDialogService);
  private readonly filter = inject(TaskFilterService);

  private readonly todo = toSignal(this.store.select(selectTodoTasks), { initialValue: [] });
  private readonly inProgress = toSignal(this.store.select(selectInProgressTasks), {
    initialValue: [],
  });
  private readonly done = toSignal(this.store.select(selectDoneTasks), { initialValue: [] });

  protected readonly loading = toSignal(this.store.select(selectTasksLoading), {
    initialValue: false,
  });
  protected readonly error = toSignal(this.store.select(selectTasksError), { initialValue: null });
  protected readonly hasAnyTasks = computed(
    () => this.todo().length + this.inProgress().length + this.done().length > 0,
  );

  private matchesFilters = (task: Task): boolean => {
    const query = this.filter.searchQuery().trim().toLowerCase();
    const priority = this.filter.priorityFilter();
    if (priority !== 'all' && task.priority !== priority) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
    );
  };

  protected readonly columns = computed<Column[]>(() => {
    const status = this.filter.statusFilter();
    const all: Column[] = [
      { status: 'todo', title: 'To Do', tasks: this.todo().filter(this.matchesFilters) },
      {
        status: 'in_progress',
        title: 'In Progress',
        tasks: this.inProgress().filter(this.matchesFilters),
      },
      { status: 'done', title: 'Done', tasks: this.done().filter(this.matchesFilters) },
    ];
    return status === 'all' ? all : all.filter((column) => column.status === status);
  });

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());
  }

  protected onDrop(event: CdkDragDrop<TaskStatus>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const task = event.item.data as Task;
    this.store.dispatch(
      TasksActions.moveTask({ id: task.id, status: event.container.data, previous: task }),
    );
  }

  protected onDelete(task: Task): void {
    this.store.dispatch(TasksActions.deleteTask({ id: task.id, previous: task }));
  }
}
