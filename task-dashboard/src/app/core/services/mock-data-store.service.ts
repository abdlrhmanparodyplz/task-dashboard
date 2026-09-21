import { Injectable } from '@angular/core';
import type { Statistic, Task } from '../models';

/**
 * In-memory "database" backing the mock API interceptor. Seed data is
 * fetched once (via the native `fetch`, not `HttpClient`, so it never
 * re-enters the interceptor chain) from the JSON files produced by
 * `data-fetching/generate-data.js`, then mutated in place for the
 * lifetime of the tab — a lightweight stand-in for a real backend.
 */
@Injectable({ providedIn: 'root' })
export class MockDataStoreService {
  private tasksPromise: Promise<Task[]> | null = null;
  private statisticsPromise: Promise<Statistic[]> | null = null;

  private async loadTasks(): Promise<Task[]> {
    if (!this.tasksPromise) {
      this.tasksPromise = fetch('data/tasks.json')
        .then((res) => res.json())
        .then((json: { tasks: Task[] }) => json.tasks);
    }
    return this.tasksPromise;
  }

  private async loadStatistics(): Promise<Statistic[]> {
    if (!this.statisticsPromise) {
      this.statisticsPromise = fetch('data/statistics.json')
        .then((res) => res.json())
        .then((json: { statistics: Statistic[] }) => json.statistics);
    }
    return this.statisticsPromise;
  }

  async getTasks(): Promise<Task[]> {
    return [...(await this.loadTasks())];
  }

  async getStatistics(): Promise<Statistic[]> {
    return [...(await this.loadStatistics())];
  }

  async createTask(task: Task): Promise<Task> {
    const tasks = await this.loadTasks();
    tasks.unshift(task);
    return task;
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<Task | null> {
    const tasks = await this.loadTasks();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return null;
    }
    tasks[index] = { ...tasks[index], ...patch, updatedAt: new Date().toISOString() };
    return tasks[index];
  }

  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.loadTasks();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return false;
    }
    tasks.splice(index, 1);
    return true;
  }
}
