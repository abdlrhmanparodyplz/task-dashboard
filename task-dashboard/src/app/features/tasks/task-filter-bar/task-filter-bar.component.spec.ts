import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDialogService } from '../../../core/services/task-dialog.service';
import { TaskFilterService } from '../../../core/services/task-filter.service';
import { TaskFilterBarComponent } from './task-filter-bar.component';

describe('TaskFilterBarComponent', () => {
  let fixture: ComponentFixture<TaskFilterBarComponent>;
  let filter: TaskFilterService;
  let dialog: TaskDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskFilterBarComponent],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(TaskFilterBarComponent);
    filter = TestBed.inject(TaskFilterService);
    dialog = TestBed.inject(TaskDialogService);
    fixture.detectChanges();
  });

  it('renders all four status tabs with "All" active by default', () => {
    const tabs: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('.tab');
    expect(tabs.length).toBe(4);
    expect(tabs[0].textContent?.trim()).toBe('All');
    expect(tabs[0].classList.contains('active')).toBe(true);
  });

  it('clicking a tab updates the shared filter state', () => {
    const tabs: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('.tab');
    tabs[2].click();
    fixture.detectChanges();

    expect(filter.statusFilter()).toBe('in_progress');
    expect(tabs[2].classList.contains('active')).toBe(true);
    expect(tabs[0].classList.contains('active')).toBe(false);
  });

  it('clicking "New Task" opens the create dialog', () => {
    spyOn(dialog, 'openCreate');
    fixture.nativeElement.querySelector('.new-task').click();
    expect(dialog.openCreate).toHaveBeenCalled();
  });
});
