import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import type { Task } from '../models';
import { MockDataStoreService } from '../services/mock-data-store.service';

const SIMULATED_LATENCY_MS = 500;

/** Endpoints that fail exactly once (their first request), to give the
 * app's retry logic something real to demonstrate on initial load. */
const attemptedOnce = new Set<string>();

function shouldSimulateTransientFailure(key: string): boolean {
  if (attemptedOnce.has(key)) {
    return false;
  }
  attemptedOnce.add(key);
  return true;
}

/** Test-only: clears the one-time-failure tracking so specs can run in isolation. */
export function resetMockApiAttempts(): void {
  attemptedOnce.clear();
}

/**
 * Serves `/api/tasks` and `/api/statistics` from an in-memory store seeded
 * from the generated mock JSON, standing in for a real backend so the rest
 * of the app can talk to `HttpClient`/`httpResource` normally.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const store = inject(MockDataStoreService);
  const [, , resource, id] = req.url.split('/');

  if (shouldSimulateTransientFailure(`${req.method} ${req.url}`)) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 503,
          statusText: 'Service Unavailable',
          url: req.url,
          error: { message: 'Temporary backend hiccup, please retry.' },
        }),
    ).pipe(delay(SIMULATED_LATENCY_MS));
  }

  const respond = (body: unknown, status = 200) =>
    of(new HttpResponse({ status, body })).pipe(delay(SIMULATED_LATENCY_MS));

  if (resource === 'statistics' && req.method === 'GET') {
    return from(store.getStatistics()).pipe(
      mergeMap((statistics) => respond({ statistics, lastUpdated: new Date().toISOString() })),
    );
  }

  if (resource === 'tasks') {
    if (req.method === 'GET' && !id) {
      return from(store.getTasks()).pipe(
        mergeMap((tasks) =>
          respond({
            tasks,
            meta: { totalCount: tasks.length, lastUpdated: new Date().toISOString() },
          }),
        ),
      );
    }

    if (req.method === 'POST') {
      const task = req.body as Task;
      return from(store.createTask(task)).pipe(mergeMap((created) => respond(created, 201)));
    }

    if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
      return from(store.updateTask(id, req.body as Partial<Task>)).pipe(
        mergeMap((updated) =>
          updated
            ? respond(updated)
            : throwError(
                () => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }),
              ),
        ),
      );
    }

    if (req.method === 'DELETE' && id) {
      return from(store.deleteTask(id)).pipe(
        mergeMap((deleted) =>
          deleted
            ? respond(null, 204)
            : throwError(
                () => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }),
              ),
        ),
      );
    }
  }

  return throwError(
    () => new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: req.url }),
  ).pipe(delay(SIMULATED_LATENCY_MS));
};
