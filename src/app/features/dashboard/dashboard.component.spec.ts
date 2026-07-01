import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ExerciseService } from '../exercise/exercise.service';
import { ProgressService } from '../progress/progress.service';
import { TimerService } from '../timer/timer.service';
import { AudioAlertService } from '../../core/services/audio-alert.service';
import { StorageService } from '../../core/services/storage.service';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { DailySession } from '../../core/models';

// Mock child components as standalone
@Component({
  selector: 'app-exercise-row',
  template: '',
  standalone: true,
})
class MockExerciseRowComponent {}

@Component({
  selector: 'app-progress-bar',
  template: '',
  standalone: true,
})
class MockProgressBarComponent {}

describe('DashboardComponent', () => {
  let getSpy: ReturnType<typeof vi.fn>;
  let setSpy: ReturnType<typeof vi.fn>;
  let progressService: ProgressService;
  let exerciseService: ExerciseService;
  let timerService: TimerService;

  beforeEach(() => {
    getSpy = vi.fn(() => null);
    setSpy = vi.fn();

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        ExerciseService,
        ProgressService,
        TimerService,
        { provide: AudioAlertService, useValue: { playBeep: vi.fn() } },
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

    // Override DashboardComponent imports to use mocks
    TestBed.overrideComponent(DashboardComponent, {
      set: {
        imports: [MockExerciseRowComponent, MockProgressBarComponent],
      },
    });

    progressService = TestBed.inject(ProgressService);
    exerciseService = TestBed.inject(ExerciseService);
    timerService = TestBed.inject(TimerService);
  });

  describe('ngOnInit - session creation with exerciseName', () => {
    it('should create a session with exerciseName snapshot when no session exists', () => {
      // Set up exercises in the exercise service
      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
        { id: 'e2', name: 'Gammes', durationSeconds: 60, order: 2 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      const session = progressService.getSession(component.today);
      expect(session).not.toBeNull();
      expect(session!.exercises).toHaveLength(2);
      expect(session!.exercises[0].exerciseName).toBe('Chromatique');
      expect(session!.exercises[1].exerciseName).toBe('Gammes');
    });

    it('should NOT create a new session when one already exists (freezing)', () => {
      // Pre-existing session (simulating a frozen session from earlier today)
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const existingSession: DailySession = {
        date: today,
        exercises: [
          { exerciseId: 'e1', exerciseName: 'AncienNom', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      progressService.addSession(existingSession);
      setSpy.mockClear();

      // Even if exercises have changed, the session should NOT be recreated
      exerciseService.setExercises([
        { id: 'e1', name: 'NouveauNom', durationSeconds: 30, order: 1 },
        { id: 'e2', name: 'NouvelExercice', durationSeconds: 60, order: 2 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      // Session should still have the original frozen data
      const session = progressService.getSession(today);
      expect(session).not.toBeNull();
      expect(session!.exercises).toHaveLength(1);
      expect(session!.exercises[0].exerciseName).toBe('AncienNom');
    });

    it('should create an empty exercises array when no exercises exist', () => {
      exerciseService.setExercises([]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      const session = progressService.getSession(component.today);
      expect(session).not.toBeNull();
      expect(session!.exercises).toHaveLength(0);
    });
  });

  describe('onTimerComplete', () => {
    it('should mark exercise as completed with exerciseName from exercise service', () => {
      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      // Simulate timer completion
      component.onTimerComplete('e1');

      const session = progressService.getSession(component.today);
      expect(session).not.toBeNull();
      const completedExercise = session!.exercises.find((e) => e.exerciseId === 'e1');
      expect(completedExercise).not.toBeNull();
      expect(completedExercise!.completed).toBe(true);
      expect(completedExercise!.actualMinutes).toBe(30);
    });

    it('should inject a new exercise with exerciseName when not in session', () => {
      // Use local date format (same as DashboardComponent's getTodayIso)
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      progressService.addSession({
        date: today,
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      });

      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
        { id: 'e2', name: 'Gammes', durationSeconds: 60, order: 2 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;

      // Simulate timer completion for e2 (not in session)
      component.onTimerComplete('e2');

      const session = progressService.getSession(component.today);
      expect(session).not.toBeNull();
      expect(session!.exercises).toHaveLength(2);
      const newExercise = session!.exercises.find((e) => e.exerciseId === 'e2');
      expect(newExercise).not.toBeNull();
      expect(newExercise!.exerciseName).toBe('Gammes');
      expect(newExercise!.completed).toBe(true);
      expect(newExercise!.actualMinutes).toBe(60);
    });

    it('should do nothing when exercise is not found', () => {
      exerciseService.setExercises([]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      const before = progressService.getSession(component.today);
      component.onTimerComplete('non-existent');
      const after = progressService.getSession(component.today);

      expect(after).toEqual(before);
    });

    it('should do nothing when no session exists', () => {
      // Remove any session
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      // Clear all sessions
      progressService.setProgressState({ dailySessions: [] });

      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.onTimerComplete('e1');

      const session = progressService.getSession(today);
      expect(session).toBeNull();
    });
  });

  describe('exercisesWithProgress', () => {
    it('should combine exercises with session progress', () => {
      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
        { id: 'e2', name: 'Gammes', durationSeconds: 60, order: 2 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      // Complete e1
      component.onTimerComplete('e1');

      const items = component.exercisesWithProgress();
      expect(items).toHaveLength(2);
      expect(items[0].completed).toBe(true);
      expect(items[1].completed).toBe(false);
    });
  });

  describe('completedCount and totalCount', () => {
    it('should return correct counts', () => {
      exerciseService.setExercises([
        { id: 'e1', name: 'A', durationSeconds: 30, order: 1 },
        { id: 'e2', name: 'B', durationSeconds: 30, order: 2 },
        { id: 'e3', name: 'C', durationSeconds: 30, order: 3 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      expect(component.totalCount()).toBe(3);
      expect(component.completedCount()).toBe(0);

      component.onTimerComplete('e1');
      expect(component.completedCount()).toBe(1);
      expect(component.totalCount()).toBe(3);
    });
  });

  describe('onPlayExercise', () => {
    it('should start the timer with the correct exercise', () => {
      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      component.onPlayExercise('e1');

      expect(timerService.isRunning()).toBe(true);
      expect(timerService.currentExerciseId()).toBe('e1');
    });

    it('should do nothing for non-existent exercise', () => {
      exerciseService.setExercises([]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      component.onPlayExercise('non-existent');

      expect(timerService.isRunning()).toBe(false);
    });
  });

  describe('replay (F8) - bonusMinutes increment', () => {
    it('should increment bonusMinutes when replaying a completed exercise', () => {
      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
        { id: 'e2', name: 'Gammes', durationSeconds: 60, order: 2 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      // First completion
      component.onTimerComplete('e1');

      let session = progressService.getSession(component.today);
      const firstEx = session!.exercises.find((e) => e.exerciseId === 'e1')!;
      expect(firstEx.completed).toBe(true);
      expect(firstEx.actualMinutes).toBe(30);
      expect(firstEx.bonusMinutes).toBe(0);

      // Replay (timer completes again on already completed exercise)
      component.onTimerComplete('e1');

      session = progressService.getSession(component.today);
      const replayedEx = session!.exercises.find((e) => e.exerciseId === 'e1')!;
      expect(replayedEx.completed).toBe(true);
      expect(replayedEx.actualMinutes).toBe(30); // unchanged
      expect(replayedEx.bonusMinutes).toBe(30); // incremented by durationSeconds

      // Second replay
      component.onTimerComplete('e1');

      session = progressService.getSession(component.today);
      const secondReplayedEx = session!.exercises.find((e) => e.exerciseId === 'e1')!;
      expect(secondReplayedEx.bonusMinutes).toBe(60); // 30 + 30
    });

    it('should persist the session with updated bonusMinutes in ProgressService', () => {
      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 45, order: 1 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      // Complete
      component.onTimerComplete('e1');

      // Replay
      component.onTimerComplete('e1');

      // The session stored in ProgressService must reflect the bonusMinutes
      const storedSession = progressService.getSession(component.today);
      expect(storedSession).not.toBeNull();
      const storedEx = storedSession!.exercises.find((e) => e.exerciseId === 'e1')!;
      expect(storedEx.bonusMinutes).toBe(45);
      expect(storedEx.completed).toBe(true);
      expect(storedEx.actualMinutes).toBe(45);
    });

    it('should not modify other exercises when replaying one', () => {
      exerciseService.setExercises([
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
        { id: 'e2', name: 'Gammes', durationSeconds: 60, order: 2 },
      ]);

      const fixture = TestBed.createComponent(DashboardComponent);
      const component = fixture.componentInstance;
      component.ngOnInit();

      // Complete both
      component.onTimerComplete('e1');
      component.onTimerComplete('e2');

      // Replay e1 only
      component.onTimerComplete('e1');

      const session = progressService.getSession(component.today);
      const e1 = session!.exercises.find((e) => e.exerciseId === 'e1')!;
      const e2 = session!.exercises.find((e) => e.exerciseId === 'e2')!;

      expect(e1.bonusMinutes).toBe(30);
      expect(e2.bonusMinutes).toBe(0);
      expect(e2.actualMinutes).toBe(60);
    });
  });
});
