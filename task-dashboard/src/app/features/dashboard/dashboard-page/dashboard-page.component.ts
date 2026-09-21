import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StatisticsResource } from '../../../core/services/statistics-resource.service';
import { TaskBoardComponent } from '../../tasks/task-board/task-board.component';
import { TaskFilterBarComponent } from '../../tasks/task-filter-bar/task-filter-bar.component';
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';
import { StatCardComponent } from '../stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    StatCardComponent,
    TaskFilterBarComponent,
    TaskBoardComponent,
    RecentActivityComponent,
    ProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="stats">
        @for (statistic of statisticsResource.statistics(); track statistic.id) {
          <app-stat-card [statistic]="statistic" />
        } @empty {
          @if (statisticsResource.isLoading()) {
            <p-progressSpinner class="spinner" strokeWidth="4" />
          }
        }
      </div>

      <app-task-filter-bar />
      <app-task-board />

      <app-recent-activity />
    </div>
  `,
  styles: `
    .page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
  `,
})
export class DashboardPageComponent {
  protected readonly statisticsResource = inject(StatisticsResource);
}
