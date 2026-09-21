import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { ChartModule } from 'primeng/chart';
import { TasksActions, selectAllTasks } from '../../state/tasks';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [ChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1>Analytics</h1>
      <div class="charts">
        <div class="chart-card">
          <h3>Tasks by Status</h3>
          <p-chart type="doughnut" [data]="statusChartData()" [options]="chartOptions" />
        </div>
        <div class="chart-card">
          <h3>Tasks by Priority</h3>
          <p-chart type="bar" [data]="priorityChartData()" [options]="chartOptions" />
        </div>
      </div>
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
    .charts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1rem;
    }
    .chart-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    h3 {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-primary);
    }
  `,
})
export class AnalyticsPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly tasks = toSignal(this.store.select(selectAllTasks), { initialValue: [] });

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());
  }

  protected readonly chartOptions = {
    plugins: { legend: { position: 'bottom' as const } },
    maintainAspectRatio: false,
  };

  protected readonly statusChartData = computed(() => {
    const tasks = this.tasks();
    return {
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [
        {
          data: [
            tasks.filter((t) => t.status === 'todo').length,
            tasks.filter((t) => t.status === 'in_progress').length,
            tasks.filter((t) => t.status === 'done').length,
          ],
          backgroundColor: ['#1976D2', '#F57C00', '#388E3C'],
        },
      ],
    };
  });

  protected readonly priorityChartData = computed(() => {
    const tasks = this.tasks();
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          label: 'Tasks',
          data: [
            tasks.filter((t) => t.priority === 'high').length,
            tasks.filter((t) => t.priority === 'medium').length,
            tasks.filter((t) => t.priority === 'low').length,
          ],
          backgroundColor: ['#D32F2F', '#F57C00', '#388E3C'],
          borderRadius: 6,
        },
      ],
    };
  });
}
