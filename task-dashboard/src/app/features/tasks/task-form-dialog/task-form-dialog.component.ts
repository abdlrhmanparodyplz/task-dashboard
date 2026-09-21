import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MOCK_USERS } from '../../../core/data/mock-users';
import type { Task, TaskPriority, TaskStatus } from '../../../core/models';
import { TaskDialogService } from '../../../core/services/task-dialog.service';
import { notBlankValidator, notInPastValidator } from '../../../shared/validators/task-validators';
import { TasksActions } from '../../../state/tasks';

const PRIORITY_OPTIONS: { label: string; value: TaskPriority }[] = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-dialog
      [visible]="dialog.visible()"
      (visibleChange)="!$event && dialog.close()"
      [modal]="true"
      [style]="{ width: '32rem' }"
      [breakpoints]="{ '960px': '75vw', '640px': '92vw' }"
      [header]="dialog.editingTask() ? 'Edit Task' : 'New Task'"
    >
      <form [formGroup]="form" (ngSubmit)="submit()" class="task-form">
        <div class="field">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            pInputText
            formControlName="title"
            placeholder="Task title"
          />
          @if (form.controls.title.invalid && form.controls.title.touched) {
            <small class="error">
              @if (form.controls.title.errors?.['required']) {
                Title is required.
              } @else if (form.controls.title.errors?.['blank']) {
                Title can't be just whitespace.
              }
            </small>
          }
        </div>

        <div class="field">
          <label for="description">Description</label>
          <textarea
            id="description"
            pTextarea
            rows="3"
            formControlName="description"
            placeholder="What needs to be done?"
          ></textarea>
          @if (form.controls.description.invalid && form.controls.description.touched) {
            <small class="error">
              @if (form.controls.description.errors?.['required']) {
                Description is required.
              } @else if (form.controls.description.errors?.['minlength']) {
                Description should be at least 10 characters.
              }
            </small>
          }
        </div>

        <div class="field-row">
          <div class="field">
            <label for="priority">Priority</label>
            <p-select
              inputId="priority"
              [options]="priorityOptions"
              optionLabel="label"
              optionValue="value"
              formControlName="priority"
              placeholder="Select priority"
            />
          </div>
          <div class="field">
            <label for="status">Status</label>
            <p-select
              inputId="status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              formControlName="status"
              placeholder="Select status"
            />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="dueDate">Due date</label>
            <p-datepicker
              inputId="dueDate"
              formControlName="dueDate"
              dateFormat="yy-mm-dd"
              [showIcon]="true"
            />
            @if (form.controls.dueDate.invalid && form.controls.dueDate.touched) {
              <small class="error">
                @if (form.controls.dueDate.errors?.['required']) {
                  Due date is required.
                } @else if (form.controls.dueDate.errors?.['pastDate']) {
                  Due date can't be in the past.
                }
              </small>
            }
          </div>
          <div class="field">
            <label for="assignee">Assignee</label>
            <p-select
              inputId="assignee"
              [options]="assigneeOptions"
              optionLabel="name"
              optionValue="id"
              formControlName="assigneeId"
              placeholder="Assign to"
            />
          </div>
        </div>

        <div class="field">
          <label for="tag">Tag</label>
          <input
            id="tag"
            type="text"
            pInputText
            formControlName="tag"
            placeholder="e.g. Frontend"
          />
        </div>

        <footer class="dialog-actions">
          <button type="button" pButton severity="secondary" [text]="true" (click)="dialog.close()">
            Cancel
          </button>
          <button type="submit" pButton [disabled]="form.invalid">Save</button>
        </footer>
      </form>
    </p-dialog>
  `,
  styles: `
    .task-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
    }
    .field-row {
      display: flex;
      gap: 1rem;
    }
    label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    input,
    textarea,
    p-select,
    p-datepicker {
      width: 100%;
    }
    .error {
      color: var(--color-danger);
      font-size: 0.75rem;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      margin-top: 0.5rem;
    }

    @media (max-width: 480px) {
      .field-row {
        flex-direction: column;
      }
    }
  `,
})
export class TaskFormDialogComponent {
  protected readonly dialog = inject(TaskDialogService);
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  protected readonly priorityOptions = PRIORITY_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly assigneeOptions = MOCK_USERS;

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, notBlankValidator()]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    priority: ['medium' as TaskPriority, Validators.required],
    status: ['todo' as TaskStatus, Validators.required],
    dueDate: [null as Date | null, [Validators.required, notInPastValidator()]],
    assigneeId: [MOCK_USERS[0].id, Validators.required],
    tag: [''],
  });

  constructor() {
    // Reset the form to the task being edited (or a blank slate) whenever the dialog opens.
    effect(() => {
      const task = this.dialog.editingTask();
      if (!this.dialog.visible()) {
        return;
      }
      // Editing an already-overdue task shouldn't force the user to also push its due
      // date into the future just to save an unrelated change (e.g. fixing a typo).
      this.form.controls.dueDate.setValidators(
        task ? [Validators.required] : [Validators.required, notInPastValidator()],
      );
      this.form.controls.dueDate.updateValueAndValidity();

      if (task) {
        this.form.reset({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: new Date(task.dueDate),
          assigneeId: task.assignee.id,
          tag: task.tags[0] ?? '',
        });
      } else {
        this.form.reset({
          title: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          dueDate: null,
          assigneeId: MOCK_USERS[0].id,
          tag: '',
        });
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const assignee = MOCK_USERS.find((user) => user.id === value.assigneeId)!;
    const dueDate = value.dueDate!.toISOString().split('T')[0];
    const editing = this.dialog.editingTask();

    if (editing) {
      this.store.dispatch(
        TasksActions.updateTask({
          id: editing.id,
          previous: editing,
          changes: {
            title: value.title,
            description: value.description,
            priority: value.priority,
            status: value.status,
            dueDate,
            assignee,
            tags: value.tag ? [value.tag] : [],
          },
        }),
      );
    } else {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: `task-${crypto.randomUUID()}`,
        title: value.title,
        description: value.description,
        priority: value.priority,
        status: value.status,
        dueDate,
        assignee,
        tags: value.tag ? [value.tag] : [],
        createdAt: now,
        updatedAt: now,
      };
      this.store.dispatch(TasksActions.createTask({ task: newTask }));
    }

    this.dialog.close();
  }
}
