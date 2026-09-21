import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import type { Task } from '../../../core/models';
import { AssigneeAvatarComponent } from '../../../shared/components/assignee-avatar/assignee-avatar.component';
import { PriorityTagComponent } from '../../../shared/components/priority-tag/priority-tag.component';
import { getDueDateLabel, isTaskOverdue } from '../../../shared/utils/task-date.util';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [PriorityTagComponent, AssigneeAvatarComponent, MenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="task-card" [class.overdue]="overdue()">
      <header class="card-top">
        <app-priority-tag [priority]="task().priority" />
        <button
          type="button"
          class="menu-btn"
          aria-label="Task actions"
          (click)="menu.toggle($event)"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>
        <p-menu #menu [popup]="true" [model]="menuItems()" appendTo="body" />
      </header>

      <h4 class="title">{{ task().title }}</h4>
      <p class="description">{{ task().description }}</p>

      <div class="due-row" [class.overdue-text]="overdue()">
        <i
          class="pi"
          [class.pi-exclamation-triangle]="overdue()"
          [class.pi-calendar]="!overdue()"
        ></i>
        <span>{{ dueLabel() }}</span>
      </div>
      @if (task().tags.length) {
        <div class="tag">{{ task().tags[0] }}</div>
      }

      <footer class="card-footer">
        <app-assignee-avatar [assignee]="task().assignee" />
      </footer>
    </article>
  `,
  styles: `
    .task-card {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 0.85rem 0.9rem;
      border-radius: 8px;
      background: var(--color-bg-card);
      border-top: 1px solid var(--color-border);
      cursor: grab;
    }
    .task-card.overdue {
      background: var(--color-danger-bg);
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-danger);
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
    }
    .menu-btn {
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .menu-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .title {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .description {
      margin: 0;
      font-size: 0.78rem;
      color: var(--color-text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .due-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    .due-row.overdue-text {
      color: var(--color-danger);
    }
    .due-row i {
      font-size: 0.7rem;
    }

    .tag {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      padding-bottom: 0.4rem;
      border-bottom: 1px solid var(--color-border);
    }

    .card-footer {
      display: flex;
      align-items: center;
    }
  `,
})
export class TaskCardComponent {
  readonly task = input.required<Task>();

  readonly edit = output<Task>();
  readonly delete = output<Task>();

  protected readonly overdue = computed(() => isTaskOverdue(this.task()));
  protected readonly dueLabel = computed(() => getDueDateLabel(this.task()));

  protected readonly menuItems = computed<MenuItem[]>(() => [
    { label: 'Edit', icon: 'pi pi-pencil', command: () => this.edit.emit(this.task()) },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      styleClass: 'danger-item',
      command: () => this.delete.emit(this.task()),
    },
  ]);
}
