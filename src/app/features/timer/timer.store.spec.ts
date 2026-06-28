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

    it('should set endTime to startTime plus durationMs', () => {
      store.start('exercise-1', 60000);

      const startTime = store.startTime()!;
      const endTime = store.endTime()!;

      expect(endTime - startTime).toBe(60000);
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

    it('should stop on expiration but preserve exerciseId for dashboard reaction', () => {
      store.start('exercise-1', 500);

      vi.advanceTimersByTime(1000);

      expect(store.isRunning()).toBe(false);
      expect(store.remainingMs()).toBe(0);
      // currentExerciseId is preserved so the dashboard can auto-complete
      expect(store.currentExerciseId()).toBe('exercise-1');
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

    it('should store the exact durationMs value', () => {
      store.start('exercise-1', 45000);

      expect(store.durationMs()).toBe(45000);
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

    it('should calculate remainingMs correctly based on elapsed time', () => {
      store.start('exercise-1', 60000);
      vi.advanceTimersByTime(10000);

      store.pause();

      // After 10s elapsed from 60s, remaining should be ~50000
      expect(store.pausedRemainingMs()).toBeGreaterThan(48000);
      expect(store.pausedRemainingMs()).toBeLessThanOrEqual(51000);
    });

    it('should preserve exerciseId after pause', () => {
      store.start('exercise-1', 60000);
      store.pause();

      expect(store.currentExerciseId()).toBe('exercise-1');
    });

    it('should set isRunning to false', () => {
      store.start('exercise-1', 60000);
      store.pause();

      expect(store.isRunning()).toBe(false);
    });
  });

  describe('resume', () => {
    it('should resume a paused timer', () => {
      store.start('exercise-1', 60000);
      store.pause();

      store.resume();

      expect(store.isRunning()).toBe(true);
    });

    it('should reset startTime on resume', () => {
      store.start('exercise-1', 60000);
      store.pause();
      const oldStartTime = store.startTime();

      vi.advanceTimersByTime(1000);
      store.resume();

      expect(store.startTime()).not.toBeNull();
      expect(store.startTime()).toBeGreaterThan(oldStartTime!);
    });

    it('should continue counting down from paused remaining time', () => {
      store.start('exercise-1', 60000);
      vi.advanceTimersByTime(10000);
      store.pause();

      const remainingAfterPause = store.remainingMs();

      store.resume();

      // remainingMs should be close to what it was when paused
      expect(store.remainingMs()).toBeGreaterThan(remainingAfterPause - 2000);
      expect(store.remainingMs()).toBeLessThanOrEqual(remainingAfterPause);
    });

    it('should set endTime based on paused remaining time', () => {
      store.start('exercise-1', 60000);
      store.pause();

      store.resume();

      const startTime = store.startTime()!;
      const endTime = store.endTime()!;

      expect(endTime - startTime).toBe(store.pausedRemainingMs());
    });

    it('should not resume when pausedRemainingMs is 0', () => {
      store.start('exercise-1', 100);
      vi.advanceTimersByTime(1000);
      // Timer expired and auto-reset, pausedRemainingMs is 0

      store.resume();

      expect(store.isRunning()).toBe(false);
    });

    it('should not resume when pausedRemainingMs is negative', () => {
      store.start('exercise-1', 100);
      vi.advanceTimersByTime(1000);
      // Timer expired, pausedRemainingMs is 0

      store.resume();

      expect(store.isRunning()).toBe(false);
      expect(store.remainingMs()).toBe(0);
    });

    it('should start a new interval on resume', () => {
      store.start('exercise-1', 60000);
      store.pause();

      store.resume();
      vi.advanceTimersByTime(3000);

      // Timer should be counting down after resume
      expect(store.remainingMs()).toBeLessThan(60000);
    });

    it('should preserve exerciseId after resume', () => {
      store.start('exercise-1', 60000);
      store.pause();
      store.resume();

      expect(store.currentExerciseId()).toBe('exercise-1');
    });

    it('should support pause-resume-pause cycle', () => {
      store.start('exercise-1', 60000);
      vi.advanceTimersByTime(5000);
      store.pause();

      const remainingAfterFirstPause = store.remainingMs();

      store.resume();
      vi.advanceTimersByTime(5000);
      store.pause();

      const remainingAfterSecondPause = store.remainingMs();

      // Second pause should have ~10s less than first pause
      expect(remainingAfterSecondPause).toBeLessThan(remainingAfterFirstPause);
      expect(remainingAfterSecondPause).toBeGreaterThan(40000);
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

    it('should set endTime to null', () => {
      store.start('exercise-1', 60000);
      store.reset();

      expect(store.endTime()).toBeNull();
    });

    it('should set durationMs to 0', () => {
      store.start('exercise-1', 60000);
      store.reset();

      expect(store.durationMs()).toBe(0);
    });

    it('should set pausedRemainingMs to 0', () => {
      store.start('exercise-1', 60000);
      store.pause();
      store.reset();

      expect(store.pausedRemainingMs()).toBe(0);
    });

    it('should clear the interval timer', () => {
      store.start('exercise-1', 60000);
      store.reset();

      vi.advanceTimersByTime(5000);

      // remainingMs should stay at 0 (no interval running)
      expect(store.remainingMs()).toBe(0);
      expect(store.isRunning()).toBe(false);
    });

    it('should reset from paused state', () => {
      store.start('exercise-1', 60000);
      store.pause();
      store.reset();

      expect(store.isRunning()).toBe(false);
      expect(store.remainingMs()).toBe(0);
      expect(store.currentExerciseId()).toBeNull();
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
