import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Assignee } from '../../../core/models';

@Component({
  selector: 'app-assignee-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="assignee">
      <span class="avatar-circle">{{ assignee().avatar }}</span>
      @if (showName()) {
        <span class="name">&#64;{{ firstName() }}</span>
      }
    </span>
  `,
  styles: `
    .assignee {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .avatar-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      font-size: 0.62rem;
      font-weight: 700;
      flex-shrink: 0;
    }
  `,
})
export class AssigneeAvatarComponent {
  readonly assignee = input.required<Assignee>();
  readonly showName = input(true);
  protected readonly firstName = () => this.assignee().name.split(' ')[0];
}
