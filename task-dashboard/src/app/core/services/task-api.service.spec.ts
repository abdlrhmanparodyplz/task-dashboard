import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Task, TasksResponse } from '../models';
import { TaskApiService } from './task-api.service';

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

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getTasks issues a GET to /api/tasks and unwraps the tasks array', () => {
    const tasks = [makeTask()];
    let result: Task[] | undefined;
    service.getTasks().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush({ tasks, meta: { totalCount: 1, lastUpdated: '' } } satisfies TasksResponse);

    expect(result).toEqual(tasks);
  });

  it('createTask issues a POST with the task body', () => {
    const task = makeTask();
    service.createTask(task).subscribe();

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(task);
    req.flush(task);
  });

  it('updateTask issues a PATCH to the task-specific endpoint', () => {
    service.updateTask('t1', { title: 'Renamed' }).subscribe();

    const req = httpMock.expectOne('/api/tasks/t1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ title: 'Renamed' });
    req.flush(makeTask({ title: 'Renamed' }));
  });

  it('deleteTask issues a DELETE to the task-specific endpoint', () => {
    service.deleteTask('t1').subscribe();

    const req = httpMock.expectOne('/api/tasks/t1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
