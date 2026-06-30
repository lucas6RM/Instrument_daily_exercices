import { effect, inject, Injectable, signal, computed } from '@angular/core';

import { Exercise } from '../../core/models/exercise';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { StorageService } from '../../core/services/storage.service';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private readonly storageService = inject(StorageService);

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
      id: crypto.randomUUID(),
    };
    this.exercises.update((list) => [...list, newExercise]);
  }

  updateExercise(id: string, changes: Partial<Exercise>): void {
    this.exercises.update((list) =>
      list.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    );
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
