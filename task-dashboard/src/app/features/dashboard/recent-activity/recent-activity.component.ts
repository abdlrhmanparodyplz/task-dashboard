import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import type { Task } from '../../../core/models';
import { AssigneeAvatarComponent } from '../../../shared/components/assignee-avatar/assignee-avatar.component';
import { selectAllTasks } from '../../../state/tasks';

interface ActivityItem {
  id: string;
  task: Task;
  message: string;
  icon: string;
  timestamp: string;
}

function toMessage(task: Task): { message: string; icon: string } {
  if (task.status === 'done') {
    return { message: `completed "${task.title}"`, icon: 'pi-check-circle' };
  }
  if (task.status === 'in_progress') {
    return { message: `started working on "${task.title}"`, icon: 'pi-sync' };
  }
  return { message: `updated "${task.title}"`, icon: 'pi-pencil' };
}

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [AssigneeAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <h3>Recent Activity</h3>
      <ul>
        @for (item of activity(); track item.id) {
          <li>
            <app-assignee-avatar [assignee]="item.task.assignee" [showName]="false" />
            <div class="body">
              <p>
                <strong>{{ item.task.assignee.name }}</strong>
                {{ item.message }}
              </p>
              <span class="time">{{ timeAgo(item.timestamp) }}</span>
            </div>
          </li>
        } @empty {
          <li class="empty">No recent activity yet.</li>
        }
      </ul>
    </div>
  `,
  styles: `
    .panel {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: 1rem 1.1rem;
    }
    h3 {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      color: var(--color-text-primary);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    li {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
    }
    .body p {
      margin: 0;
      font-size: 0.82rem;
      color: var(--color-text-primary);
    }
    .time {
      font-size: 0.72rem;
      color: var(--color-text-secondary);
    }
    .empty {
      font-size: 0.82rem;
      color: var(--color-text-secondary);
    }
  `,
})
export class RecentActivityComponent {
  private readonly store = inject(Store);
  private readonly tasks = toSignal(this.store.select(selectAllTasks), { initialValue: [] });

  protected readonly activity = computed<ActivityItem[]>(() =>
    [...this.tasks()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((task) => {
        const { message, icon } = toMessage(task);
        return { id: task.id, task, message, icon, timestamp: task.updatedAt };
      }),
  );

  protected readonly timeAgo = timeAgo;
}
