import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { TasksService, TaskDto } from '../../../core/tasks/tasks.service';
import { AuthService } from '../../../core/auth/auth.service';

type TabKey = 'all' | 'pending' | 'completed';
type UiTask = TaskDto & { editing?: boolean };

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {
  readonly MAX_TITLE = 80;
  readonly MAX_DESC = 200;

  private readonly tasksService = inject(TasksService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');

  filterText = signal('');
  activeTab = signal<TabKey>('pending');

  pageSize = 4;
  page = signal(1);

  tasks = signal<UiTask[]>([]);

  createForm = new FormGroup({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_TITLE)],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.maxLength(this.MAX_DESC)],
    }),
  });

  async ngOnInit() {
    await this.fetchTasks();
  }

  async fetchTasks() {
    try {
      this.loading.set(true);
      this.errorMsg.set('');

      const res = await firstValueFrom(this.tasksService.listPending());
      const list = (res?.tasks ?? []).map((t) => ({ ...t, editing: false }));

      list.sort(
        (a, b) => this.toMillis(b.createdAt) - this.toMillis(a.createdAt),
      );

      this.tasks.set(list);
      this.resetPagination();
    } catch (e: any) {
      this.errorMsg.set('Error cargando tareas');
    } finally {
      this.loading.set(false);
    }
  }

  setTab(tab: TabKey) {
    this.activeTab.set(tab);
    this.resetPagination();
  }

  resetPagination() {
    this.page.set(1);
  }

  onFilterChange(value: string) {
    this.filterText.set(value ?? '');
    this.resetPagination();
  }

  clearError() {
    this.errorMsg.set('');
  }

  private normalize(s: string) {
    return (s || '').toLowerCase().trim();
  }

  filteredTasks = computed(() => {
    const tab = this.activeTab();
    const q = this.normalize(this.filterText());

    let list = this.tasks();

    if (tab === 'pending') list = list.filter((t) => !t.completed);
    if (tab === 'completed') list = list.filter((t) => t.completed);

    if (q) {
      list = list.filter((t) => {
        const hay = `${t.title ?? ''} ${t.description ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return [...list].sort(
      (a, b) => this.toMillis(b.createdAt) - this.toMillis(a.createdAt),
    );
  });

  pagedTasks = computed(() => {
    const list = this.filteredTasks();
    const start = (this.page() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    const len = this.filteredTasks().length;
    return Math.max(1, Math.ceil(len / this.pageSize));
  });

  totalAll = computed(() => this.tasks().length);
  totalPending = computed(
    () => this.tasks().filter((t) => !t.completed).length,
  );
  totalCompleted = computed(
    () => this.tasks().filter((t) => t.completed).length,
  );

  toMillis(ts: any): number {
    if (!ts) return 0;
    if (typeof ts === 'number') return ts;
    if (ts instanceof Date) return ts.getTime();

    const s = ts.seconds ?? ts._seconds;
    const ns = ts.nanoseconds ?? ts._nanoseconds ?? 0;

    if (typeof s === 'number') return s * 1000 + Math.floor(ns / 1_000_000);
    return 0;
  }

  formatCreatedAt(createdAt: any): string {
    if (!createdAt) return '';

    if (typeof createdAt === 'string') {
      const d = new Date(createdAt);
      return isNaN(d.getTime()) ? '' : d.toLocaleString();
    }

    const seconds = createdAt?.seconds ?? createdAt?._seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000).toLocaleString();
    }

    if (createdAt instanceof Date) {
      return createdAt.toLocaleString();
    }

    return '';
  }

  async createTask() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);

      const title = this.createForm.controls.title.value.trim();
      const description = this.createForm.controls.description.value.trim();

      await firstValueFrom(this.tasksService.create({ title, description }));

      this.createForm.reset({ title: '', description: '' });
      await this.fetchTasks();
    } catch (e: any) {
      this.errorMsg.set('Error al crear la tarea. Verifica los datos enviados');
    } finally {
      this.loading.set(false);
    }
  }

  startEdit(t: UiTask) {
    t.editing = true;
  }

  cancelEdit(t: UiTask) {
    t.editing = false;
  }

  async saveEdit(t: UiTask, title: string, description: string) {
    const newTitle = (title || '').trim();
    const newDesc = (description || '').trim();

    if (!newTitle) {
      this.errorMsg.set('El título es requerido');
      return;
    }
    if (newTitle.length > this.MAX_TITLE) {
      this.errorMsg.set(
        `El título no puede exceder ${this.MAX_TITLE} caracteres`,
      );
      return;
    }
    if (newDesc.length > this.MAX_DESC) {
      this.errorMsg.set(
        `La descripción no puede exceder ${this.MAX_DESC} caracteres`,
      );
      return;
    }

    try {
      this.loading.set(true);

      await firstValueFrom(
        this.tasksService.update(t.id, {
          title: newTitle,
          description: newDesc,
        }),
      );

      t.editing = false;
      await this.fetchTasks();
    } catch (e: any) {
      this.errorMsg.set('No se pudo editar la tarea');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteTask(t: UiTask) {
    try {
      this.loading.set(true);
      await firstValueFrom(this.tasksService.delete(t.id));
      await this.fetchTasks();
    } catch (e: any) {
      this.errorMsg.set('No se pudo eliminar la tarea');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleCompleted(t: UiTask) {
    try {
      this.loading.set(true);
      await firstValueFrom(
        this.tasksService.update(t.id, { completed: !t.completed }),
      );
      await this.fetchTasks();
    } catch (e: any) {
      this.errorMsg.set('No se pudo actualizar el estado');
    } finally {
      this.loading.set(false);
    }
  }

  trackById = (_: number, t: UiTask) => t.id;

  onEditInput() {}

  prevPage() {
    if (this.page() > 1) this.page.set(this.page() - 1);
  }

  nextPage() {
    if (this.page() < this.totalPages()) this.page.set(this.page() + 1);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
