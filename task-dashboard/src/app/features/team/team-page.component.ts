import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { MOCK_USERS } from '../../core/data/mock-users';
import { TasksActions, selectAllTasks } from '../../state/tasks';

@Component({
  selector: 'app-team-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1>Team</h1>
      <div class="grid">
        @for (member of members(); track member.id) {
          <div class="member-card">
            <span class="avatar">{{ member.avatar }}</span>
            <div class="info">
              <p class="name">{{ member.name }}</p>
              <p class="email">{{ member.email }}</p>
            </div>
            <span class="task-count">{{ member.taskCount }} tasks</span>
          </div>
        }
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
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .member-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: 1rem;
    }
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
    }
    .info {
      flex: 1;
      min-width: 0;
    }
    .name {
      margin: 0;
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 0.9rem;
    }
    .email {
      margin: 0;
      font-size: 0.78rem;
      color: var(--color-text-secondary);
    }
    .task-count {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
  `,
})
export class TeamPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly tasks = toSignal(this.store.select(selectAllTasks), { initialValue: [] });

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());
  }

  protected readonly members = computed(() =>
    MOCK_USERS.map((user) => ({
      ...user,
      taskCount: this.tasks().filter(
        (task) => task.assignee.id === user.id && task.status !== 'done',
      ).length,
    })),
  );
}
