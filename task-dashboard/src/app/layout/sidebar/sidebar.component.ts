import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'pi-th-large', path: '/dashboard' },
  { label: 'Tasks', icon: 'pi-check-square', path: '/tasks' },
  { label: 'Calendar', icon: 'pi-calendar', path: '/calendar' },
  { label: 'Analytics', icon: 'pi-chart-bar', path: '/analytics' },
  { label: 'Team', icon: 'pi-users', path: '/team' },
  { label: 'Settings', icon: 'pi-cog', path: '/settings' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Only present (and interactive) below the tablet breakpoint; see .backdrop CSS. -->
    @if (open()) {
      <button
        type="button"
        class="backdrop"
        aria-label="Close navigation menu"
        (click)="closeRequested.emit()"
      ></button>
    }

    <aside class="sidebar" [class.open]="open()">
      <div class="brand">
        <span class="brand-icon"><i class="pi pi-th-large"></i></span>
        <span class="brand-name">Task Manager</span>
      </div>

      <nav class="nav">
        @for (item of navItems; track item.path) {
          <a
            class="nav-item"
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            (click)="closeRequested.emit()"
          >
            <i class="pi" [class]="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <button type="button" class="new-task-btn" (click)="newTask.emit(); closeRequested.emit()">
        <i class="pi pi-plus"></i>
        <span>New Task</span>
      </button>
    </aside>
  `,
  styles: `
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 240px;
      flex-shrink: 0;
      background: var(--color-bg-card);
      border-right: 1px solid var(--color-border);
      height: 100%;
      padding: 1rem 0.75rem;
      gap: 1.25rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem 0.75rem;
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--color-primary);
    }
    .brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--color-primary);
      color: #fff;
      font-size: 0.9rem;
    }

    .nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition:
        background-color 0.15s ease,
        color 0.15s ease;
    }
    .nav-item:hover {
      background: var(--color-bg-page);
      color: var(--color-text-primary);
    }
    .nav-item.active {
      background: var(--color-primary);
      color: #fff;
    }
    .nav-item i {
      font-size: 0.95rem;
      width: 1rem;
      text-align: center;
    }

    .new-task-btn {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem;
      border: none;
      border-radius: 8px;
      background: var(--color-primary);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .new-task-btn:hover {
      background: var(--color-primary-hover);
    }

    .backdrop {
      display: none;
      padding: 0;
      border: none;
      cursor: default;
    }

    /* Below tablet width the sidebar becomes an off-canvas drawer instead of a docked column. */
    @media (max-width: 1024px) {
      .sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 50;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        box-shadow: 0 0 24px rgba(0, 0, 0, 0.15);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        z-index: 40;
      }
    }
  `,
})
export class SidebarComponent {
  protected readonly navItems = NAV_ITEMS;
  readonly open = input(false);
  readonly newTask = output<void>();
  readonly closeRequested = output<void>();
}
