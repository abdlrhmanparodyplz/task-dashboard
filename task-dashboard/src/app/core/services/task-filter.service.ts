import { Injectable, signal } from '@angular/core';
import type { TaskPriority } from '../models';

export type StatusFilter = 'all' | 'todo' | 'in_progress' | 'done';
export type PriorityFilter = 'all' | TaskPriority;

/**
 * UI-local filter state for the task board (search box lives in the header,
 * filter tabs live on the board itself). Kept as plain signals — this is
 * ephemeral view state, not data worth putting in the NgRx store.
 */
@Injectable({ providedIn: 'root' })
export class TaskFilterService {
  readonly searchQuery = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly priorityFilter = signal<PriorityFilter>('all');

  reset(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
  }
}
