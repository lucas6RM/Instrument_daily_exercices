import { effect, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Exercise } from '../../core/models/exercise';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { StorageService } from '../../core/services/storage.service';

export const ExerciseStore = signalStore(
  { providedIn: 'root' },
  withState({ exercises: [] as Exercise[] }),
  withComputed(({ exercises }) => ({
    sortedExercises: () => [...exercises()].sort((a, b) => a.order - b.order),
  })),
  withMethods((store) => ({
    addExercise(exercise: Omit<Exercise, 'id'>): void {
      const newExercise: Exercise = {
        ...exercise,
        id: crypto.randomUUID(),
      };
      patchState(store, {
        exercises: [...store.exercises(), newExercise],
      });
    },
    updateExercise(id: string, changes: Partial<Exercise>): void {
      patchState(store, {
        exercises: store.exercises().map((e) => (e.id === id ? { ...e, ...changes } : e)),
      });
    },
    deleteExercise(id: string): void {
      patchState(store, {
        exercises: store.exercises().filter((e) => e.id !== id),
      });
    },
    setExercises(exercisesList: Exercise[]): void {
      patchState(store, { exercises: exercisesList });
    },
    loadFromStorage(): void {
      const storageService = inject(StorageService);
      const stored = storageService.get<Exercise[]>(STORAGE_KEYS.EXERCISES);
      if (stored) {
        patchState(store, { exercises: stored });
      }
    },
  })),
  withHooks((store) => ({
    onInit(): void {
      store.loadFromStorage();
      const storageService = inject(StorageService);
      effect(() => {
        const exercises = store.exercises();
        storageService.set<Exercise[]>(STORAGE_KEYS.EXERCISES, exercises);
      });
    },
  })),
);
