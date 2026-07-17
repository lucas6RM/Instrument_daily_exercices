import { effect, inject, Injectable, signal, computed } from '@angular/core';

import { Exercise } from '../../core/models/exercise';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { StorageService } from '../../core/services/storage.service';
import { ProgressService } from '../progress/progress.service';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x4).toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private readonly storageService = inject(StorageService);
  private readonly progressService = inject(ProgressService);

  // --- État (signal readonly) ---
  readonly exercises = signal<Exercise[]>([]);

  // --- Computed ---
  readonly sortedExercises = computed(() =>
    [...this.exercises()].sort((a, b) => a.order - b.order),
  );

  // --- Persistance LocalStorage via effect ---
  private readonly persistEffect = effect(() => {
    const exercises = this.exercises();
    this.storageService.set<Exercise[]>(STORAGE_KEYS.EXERCISES, exercises);
  });

  // --- Chargement initial ---
  constructor() {
    this.loadFromStorage();
  }

  // --- Méthodes CRUD ---

  addExercise(exercise: Omit<Exercise, 'id'>): void {
    const newExercise: Exercise = {
      ...exercise,
      id: generateId(),
    };
    this.exercises.update((list) => [...list, newExercise]);

    // Propage l'exercice à la séance du jour si elle existe
    this.progressService.addExerciseToTodaySession(newExercise.id, newExercise.name);
  }

  updateExercise(id: string, changes: Partial<Exercise>): void {
    this.exercises.update((list) => list.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }

  deleteExercise(id: string): void {
    this.exercises.update((list) => list.filter((e) => e.id !== id));
  }

  setExercises(exercisesList: Exercise[]): void {
    this.exercises.set(exercisesList);
  }

  loadFromStorage(): void {
    const stored = this.storageService.get<Exercise[]>(STORAGE_KEYS.EXERCISES);
    if (stored) {
      this.exercises.set(stored);
    }
  }
}
