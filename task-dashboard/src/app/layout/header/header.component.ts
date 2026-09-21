import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      <button
        type="button"
        class="menu-btn"
        aria-label="Toggle navigation menu"
        (click)="menuToggle.emit()"
      >
        <i class="pi pi-bars"></i>
      </button>

      <div class="search">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Search tasks..."
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQueryChange.emit($event)"
        />
      </div>

      <div class="actions">
        <button type="button" class="icon-btn" aria-label="Notifications">
          <i class="pi pi-bell"></i>
        </button>
        <div class="avatar">{{ userInitials() }}</div>
      </div>
    </header>
  `,
  styles: `
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: var(--color-bg-card);
      border-bottom: 1px solid var(--color-border);
    }

    .menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--color-text-primary);
      font-size: 1.1rem;
      cursor: pointer;
    }
    .menu-btn:hover {
      background: var(--color-bg-page);
    }

    .search {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      min-width: 0;
      max-width: 420px;
      padding: 0.5rem 0.85rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text-secondary);
      background: var(--color-bg-page);
    }
    .search input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      min-width: 0;
      font-size: 0.9rem;
      font-family: inherit;
      color: var(--color-text-primary);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 1rem;
    }
    .icon-btn:hover {
      background: var(--color-bg-page);
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    @media (max-width: 1024px) {
      .menu-btn {
        display: inline-flex;
      }
    }

    @media (max-width: 480px) {
      .search {
        max-width: none;
      }
      .icon-btn {
        display: none;
      }
    }
  `,
})
export class HeaderComponent {
  readonly searchQuery = input('');
  readonly userInitials = input('JD');
  readonly searchQueryChange = output<string>();
  readonly menuToggle = output<void>();
}
