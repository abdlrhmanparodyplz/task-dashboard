import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ConfirmationService } from 'primeng/api';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideNoopAnimations(),
        ConfirmationService,
        provideMockStore({
          initialState: {
            tasks: { ids: [], entities: {}, loading: false, error: null, lastFetchedAt: null },
          },
        }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    TestBed.tick();
  });

  afterEach(() => httpMock.verify());

  it('shows a spinner while statistics are loading and no stat cards yet', () => {
    expect(fixture.nativeElement.querySelector('.spinner')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-stat-card')).toBeNull();
    httpMock.expectOne('/api/statistics').flush({ statistics: [], lastUpdated: '' });
  });

  it('renders a stat card per statistic once loaded', fakeAsync(() => {
    httpMock.expectOne('/api/statistics').flush({
      statistics: [
        {
          id: 'stat-001',
          title: 'Total Tasks',
          icon: '📊',
          value: 10,
          change: '+1',
          changeLabel: 'today',
          changeType: 'positive',
          color: '#1976D2',
        },
      ],
      lastUpdated: '2026-01-01T00:00:00.000Z',
    });
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-stat-card').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.spinner')).toBeNull();
  }));

  it('renders the filter bar, board, and recent activity panel', () => {
    expect(fixture.nativeElement.querySelector('app-task-filter-bar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-task-board')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-recent-activity')).not.toBeNull();
    httpMock.expectOne('/api/statistics').flush({ statistics: [], lastUpdated: '' });
  });
});
