import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';
import { AudioAlertService } from '../../core/services/audio-alert.service';

describe('TimerService', () => {
  let service: TimerService;
  let playBeepSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    playBeepSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        TimerService,
        { provide: AudioAlertService, useValue: { playBeep: playBeepSpy } },
      ],
    });

    service = TestBed.inject(TimerService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have isRunning set to false', () => {
      expect(service.isRunning()).toBe(false);
    });

    it('should have currentExerciseId set to null', () => {
      expect(service.currentExerciseId()).toBeNull();
    });

    it('should have endTime set to null', () => {
      expect(service.endTime()).toBeNull();
    });

    it('should have durationMs set to 0', () => {
      expect(service.durationMs()).toBe(0);
    });

    it('should have pausedRemainingMs set to 0', () => {
      expect(service.pausedRemainingMs()).toBe(0);
    });

    it('should have originalDurationMs set to 0', () => {
      expect(service.originalDurationMs()).toBe(0);
    });
  });

  describe('computed properties', () => {
    it('should return 0 for remainingMs when not running', () => {
      expect(service.remainingMs()).toBe(0);
    });

    it('should return 0 for remainingSeconds when not running', () => {
      expect(service.remainingSeconds()).toBe(0);
    });

    it('should return "00:00" for formattedTime when not running', () => {
      expect(service.formattedTime()).toBe('00:00');
    });
  });

  describe('start()', () => {
    it('should set isRunning to true', () => {
      service.start('exercise-1', 60000);
      expect(service.isRunning()).toBe(true);
    });

    it('should set currentExerciseId', () => {
      service.start('exercise-1', 60000);
      expect(service.currentExerciseId()).toBe('exercise-1');
    });

    it('should set endTime to now + durationMs', () => {
      const durationMs = 60000;
      const before = Date.now();
      service.start('exercise-1', durationMs);
      const after = Date.now();
      const end = service.endTime()!;
      expect(end).toBeGreaterThanOrEqual(before + durationMs);
      expect(end).toBeLessThanOrEqual(after + durationMs);
    });

    it('should set durationMs', () => {
      service.start('exercise-1', 60000);
      expect(service.durationMs()).toBe(60000);
    });

    it('should set originalDurationMs', () => {
      service.start('exercise-1', 60000);
      expect(service.originalDurationMs()).toBe(60000);
    });

    it('should reset pausedRemainingMs to 0', () => {
      service.start('exercise-1', 60000);
      expect(service.pausedRemainingMs()).toBe(0);
    });

    it('should return a positive remainingMs', () => {
      service.start('exercise-1', 60000);
      expect(service.remainingMs()).toBeGreaterThan(0);
    });

    it('should return a formattedTime with minutes', () => {
      service.start('exercise-1', 120000);
      const formatted = service.formattedTime();
      expect(formatted).toMatch(/\d{2}:\d{2}/);
      expect(Number(formatted.split(':')[0])).toBeGreaterThan(0);
    });
  });

  describe('pause()', () => {
    it('should set isRunning to false', () => {
      service.start('exercise-1', 60000);
      service.pause();
      expect(service.isRunning()).toBe(false);
    });

    it('should capture remaining time in pausedRemainingMs', () => {
      service.start('exercise-1', 60000);
      service.pause();
      expect(service.pausedRemainingMs()).toBeGreaterThan(0);
    });

    it('should keep currentExerciseId when pausing', () => {
      service.start('exercise-1', 60000);
      service.pause();
      expect(service.currentExerciseId()).toBe('exercise-1');
    });

    it('should keep remainingMs equal to pausedRemainingMs when paused', () => {
      service.start('exercise-1', 60000);
      service.pause();
      expect(service.remainingMs()).toBe(service.pausedRemainingMs());
    });
  });

  describe('resume()', () => {
    it('should set isRunning to true', () => {
      service.start('exercise-1', 60000);
      service.pause();
      service.resume();
      expect(service.isRunning()).toBe(true);
    });

    it('should set a new endTime based on pausedRemainingMs', () => {
      service.start('exercise-1', 60000);
      service.pause();
      const pausedRemaining = service.pausedRemainingMs();
      service.resume();
      const end = service.endTime()!;
      expect(end).toBeGreaterThanOrEqual(Date.now() + pausedRemaining - 50);
    });

    it('should update durationMs to the remaining time', () => {
      service.start('exercise-1', 60000);
      service.pause();
      const pausedRemaining = service.pausedRemainingMs();
      service.resume();
      expect(service.durationMs()).toBeGreaterThanOrEqual(pausedRemaining - 50);
    });

    it('should not resume when pausedRemainingMs is 0', () => {
      service.start('exercise-1', 1);
      service.pause();
      service.pausedRemainingMs.set(0);
      service.resume();
      expect(service.isRunning()).toBe(false);
    });
  });

  describe('close()', () => {
    it('should set isRunning to false', () => {
      service.start('exercise-1', 60000);
      service.close();
      expect(service.isRunning()).toBe(false);
    });

    it('should set currentExerciseId to null', () => {
      service.start('exercise-1', 60000);
      service.close();
      expect(service.currentExerciseId()).toBeNull();
    });

    it('should set endTime to null', () => {
      service.start('exercise-1', 60000);
      service.close();
      expect(service.endTime()).toBeNull();
    });

    it('should set durationMs to 0', () => {
      service.start('exercise-1', 60000);
      service.close();
      expect(service.durationMs()).toBe(0);
    });

    it('should set originalDurationMs to 0', () => {
      service.start('exercise-1', 60000);
      service.close();
      expect(service.originalDurationMs()).toBe(0);
    });

    it('should set pausedRemainingMs to 0', () => {
      service.start('exercise-1', 60000);
      service.pause();
      service.close();
      expect(service.pausedRemainingMs()).toBe(0);
    });

    it('should return 0 for remainingMs after close', () => {
      service.start('exercise-1', 60000);
      service.close();
      expect(service.remainingMs()).toBe(0);
    });

    it('should return "00:00" for formattedTime after close', () => {
      service.start('exercise-1', 60000);
      service.close();
      expect(service.formattedTime()).toBe('00:00');
    });
  });

  describe('resetToOriginal()', () => {
    it('should reset durationMs to the original value', () => {
      service.start('exercise-1', 60000);
      service.pause();
      service.resetToOriginal();
      expect(service.durationMs()).toBe(60000);
    });

    it('should set pausedRemainingMs to the original duration', () => {
      service.start('exercise-1', 60000);
      service.pause();
      service.resetToOriginal();
      expect(service.pausedRemainingMs()).toBe(60000);
    });

    it('should set isRunning to false', () => {
      service.start('exercise-1', 60000);
      service.pause();
      service.resetToOriginal();
      expect(service.isRunning()).toBe(false);
    });

    it('should keep currentExerciseId unchanged', () => {
      service.start('exercise-1', 60000);
      service.pause();
      service.resetToOriginal();
      expect(service.currentExerciseId()).toBe('exercise-1');
    });

    it('should do nothing when originalDurationMs is 0', () => {
      service.resetToOriginal();
      expect(service.isRunning()).toBe(false);
      expect(service.durationMs()).toBe(0);
      expect(service.pausedRemainingMs()).toBe(0);
    });
  });

  describe('expiration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should emit expired$ event when timer expires', async () => {
      let emittedEvent: { exerciseId: string; durationMs: number } | null = null;

      service.expired$.subscribe((event) => {
        emittedEvent = event;
      });

      service.start('exercise-1', 50);
      vi.runAllTimers();

      expect(emittedEvent).not.toBeNull();
      expect(emittedEvent!.exerciseId).toBe('exercise-1');
      expect(emittedEvent!.durationMs).toBe(50);
    });

    it('should play beep sound on expiration', () => {
      service.start('exercise-1', 50);
      vi.runAllTimers();
      expect(playBeepSpy).toHaveBeenCalled();
    });

    it('should set isRunning to false after expiration', () => {
      service.start('exercise-1', 50);
      vi.runAllTimers();
      expect(service.isRunning()).toBe(false);
    });

    it('should keep currentExerciseId after expiration', () => {
      service.start('exercise-1', 50);
      vi.runAllTimers();
      expect(service.currentExerciseId()).toBe('exercise-1');
    });

    it('should set pausedRemainingMs to 0 after expiration', () => {
      service.start('exercise-1', 50);
      vi.runAllTimers();
      expect(service.pausedRemainingMs()).toBe(0);
    });

    it('should not emit expired$ when timer is closed before expiration', () => {
      let emitted = false;
      service.expired$.subscribe(() => {
        emitted = true;
      });

      service.start('exercise-1', 50);
      service.close();
      vi.runAllTimers();

      expect(emitted).toBe(false);
    });

    it('should not emit expired$ when timer is paused before expiration', () => {
      let emitted = false;
      service.expired$.subscribe(() => {
        emitted = true;
      });

      service.start('exercise-1', 50);
      service.pause();
      vi.runAllTimers();

      expect(emitted).toBe(false);
    });

    it('should detect expiration via reactive tick (effect) when remainingMs reaches 0', () => {
      let emittedEvent: { exerciseId: string; durationMs: number } | null = null;
      service.expired$.subscribe((event) => {
        emittedEvent = event;
      });

      // Start a very short timer
      service.start('exercise-1', 1);

      // Advance time past the expiration via tick intervals
      vi.advanceTimersByTime(250);

      expect(emittedEvent).not.toBeNull();
      expect(emittedEvent!.exerciseId).toBe('exercise-1');
    });

    it('should call playBeep only once when both effect and setTimeout fire', () => {
      service.start('exercise-1', 1);

      // runAllTimers fires both the interval ticks AND the setTimeout backup
      vi.runAllTimers();

      expect(playBeepSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit expired$ twice when both detection mechanisms trigger', () => {
      let emitCount = 0;
      service.expired$.subscribe(() => {
        emitCount++;
      });

      service.start('exercise-1', 1);
      vi.runAllTimers();

      expect(emitCount).toBe(1);
    });
  });

  describe('expiration guard', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should reset the guard on close() so a new timer can expire', () => {
      let emitCount = 0;
      service.expired$.subscribe(() => {
        emitCount++;
      });

      // First timer expires
      service.start('exercise-1', 1);
      vi.runAllTimers();
      expect(emitCount).toBe(1);

      // Second timer should also be able to expire
      service.start('exercise-2', 1);
      vi.runAllTimers();
      expect(emitCount).toBe(2);
    });

    it('should reset the guard on resetToOriginal()', () => {
      let emitCount = 0;
      service.expired$.subscribe(() => {
        emitCount++;
      });

      service.start('exercise-1', 1);
      vi.runAllTimers();
      expect(emitCount).toBe(1);

      // Reset and start again
      service.resetToOriginal();
      service.start('exercise-2', 1);
      vi.runAllTimers();
      expect(emitCount).toBe(2);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should close the timer', () => {
      service.start('exercise-1', 60000);
      service.ngOnDestroy();
      expect(service.isRunning()).toBe(false);
      expect(service.currentExerciseId()).toBeNull();
    });

    it('should complete the expired$ observable', () => {
      let completed = false;
      service.expired$.subscribe({
        complete: () => {
          completed = true;
        },
      });
      service.ngOnDestroy();

      expect(completed).toBe(true);
    });
  });
});
