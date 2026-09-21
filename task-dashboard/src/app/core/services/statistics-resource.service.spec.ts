import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import type { Statistic } from '../models';
import { StatisticsResource } from './statistics-resource.service';

const STATISTIC: Statistic = {
  id: 'stat-001',
  title: 'Total Tasks',
  icon: '📊',
  value: 156,
  change: '+12',
  changeLabel: 'this week',
  changeType: 'positive',
  color: '#1976D2',
};

describe('StatisticsResource', () => {
  let httpMock: HttpTestingController;
  let resource: StatisticsResource;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    resource = TestBed.inject(StatisticsResource);
    TestBed.tick();
  });

  afterEach(() => httpMock.verify());

  it('starts loading and then exposes the parsed statistics array', fakeAsync(() => {
    expect(resource.isLoading()).toBe(true);

    httpMock
      .expectOne('/api/statistics')
      .flush({ statistics: [STATISTIC], lastUpdated: '2026-01-01T00:00:00.000Z' });
    tick();
    TestBed.tick();

    expect(resource.statistics()).toEqual([STATISTIC]);
    expect(resource.isLoading()).toBe(false);
    expect(resource.error()).toBeUndefined();
  }));

  it('automatically retries once after a failed request', fakeAsync(() => {
    httpMock
      .expectOne('/api/statistics')
      .flush('error', { status: 503, statusText: 'Unavailable' });
    tick();
    TestBed.tick();
    tick();
    TestBed.tick();

    // The one-shot retry issues a second request behind the scenes.
    httpMock
      .expectOne('/api/statistics')
      .flush({ statistics: [STATISTIC], lastUpdated: '2026-01-01T00:00:00.000Z' });
    tick();
    TestBed.tick();

    expect(resource.statistics()).toEqual([STATISTIC]);
  }));

  it('reload() resets the retry flag and re-fetches', fakeAsync(() => {
    httpMock
      .expectOne('/api/statistics')
      .flush({ statistics: [STATISTIC], lastUpdated: '2026-01-01T00:00:00.000Z' });
    tick();
    TestBed.tick();

    resource.reload();
    tick();
    TestBed.tick();
    httpMock.expectOne('/api/statistics').flush({ statistics: [], lastUpdated: '' });
    tick();
    TestBed.tick();

    expect(resource.statistics()).toEqual([]);
  }));
});
