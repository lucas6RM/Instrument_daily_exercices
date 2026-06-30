import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { ExerciseService } from './exercise.service';
import { StorageService } from '../../core/services/storage.service';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { Exercise } from '../../core/models/exercise';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let getSpy: ReturnType<typeof vi.fn>;
  let setSpy: ReturnType<typeof vi.fn>;
  let appRef: ApplicationRef;

  beforeEach(() => {
    getSpy = vi.fn(() => null);
    setSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        ExerciseService,
        {
          provide: StorageService,
          useValue: {
            get: getSpy,
            set: setSpy,
            remove: vi.fn(),
            keys: STORAGE_KEYS,
          },
        },
      ],
    });

    service = TestBed.inject(ExerciseService);
    appRef = TestBed.inject(ApplicationRef);
  });

  // Helper to trigger Angular's effect scheduler via ApplicationRef
  function tick(): void {
    appRef.tick();
  }

  describe('initial state', () => {
    it('should have exercises as an empty array', () => {
      expect(service.exercises()).toEqual([]);
    });

    it('should have sortedExercises as an empty array', () => {
      expect(service.sortedExercises()).toEqual([]);
    });
  });

  describe('sortedExercises', () => {
    it('should return exercises sorted by order ascending', () => {
      const exercises: Exercise[] = [
        { id: '3', name: 'C', durationMinutes: 5, order: 3 },
        { id: '1', name: 'A', durationMinutes: 5, order: 1 },
        { id: '2', name: 'B', durationMinutes: 5, order: 2 },
      ];
      service.setExercises(exercises);

      const sorted = service.sortedExercises();
      expect(sorted.map((e) => e.id)).toEqual(['1', '2', '3']);
    });

    it('should not mutate the original array', () => {
      const exercises: Exercise[] = [
        { id: '2', name: 'B', durationMinutes: 5, order: 2 },
        { id: '1', name: 'A', durationMinutes: 5, order: 1 },
      ];
      service.setExercises(exercises);

      service.sortedExercises();
      expect(service.exercises().map((e) => e.id)).toEqual(['2', '1']);
    });

    it('should return an empty array when exercises is empty', () => {
      expect(service.sortedExercises()).toEqual([]);
    });
  });

  describe('addExercise()', () => {
    it('should add a new exercise to the list', () => {
      const exercise = { name: 'Scales', durationMinutes: 10, order: 1 };
      service.addExercise(exercise);

      expect(service.exercises()).toHaveLength(1);
      expect(service.exercises()[0].name).toBe('Scales');
      expect(service.exercises()[0].durationMinutes).toBe(10);
      expect(service.exercises()[0].order).toBe(1);
    });

    it('should generate a unique id for the new exercise', () => {
      const exercise = { name: 'Scales', durationMinutes: 10, order: 1 };
      service.addExercise(exercise);

      const id = service.exercises()[0].id;
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should add multiple exercises', () => {
      service.addExercise({ name: 'A', durationMinutes: 5, order: 1 });
      service.addExercise({ name: 'B', durationMinutes: 10, order: 2 });

      expect(service.exercises()).toHaveLength(2);
    });

    it('should not include id in the input', () => {
      const exercise = { name: 'Scales', durationMinutes: 10, order: 1 };
      service.addExercise(exercise);

      expect(service.exercises()[0]).not.toHaveProperty('id', undefined);
    });

    it('should trigger persistence via effect', () => {
      setSpy.mockClear();
      const exercise = { name: 'Scales', durationMinutes: 10, order: 1 };
      service.addExercise(exercise);
      tick();

      expect(setSpy).toHaveBeenCalledWith(
        STORAGE_KEYS.EXERCISES,
        expect.arrayContaining([
          expect.objectContaining({ name: 'Scales' }),
        ]),
      );
    });
  });

  describe('updateExercise()', () => {
    beforeEach(() => {
      service.setExercises([
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
        { id: '2', name: 'Arpeggios', durationMinutes: 15, order: 2 },
      ]);
      tick();
      setSpy.mockClear();
    });

    it('should update an existing exercise', () => {
      service.updateExercise('1', { name: 'New Scales' });

      const updated = service.exercises().find((e) => e.id === '1');
      expect(updated?.name).toBe('New Scales');
    });

    it('should preserve unchanged fields', () => {
      service.updateExercise('1', { name: 'New Scales' });

      const updated = service.exercises().find((e) => e.id === '1');
      expect(updated?.durationMinutes).toBe(10);
      expect(updated?.order).toBe(1);
    });

    it('should not affect other exercises', () => {
      service.updateExercise('1', { name: 'New Scales' });

      const second = service.exercises().find((e) => e.id === '2');
      expect(second?.name).toBe('Arpeggios');
    });

    it('should do nothing for non-existent id', () => {
      const before = service.exercises();
      service.updateExercise('999', { name: 'Ghost' });

      expect(service.exercises()).toEqual(before);
    });

    it('should update the order field', () => {
      service.updateExercise('2', { order: 0 });

      const updated = service.exercises().find((e) => e.id === '2');
      expect(updated?.order).toBe(0);
    });

    it('should trigger persistence via effect', () => {
      service.updateExercise('1', { name: 'New Scales' });
      tick();

      expect(setSpy).toHaveBeenCalled();
    });
  });

  describe('deleteExercise()', () => {
    beforeEach(() => {
      service.setExercises([
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
        { id: '2', name: 'Arpeggios', durationMinutes: 15, order: 2 },
        { id: '3', name: 'Chords', durationMinutes: 20, order: 3 },
      ]);
      tick();
      setSpy.mockClear();
    });

    it('should remove the exercise with the matching id', () => {
      service.deleteExercise('2');

      expect(service.exercises()).toHaveLength(2);
      expect(service.exercises().map((e) => e.id)).toEqual(['1', '3']);
    });

    it('should not affect other exercises', () => {
      service.deleteExercise('2');

      expect(service.exercises()[0].name).toBe('Scales');
      expect(service.exercises()[1].name).toBe('Chords');
    });

    it('should do nothing for non-existent id', () => {
      const before = service.exercises();
      service.deleteExercise('999');

      expect(service.exercises()).toEqual(before);
    });

    it('should trigger persistence via effect', () => {
      service.deleteExercise('2');
      tick();

      expect(setSpy).toHaveBeenCalled();
    });

    it('should empty the list when deleting the last exercise', () => {
      service.deleteExercise('1');
      service.deleteExercise('3');
      service.deleteExercise('2');

      expect(service.exercises()).toEqual([]);
    });
  });

  describe('setExercises()', () => {
    it('should replace the entire exercises array', () => {
      const newExercises: Exercise[] = [
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
      ];
      service.setExercises(newExercises);

      expect(service.exercises()).toEqual(newExercises);
    });

    it('should overwrite previous exercises', () => {
      service.setExercises([
        { id: '1', name: 'Old', durationMinutes: 5, order: 1 },
      ]);
      service.setExercises([
        { id: '2', name: 'New', durationMinutes: 10, order: 1 },
      ]);

      expect(service.exercises()).toHaveLength(1);
      expect(service.exercises()[0].name).toBe('New');
    });

    it('should trigger persistence via effect', () => {
      setSpy.mockClear();
      service.setExercises([
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
      ]);
      tick();

      expect(setSpy).toHaveBeenCalled();
    });

    it('should accept an empty array', () => {
      service.setExercises([
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
      ]);
      service.setExercises([]);

      expect(service.exercises()).toEqual([]);
    });
  });

  describe('loadFromStorage()', () => {
    it('should load exercises from storage when data exists', () => {
      const stored: Exercise[] = [
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
        { id: '2', name: 'Arpeggios', durationMinutes: 15, order: 2 },
      ];
      getSpy.mockReturnValue(stored);

      service.loadFromStorage();

      expect(service.exercises()).toEqual(stored);
    });

    it('should not change exercises when storage is empty', () => {
      getSpy.mockReturnValue(null);

      service.loadFromStorage();

      expect(service.exercises()).toEqual([]);
    });

    it('should call storageService.get with the correct key', () => {
      getSpy.mockReturnValue([]);

      service.loadFromStorage();

      expect(getSpy).toHaveBeenCalledWith(STORAGE_KEYS.EXERCISES);
    });

    it('should trigger persistence via effect after loading', () => {
      setSpy.mockClear();
      const stored: Exercise[] = [
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
      ];
      getSpy.mockReturnValue(stored);

      service.loadFromStorage();
      tick();

      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.EXERCISES, stored);
    });
  });

  describe('persistence via effect()', () => {
    it('should call StorageService.set on service construction (initial empty state)', () => {
      tick();
      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.EXERCISES, []);
    });

    it('should call StorageService.set after addExercise', () => {
      setSpy.mockClear();
      service.addExercise({ name: 'Scales', durationMinutes: 10, order: 1 });
      tick();

      expect(setSpy).toHaveBeenCalled();
    });

    it('should call StorageService.set after updateExercise', () => {
      service.setExercises([
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
      ]);
      tick();
      setSpy.mockClear();

      service.updateExercise('1', { name: 'New Scales' });
      tick();

      expect(setSpy).toHaveBeenCalled();
    });

    it('should call StorageService.set after deleteExercise', () => {
      service.setExercises([
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
      ]);
      tick();
      setSpy.mockClear();

      service.deleteExercise('1');
      tick();

      expect(setSpy).toHaveBeenCalled();
    });

    it('should call StorageService.set after setExercises', () => {
      setSpy.mockClear();
      const exercises: Exercise[] = [
        { id: '1', name: 'Scales', durationMinutes: 10, order: 1 },
      ];
      service.setExercises(exercises);
      tick();

      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.EXERCISES, exercises);
    });

    it('should persist the correct data after each mutation', () => {
      setSpy.mockClear();

      const ex1: Exercise = {
        id: '1',
        name: 'Scales',
        durationMinutes: 10,
        order: 1,
      };
      service.setExercises([ex1]);
      tick();
      setSpy.mockClear();

      service.updateExercise('1', { name: 'Updated' });
      tick();

      const calls = setSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe(STORAGE_KEYS.EXERCISES);
      expect(lastCall[1]).toHaveLength(1);
      expect(lastCall[1][0].name).toBe('Updated');
    });
  });
});
