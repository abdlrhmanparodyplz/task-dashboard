import { Injectable, signal } from '@angular/core';
import type { Task } from '../models';

/** Drives the create/edit task dialog from anywhere in the app (sidebar "New Task", board cards, ...). */
@Injectable({ providedIn: 'root' })
export class TaskDialogService {
  readonly visible = signal(false);
  readonly editingTask = signal<Task | null>(null);

  openCreate(): void {
    this.editingTask.set(null);
    this.visible.set(true);
  }

  openEdit(task: Task): void {
    this.editingTask.set(task);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.editingTask.set(null);
  }
}
