import type { Statistic, Task } from '../models';
import { MockDataStoreService } from './mock-data-store.service';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task one',
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

const STATISTICS: Statistic[] = [
  {
    id: 'stat-001',
    title: 'Total Tasks',
    icon: '📊',
    value: 1,
    change: '+1',
    changeLabel: 'today',
    changeType: 'positive',
    color: '#1976D2',
  },
];

describe('MockDataStoreService', () => {
  let service: MockDataStoreService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    service = new MockDataStoreService();
    fetchSpy = spyOn(window, 'fetch').and.callFake((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('tasks.json')) {
        return Promise.resolve({
          json: () => Promise.resolve({ tasks: [makeTask()] }),
        } as Response);
      }
      return Promise.resolve({
        json: () => Promise.resolve({ statistics: STATISTICS }),
      } as Response);
    });
  });

  it('fetches tasks from the JSON asset', async () => {
    const tasks = await service.getTasks();
    expect(tasks).toEqual([makeTask()]);
    expect(fetchSpy).toHaveBeenCalledWith('data/tasks.json');
  });

  it('fetches the JSON asset only once across multiple calls', async () => {
    await service.getTasks();
    await service.getTasks();
    expect(fetchSpy.calls.count()).toBe(1);
  });

  it('fetches statistics from the JSON asset', async () => {
    const statistics = await service.getStatistics();
    expect(statistics).toEqual(STATISTICS);
  });

  it('returns copies, so callers cannot mutate the internal store', async () => {
    const first = await service.getTasks();
    first.push(makeTask({ id: 'intruder' }));
    const second = await service.getTasks();
    expect(second.length).toBe(1);
  });

  it('createTask adds a new task to the front of the list', async () => {
    const created = makeTask({ id: 't2', title: 'New task' });
    await service.createTask(created);
    const tasks = await service.getTasks();
    expect(tasks[0]).toEqual(created);
    expect(tasks.length).toBe(2);
  });

  it('updateTask merges changes and stamps updatedAt', async () => {
    const updated = await service.updateTask('t1', { title: 'Renamed' });
    expect(updated?.title).toBe('Renamed');
    expect(updated?.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
  });

  it('updateTask returns null for an unknown id', async () => {
    const updated = await service.updateTask('missing', { title: 'x' });
    expect(updated).toBeNull();
  });

  it('deleteTask removes the task and returns true', async () => {
    const deleted = await service.deleteTask('t1');
    expect(deleted).toBe(true);
    const tasks = await service.getTasks();
    expect(tasks.length).toBe(0);
  });

  it('deleteTask returns false for an unknown id', async () => {
    const deleted = await service.deleteTask('missing');
    expect(deleted).toBe(false);
  });
});
