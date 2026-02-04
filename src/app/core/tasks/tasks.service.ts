import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type TaskDto = {
  id: string;
  userId?: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: any;
};

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private http: HttpClient) {}

  listPending() {
    return this.http.get<{ tasks: TaskDto[] }>(
      `${environment.apiBaseUrl}/tasks`,
    );
  }

  create(payload: { title: string; description: string }) {
    return this.http.post<{ task: TaskDto }>(
      `${environment.apiBaseUrl}/tasks`,
      payload,
    );
  }

  update(
    id: string,
    patch: Partial<Pick<TaskDto, 'title' | 'description' | 'completed'>>,
  ) {
    return this.http.put<void>(`${environment.apiBaseUrl}/tasks/${id}`, patch);
  }

  delete(id: string) {
    return this.http.delete<void>(`${environment.apiBaseUrl}/tasks/${id}`);
  }
}
