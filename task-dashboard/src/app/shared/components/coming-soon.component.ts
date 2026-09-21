import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="coming-soon">
      <i class="pi pi-hammer"></i>
      <h2>{{ title() }}</h2>
      <p>This section isn't part of the assignment's scope yet — coming soon.</p>
    </div>
  `,
  styles: `
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 4rem 1rem;
      color: var(--color-text-secondary);
      text-align: center;
    }
    .pi {
      font-size: 2rem;
      color: var(--color-primary);
    }
    h2 {
      margin: 0;
      color: var(--color-text-primary);
    }
  `,
})
export class ComingSoonComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly title = toSignal(
    this.route.data.pipe(map((data) => (data['title'] as string) ?? 'Coming soon')),
    { initialValue: 'Coming soon' },
  );
}
