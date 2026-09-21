import { TaskFilterService } from './task-filter.service';

describe('TaskFilterService', () => {
  let service: TaskFilterService;

  beforeEach(() => {
    service = new TaskFilterService();
  });

  it('starts with no filters applied', () => {
    expect(service.searchQuery()).toBe('');
    expect(service.statusFilter()).toBe('all');
    expect(service.priorityFilter()).toBe('all');
  });

  it('updates each filter independently', () => {
    service.searchQuery.set('bug');
    service.statusFilter.set('in_progress');
    service.priorityFilter.set('high');

    expect(service.searchQuery()).toBe('bug');
    expect(service.statusFilter()).toBe('in_progress');
    expect(service.priorityFilter()).toBe('high');
  });

  it('reset clears all filters back to defaults', () => {
    service.searchQuery.set('bug');
    service.statusFilter.set('done');
    service.priorityFilter.set('low');

    service.reset();

    expect(service.searchQuery()).toBe('');
    expect(service.statusFilter()).toBe('all');
    expect(service.priorityFilter()).toBe('all');
  });
});
