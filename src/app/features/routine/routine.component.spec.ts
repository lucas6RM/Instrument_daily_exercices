import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { RoutineComponent } from './routine.component';
import { ExerciseStore } from '../exercise/exercise.store';
import { Exercise } from '../../core/models/exercise';

describe('RoutineComponent', () => {
  let component: RoutineComponent;
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  const mockExercises: Exercise[] = [
    { id: 'ex-1', name: 'Échauffement', durationMinutes: 5, order: 0 },
    { id: 'ex-2', name: 'Cardio', durationMinutes: 15, order: 1 },
  ];

  const mockStore = {
    exercises: vi.fn(),
    sortedExercises: vi.fn(),
    deleteExercise: vi.fn(),
    addExercise: vi.fn(),
    updateExercise: vi.fn(),
    setExercises: vi.fn(),
    loadFromStorage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    confirmSpy = vi.spyOn(window, 'confirm');

    mockStore.exercises.mockReturnValue(mockExercises);
    mockStore.sortedExercises.mockReturnValue(mockExercises);

    TestBed.configureTestingModule({
      imports: [RoutineComponent],
      providers: [
        { provide: ExerciseStore, useValue: mockStore },
      ],
    });

    const fixture = TestBed.createComponent(RoutineComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('onDelete', () => {
    it('should call store.deleteExercise when user confirms', () => {
      confirmSpy.mockReturnValue(true);

      component.onDelete('ex-1');

      expect(mockStore.deleteExercise).toHaveBeenCalledWith('ex-1');
    });

    it('should NOT call store.deleteExercise when user cancels', () => {
      confirmSpy.mockReturnValue(false);

      component.onDelete('ex-1');

      expect(mockStore.deleteExercise).not.toHaveBeenCalled();
    });

    it('should NOT call store.deleteExercise when exercise does not exist', () => {
      confirmSpy.mockReturnValue(true);

      component.onDelete('non-existent-id');

      expect(mockStore.deleteExercise).not.toHaveBeenCalled();
      expect(confirmSpy).not.toHaveBeenCalled();
    });
  });
});
