import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { TaskPriority } from '../../../core/models';

@Component({
  selector: 'app-priority-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="priority-tag" [class]="priority()">{{ label() }}</span>`,
  styles: `
    .priority-tag {
      display: inline-block;
      padding: 0.15rem 0.55rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      width: fit-content;
    }
    .high {
      color: var(--color-danger);
      background: var(--color-danger-bg);
    }
    .medium {
      color: var(--color-warning);
      background: var(--color-warning-bg);
    }
    .low {
      color: var(--color-success);
      background: var(--color-success-bg);
    }
  `,
})
export class PriorityTagComponent {
  readonly priority = input.required<TaskPriority>();
  protected readonly label = computed(() => this.priority().toUpperCase());
}
