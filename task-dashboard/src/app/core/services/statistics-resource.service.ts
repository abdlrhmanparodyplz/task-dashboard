import { httpResource } from '@angular/common/http';
import { Injectable, effect } from '@angular/core';
import type { Statistic, StatisticsResponse } from '../models';

/**
 * Dashboard statistics, fetched with Angular's `httpResource` — a simple,
 * read-mostly signal-backed resource, deliberately kept outside NgRx since
 * there's no cross-feature state or mutation to justify the extra ceremony.
 *
 * `httpResource` has no built-in retry, so a one-shot auto-retry is wired up
 * by hand below — the mock API deliberately fails the first request to any
 * given endpoint once, to give this something real to demonstrate.
 */
@Injectable({ providedIn: 'root' })
export class StatisticsResource {
  private readonly resource = httpResource<Statistic[]>(() => ({ url: '/api/statistics' }), {
    parse: (raw) => (raw as StatisticsResponse).statistics,
    defaultValue: [],
  });

  readonly statistics = this.resource.value;
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  private hasRetried = false;

  constructor() {
    effect(() => {
      if (this.resource.error() && !this.hasRetried) {
        this.hasRetried = true;
        this.resource.reload();
      }
    });
  }

  reload(): void {
    this.hasRetried = false;
    this.resource.reload();
  }
}
