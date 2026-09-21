import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Statistic } from '../../../core/models';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat-card">
      <div class="top">
        <span class="icon" [style.background]="tint()" [style.color]="statistic().color">
          <i class="pi" [class]="iconClass()"></i>
        </span>
        <span class="title">{{ statistic().title }}</span>
      </div>
      <div class="value">{{ statistic().value }}</div>
      <div class="change" [class]="statistic().changeType">
        {{ statistic().change }} {{ statistic().changeLabel }}
      </div>
    </div>
  `,
  styles: `
    .stat-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      padding: 1rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .title {
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .value {
      font-size: 1.7rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .change {
      font-size: 0.78rem;
      font-weight: 500;
    }
    .change.positive {
      color: var(--color-success);
    }
    .change.negative {
      color: var(--color-danger);
    }
    .change.neutral {
      color: var(--color-text-secondary);
    }
  `,
})
export class StatCardComponent {
  readonly statistic = input.required<Statistic>();

  private static readonly ICONS: Record<string, string> = {
    'stat-001': 'pi-chart-bar',
    'stat-002': 'pi-check-circle',
    'stat-003': 'pi-spin pi-sync',
    'stat-004': 'pi-exclamation-triangle',
  };

  protected readonly iconClass = () => StatCardComponent.ICONS[this.statistic().id] ?? 'pi-circle';
  protected readonly tint = () => `color-mix(in srgb, ${this.statistic().color} 15%, transparent)`;
}
