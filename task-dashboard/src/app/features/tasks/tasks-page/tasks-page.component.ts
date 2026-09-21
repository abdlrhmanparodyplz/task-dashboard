import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TaskBoardComponent } from '../task-board/task-board.component';
import { TaskFilterBarComponent } from '../task-filter-bar/task-filter-bar.component';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [TaskFilterBarComponent, TaskBoardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1>Tasks</h1>
      <app-task-filter-bar />
      <app-task-board />
    </div>
  `,
  styles: `
    .page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    h1 {
      margin: 0;
      font-size: 1.4rem;
      color: var(--color-text-primary);
    }
  `,
})
export class TasksPageComponent {}
