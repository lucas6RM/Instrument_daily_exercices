import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AudioAlertService } from '../../core/services/audio-alert.service';
import { TimerStore } from './timer.store';

describe('TimerStore', () => {
  let store: InstanceType<typeof TimerStore>;
  let audioAlert: AudioAlertService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    store = TestBed.inject(TimerStore);
    audioAlert = TestBed.inject(AudioAlertService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      expect(store.isRunning()).toBe(false);
      expect(store.remainingMs()).toBe(0);
      expect(store.currentExerciseId()).toBeNull();
      expect(store.startTime()).toBeNull();
    });
  });

  describe('start', () => {
    it('should start the timer with the given exerciseId and duration', () => {
      store.start('exercise-1', 60000);

      expect(store.isRunning()).toBe(true);
      expect(store.remainingMs()).toBe(60000);
      expect(store.currentExerciseId()).toBe('exercise-1');
      expect(store.startTime()).not.toBeNull();
    });

    it('should decrement remainingMs over time', () => {
      store.start('exercise-1', 60000);

      vi.advanceTimersByTime(3000);

      expect(store.remainingMs()).toBeLessThanOrEqual(57000);
      expect(store.remainingMs()).toBeGreaterThan(55000);
    });

    it('should stop automatically when time reaches 0', () => {
      store.start('exercise-1', 500);

      vi.advanceTimersByTime(1000);

      expect(store.isRunning()).toBe(false);
      expect(store.remainingMs()).toBe(0);
    });

    it('should play a beep on expiration', () => {
      const playBeepSpy = vi.spyOn(audioAlert, 'playBeep');

      store.start('exercise-1', 500);

      vi.advanceTimersByTime(1000);

      expect(playBeepSpy).toHaveBeenCalledTimes(1);
    });

    it('should reset all state on expiration', () => {
      store.start('exercise-1', 500);

      vi.advanceTimersByTime(1000);

      expect(store.isRunning()).toBe(false);
      expect(store.remainingMs()).toBe(0);
      expect(store.currentExerciseId()).toBeNull();
      expect(store.startTime()).toBeNull();
      expect(store.endTime()).toBeNull();
    });

    it('should play the beep only once on expiration', () => {
      const playBeepSpy = vi.spyOn(audioAlert, 'playBeep');

      store.start('exercise-1', 500);

      vi.advanceTimersByTime(2000);

      expect(playBeepSpy).toHaveBeenCalledTimes(1);
    });

    it('should clear previous interval when started again', () => {
      store.start('exercise-1', 60000);
      store.start('exercise-2', 30000);

      expect(store.currentExerciseId()).toBe('exercise-2');
      expect(store.remainingMs()).toBe(30000);
    });
  });

  describe('pause', () => {
    it('should pause the timer', () => {
      store.start('exercise-1', 60000);
      store.pause();

      expect(store.isRunning()).toBe(false);
      expect(store.currentExerciseId()).toBe('exercise-1');
      expect(store.remainingMs()).toBeGreaterThan(0);
    });

    it('should stop decrementing when paused', () => {
      store.start('exercise-1', 60000);
      vi.advanceTimersByTime(3000);
      const remainingBefore = store.remainingMs();

      store.pause();
      vi.advanceTimersByTime(3000);

      expect(store.remainingMs()).toBe(remainingBefore);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      store.start('exercise-1', 60000);
      vi.advanceTimersByTime(3000);
      store.reset();

      expect(store.isRunning()).toBe(false);
      expect(store.remainingMs()).toBe(0);
      expect(store.currentExerciseId()).toBeNull();
      expect(store.startTime()).toBeNull();
    });
  });

  describe('computed', () => {
    describe('remainingSeconds', () => {
      it('should return the remaining time in seconds (ceiled)', () => {
        store.start('exercise-1', 65000);

        expect(store.remainingSeconds()).toBe(65);
      });

      it('should return 0 when timer is not started', () => {
        expect(store.remainingSeconds()).toBe(0);
      });
    });

    describe('formattedTime', () => {
      it('should return formatted time as MM:SS', () => {
        store.start('exercise-1', 125000);

        expect(store.formattedTime()).toBe('02:05');
      });

      it('should return 00:00 when timer is not started', () => {
        expect(store.formattedTime()).toBe('00:00');
      });

      it('should handle less than a minute', () => {
        store.start('exercise-1', 45000);

        expect(store.formattedTime()).toBe('00:45');
      });
    });
  });
});
