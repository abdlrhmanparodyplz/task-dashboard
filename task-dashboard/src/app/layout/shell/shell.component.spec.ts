import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { ConfirmationService } from 'primeng/api';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskFilterService } from '../../core/services/task-filter.service';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideNoopAnimations(),
        ConfirmationService,
        provideRouter([]),
        provideMockStore({
          initialState: {
            tasks: { ids: [], entities: {}, loading: false, error: null, lastFetchedAt: null },
          },
        }),
      ],
    });
    fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
  });

  it('starts with the sidebar closed', () => {
    expect(fixture.componentInstance['sidebarOpen']()).toBe(false);
  });

  it('opens the sidebar when the header requests a menu toggle', () => {
    fixture.nativeElement.querySelector('.menu-btn').click();
    fixture.detectChanges();
    expect(fixture.componentInstance['sidebarOpen']()).toBe(true);
  });

  it('closes the sidebar when it requests to close', () => {
    fixture.componentInstance['sidebarOpen'].set(true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('app-sidebar .new-task-btn').click();
    fixture.detectChanges();
    expect(fixture.componentInstance['sidebarOpen']()).toBe(false);
  });

  it('opens the create-task dialog when the sidebar requests a new task', () => {
    const dialog = TestBed.inject(TaskDialogService);
    fixture.nativeElement.querySelector('app-sidebar .new-task-btn').click();
    expect(dialog.visible()).toBe(true);
    expect(dialog.editingTask()).toBeNull();
  });

  it('forwards header search input into the shared TaskFilterService', () => {
    const filter = TestBed.inject(TaskFilterService);
    fixture.componentInstance['taskFilter'].searchQuery.set('bug');
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.search input');
    expect(filter.searchQuery()).toBe('bug');
    expect(input).not.toBeNull();
  });
});
