import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import type { Task } from '../models';
import { MockDataStoreService } from '../services/mock-data-store.service';
import { mockApiInterceptor, resetMockApiAttempts } from './mock-api.interceptor';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task',
    description: 'Description',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-01',
    assignee: { id: 'u1', name: 'John Doe', avatar: 'JD', email: 'john@doe.com' },
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('mockApiInterceptor', () => {
  let http: HttpClient;
  let store: jasmine.SpyObj<MockDataStoreService>;

  beforeEach(() => {
    resetMockApiAttempts();
    store = jasmine.createSpyObj<MockDataStoreService>('MockDataStoreService', [
      'getTasks',
      'getStatistics',
      'createTask',
      'updateTask',
      'deleteTask',
    ]);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
        { provide: MockDataStoreService, useValue: store },
      ],
    });
    http = TestBed.inject(HttpClient);
  });

  /** Consumes the one-time simulated failure for a given endpoint so the assertion below it is deterministic. */
  function warmUp(run: () => void): void {
    run();
    tick(600);
  }

  it('fails the first request to an endpoint with a 503, then succeeds on retry', fakeAsync(() => {
    store.getStatistics.and.returnValue(Promise.resolve([]));

    let error: HttpErrorResponse | undefined;
    http.get('/api/statistics').subscribe({ error: (e) => (error = e) });
    tick(600);
    expect(error?.status).toBe(503);

    let success: { statistics: unknown[] } | undefined;
    http.get<{ statistics: unknown[] }>('/api/statistics').subscribe((res) => (success = res));
    tick(600);
    expect(success?.statistics).toEqual([]);
  }));

  it('GET /api/tasks returns the task list with meta', fakeAsync(() => {
    warmUp(() => http.get('/api/tasks').subscribe({ error: () => undefined }));

    const tasks = [makeTask()];
    store.getTasks.and.returnValue(Promise.resolve(tasks));
    let result: { tasks: Task[]; meta: { totalCount: number } } | undefined;
    http
      .get<{ tasks: Task[]; meta: { totalCount: number } }>('/api/tasks')
      .subscribe((r) => (result = r));
    tick(600);

    expect(result?.tasks).toEqual(tasks);
    expect(result?.meta.totalCount).toBe(1);
  }));

  it('POST /api/tasks creates a task and responds 201', fakeAsync(() => {
    warmUp(() => http.post('/api/tasks', {}).subscribe({ error: () => undefined }));

    const task = makeTask();
    store.createTask.and.returnValue(Promise.resolve(task));
    let status: number | undefined;
    http
      .post('/api/tasks', task, { observe: 'response' })
      .subscribe((res) => (status = res.status));
    tick(600);

    expect(store.createTask).toHaveBeenCalledWith(task);
    expect(status).toBe(201);
  }));

  it('PATCH /api/tasks/:id updates and returns the updated task', fakeAsync(() => {
    warmUp(() => http.patch('/api/tasks/t1', {}).subscribe({ error: () => undefined }));

    const updated = makeTask({ title: 'Updated' });
    store.updateTask.and.returnValue(Promise.resolve(updated));
    let result: Task | undefined;
    http.patch<Task>('/api/tasks/t1', { title: 'Updated' }).subscribe((r) => (result = r));
    tick(600);

    expect(store.updateTask).toHaveBeenCalledWith('t1', { title: 'Updated' });
    expect(result).toEqual(updated);
  }));

  it('PATCH /api/tasks/:id responds 404 when the task does not exist', fakeAsync(() => {
    warmUp(() => http.patch('/api/tasks/missing', {}).subscribe({ error: () => undefined }));

    store.updateTask.and.returnValue(Promise.resolve(null));
    let error: HttpErrorResponse | undefined;
    http.patch('/api/tasks/missing', {}).subscribe({ error: (e) => (error = e) });
    tick(600);

    expect(error?.status).toBe(404);
  }));

  it('DELETE /api/tasks/:id responds 204', fakeAsync(() => {
    warmUp(() => http.delete('/api/tasks/t1').subscribe({ error: () => undefined }));

    store.deleteTask.and.returnValue(Promise.resolve(true));
    let status: number | undefined;
    http.delete('/api/tasks/t1', { observe: 'response' }).subscribe((res) => (status = res.status));
    tick(600);

    expect(status).toBe(204);
  }));

  it('DELETE /api/tasks/:id responds 404 for an unknown id', fakeAsync(() => {
    warmUp(() => http.delete('/api/tasks/missing').subscribe({ error: () => undefined }));

    store.deleteTask.and.returnValue(Promise.resolve(false));
    let error: HttpErrorResponse | undefined;
    http.delete('/api/tasks/missing').subscribe({ error: (e) => (error = e) });
    tick(600);

    expect(error?.status).toBe(404);
  }));

  it('responds 404 for an unknown /api resource', fakeAsync(() => {
    warmUp(() => http.get('/api/unknown').subscribe({ error: () => undefined }));

    let error: HttpErrorResponse | undefined;
    http.get('/api/unknown').subscribe({ error: (e) => (error = e) });
    tick(600);

    expect(error?.status).toBe(404);
  }));

  it('passes non-/api requests straight through to the next handler', () => {
    let result: unknown;
    http.get('/assets/data/tasks.json').subscribe((r) => (result = r));

    const httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/assets/data/tasks.json').flush({ passthrough: true });
    httpMock.verify();

    expect(result).toEqual({ passthrough: true });
  });
});
