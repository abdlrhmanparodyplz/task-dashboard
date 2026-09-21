import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TaskDialogService } from '../../../core/services/task-dialog.service';
import {
  PriorityFilter,
  StatusFilter,
  TaskFilterService,
} from '../../../core/services/task-filter.service';

interface StatusTab {
  label: string;
  value: StatusFilter;
}

const STATUS_TABS: StatusTab[] = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const PRIORITY_OPTIONS: { label: string; value: PriorityFilter }[] = [
  { label: 'All priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

@Component({
  selector: 'app-task-filter-bar',
  standalone: true,
  imports: [FormsModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-bar">
      <div class="tabs-scroll">
        <div class="tabs">
          @for (tab of statusTabs; track tab.value) {
            <button
              type="button"
              class="tab"
              [class.active]="filter.statusFilter() === tab.value"
              (click)="filter.statusFilter.set(tab.value)"
            >
              {{ tab.label }}
            </button>
          }
        </div>
      </div>

      <div class="right">
        <p-select
          [options]="priorityOptions"
          optionLabel="label"
          optionValue="value"
          [ngModel]="filter.priorityFilter()"
          (ngModelChange)="filter.priorityFilter.set($event)"
          placeholder="Priority"
          class="priority-select "
        />
        <button type="button" class="new-task" (click)="dialog.openCreate()">
          <i class="pi pi-plus"></i>
          New Task
        </button>
      </div>
    </div>
  `,
  styles: `
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: 0.5rem 0.75rem;
    }
    .tabs-scroll {
      overflow-x: auto;
      max-width: 100%;
      scrollbar-width: thin;
    }
    .tabs {
      display: flex;
      gap: 0.25rem;
      width: max-content;
    }
    .tab {
      border: none;
      background: transparent;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
    }
    .tab:hover {
      background: var(--color-bg-page);
    }
    .tab.active {
      background: var(--color-primary);
      color: #fff;
    }
    .right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .new-task {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border: none;
      background: var(--color-primary);
      color: #fff;
      padding: 0.8rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .new-task:hover {
      background: var(--color-primary-hover);
    }

    @media (max-width: 640px) {
      .filter-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .right {
        justify-content: space-between;
      }
    }
  `,
})
export class TaskFilterBarComponent {
  protected readonly filter = inject(TaskFilterService);
  protected readonly dialog = inject(TaskDialogService);
  protected readonly statusTabs = STATUS_TABS;
  protected readonly priorityOptions = PRIORITY_OPTIONS;
}
