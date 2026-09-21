import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskFilterService } from '../../core/services/task-filter.service';
import { TaskFormDialogComponent } from '../../features/tasks/task-form-dialog/task-form-dialog.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    TaskFormDialogComponent,
    ConfirmDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <app-sidebar
        [open]="sidebarOpen()"
        (newTask)="taskDialog.openCreate()"
        (closeRequested)="sidebarOpen.set(false)"
      />

      <div class="main">
        <app-header
          [searchQuery]="taskFilter.searchQuery()"
          (searchQueryChange)="taskFilter.searchQuery.set($event)"
          (menuToggle)="sidebarOpen.set(!sidebarOpen())"
        />

        <div class="content">
          <router-outlet />
        </div>
      </div>
    </div>

    <app-task-form-dialog />
    <p-confirmdialog />
  `,
  styles: `
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .main {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    @media (max-width: 640px) {
      .content {
        padding: 1rem;
      }
    }
  `,
})
export class ShellComponent {
  protected readonly taskDialog = inject(TaskDialogService);
  protected readonly taskFilter = inject(TaskFilterService);
  protected readonly sidebarOpen = signal(false);
}
