import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import type { Task, TasksResponse } from '../models';

/** Thin HTTP client for the `/api/tasks` mock endpoint, used by the NgRx effects. */
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);

  getTasks(): Observable<Task[]> {
    return this.http.get<TasksResponse>('/api/tasks').pipe(
      retry(1),
      map((response) => response.tasks),
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>('/api/tasks', task).pipe(retry(1));
  }

  updateTask(id: string, changes: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`/api/tasks/${id}`, changes).pipe(retry(1));
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`).pipe(retry(1));
  }
}
