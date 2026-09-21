import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ConfirmationService } from 'primeng/api';
import { TasksPageComponent } from './tasks-page.component';

describe('TasksPageComponent', () => {
  let fixture: ComponentFixture<TasksPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [
        provideNoopAnimations(),
        ConfirmationService,
        provideMockStore({
          initialState: {
            tasks: { ids: [], entities: {}, loading: false, error: null, lastFetchedAt: null },
          },
        }),
      ],
    });
    fixture = TestBed.createComponent(TasksPageComponent);
    fixture.detectChanges();
  });

  it('renders the page heading', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Tasks');
  });

  it('renders the filter bar and the board (no stat cards)', () => {
    expect(fixture.nativeElement.querySelector('app-task-filter-bar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-task-board')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-stat-card')).toBeNull();
  });
});
