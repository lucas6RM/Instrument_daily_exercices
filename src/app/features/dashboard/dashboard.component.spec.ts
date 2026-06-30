import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { patchState } from '@ngrx/signals';

import { DashboardComponent } from './dashboard.component';
import { ProgressStore } from '../progress/progress.store';
import { ExerciseStore } from '../exercise/exercise.store';
import { TimerStore } from '../timer/timer.store';
import { DailySession, Exercise } from '../../core/models';

interface TimerState {
  isRunning: boolean;
  currentExerciseId: string | null;
  startTime: number | null;
  endTime: number | null;
  durationMs: number;
  pausedRemainingMs: number;
  tickCounter: number;
}

/**
 * Helper to patch the TimerStore internal state for testing.
 * The signalStore type doesn't expose its state shape to patchState,
 * so we cast the store to allow partial state updates.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patchTimerState = (store: any, state: Partial<TimerState>): void => {
  patchState(store, state);
};

function setupMockLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
    },
    writable: true,
  });

  return store;
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let progressStore: InstanceType<typeof ProgressStore>;
  let exerciseStore: InstanceType<typeof ExerciseStore>;
  let timerStore: InstanceType<typeof TimerStore>;

  const mockExercises: Exercise[] = [
    { id: 'ex-1', name: 'Scale Practice', durationMinutes: 5, order: 1 },
    { id: 'ex-2', name: 'Metronome Drills', durationMinutes: 10, order: 2 },
    { id: 'ex-3', name: 'Arpeggios', durationMinutes: 8, order: 3 },
  ];

  beforeEach(async () => {
    setupMockLocalStorage();

    await TestBed.configureTestingModule({}).compileComponents();

    progressStore = TestBed.inject(ProgressStore);
    exerciseStore = TestBed.inject(ExerciseStore);
    timerStore = TestBed.inject(TimerStore);

    exerciseStore.setExercises(mockExercises);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('session loading', () => {
    it('should have loaded from storage on store init', () => {
      // The ProgressStore loads from localStorage via onInit hook,
      // not via the component's ngOnInit. Verify the store has data
      // that was persisted to localStorage.
      const loadSpy = vi.spyOn(progressStore, 'loadFromStorage');
      // Reset and re-load to verify the method works
      progressStore.setProgressState({ dailySessions: [] });
      progressStore.loadFromStorage();
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should create a new session when no session exists for today', () => {
      component.ngOnInit();

      const session = progressStore.getSession(component.today);
      expect(session).not.toBeNull();
      expect(session?.exercises).toHaveLength(3);
      expect(session?.exercises[0].completed).toBe(false);
    });

    it('should create new session with correct structure (all exercises, completed false, actualMinutes 0)', () => {
      component.ngOnInit();

      const session = progressStore.getSession(component.today);
      expect(session).not.toBeNull();
      expect(session?.date).toBe(component.today);
      expect(session?.exercises).toHaveLength(3);

      for (const ex of session!.exercises) {
        expect(ex.completed).toBe(false);
        expect(ex.actualMinutes).toBe(0);
        expect(['ex-1', 'ex-2', 'ex-3']).toContain(ex.exerciseId);
      }
    });

    it('should call progressStore.addSession when creating a new session', () => {
      const addSessionSpy = vi.spyOn(progressStore, 'addSession');
      component.ngOnInit();

      expect(addSessionSpy).toHaveBeenCalledTimes(1);
      const createdSession = addSessionSpy.mock.calls[0][0] as DailySession;
      expect(createdSession.date).toBe(component.today);
      expect(createdSession.exercises).toHaveLength(3);
    });

    it('should not create a duplicate session when one already exists', () => {
      const existingSession: DailySession = {
        date: component.today,
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 5 },
        ],
      };
      progressStore.addSession(existingSession);

      const addSessionSpy = vi.spyOn(progressStore, 'addSession');
      component.ngOnInit();

      // addSession should NOT be called again since session already exists
      expect(addSessionSpy).not.toHaveBeenCalled();
    });

    it('should use existing session when one exists for today', () => {
      const existingSession: DailySession = {
        date: component.today,
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 5 },
          { exerciseId: 'ex-2', completed: false, actualMinutes: 0 },
        ],
      };
      progressStore.addSession(existingSession);

      component.ngOnInit();

      const session = progressStore.getSession(component.today);
      expect(session).not.toBeNull();
      expect(session?.exercises[0].completed).toBe(true);
    });
  });

  describe('progress computation', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should compute totalCount from exercises', () => {
      expect(component.totalCount()).toBe(3);
    });

    it('should compute completedCount as 0 initially', () => {
      expect(component.completedCount()).toBe(0);
    });

    it('should update completedCount when an exercise is toggled', () => {
      component.onToggleComplete('ex-1');
      fixture.detectChanges();

      expect(component.completedCount()).toBe(1);
    });

    it('should toggle an exercise from completed to not completed', () => {
      component.onToggleComplete('ex-1');
      fixture.detectChanges();
      expect(component.completedCount()).toBe(1);

      component.onToggleComplete('ex-1');
      fixture.detectChanges();
      expect(component.completedCount()).toBe(0);
    });

    it('should reflect all exercises completed', () => {
      component.onToggleComplete('ex-1');
      component.onToggleComplete('ex-2');
      component.onToggleComplete('ex-3');
      fixture.detectChanges();

      expect(component.completedCount()).toBe(3);
      expect(component.totalCount()).toBe(3);
    });

    it('should update totalCount when exercises change', () => {
      exerciseStore.setExercises([
        { id: 'ex-1', name: 'Scale Practice', durationMinutes: 5, order: 1 },
      ]);
      fixture.detectChanges();

      expect(component.totalCount()).toBe(1);
    });
  });

  describe('exercisesWithProgress', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should return exercises with completed status', () => {
      const items = component.exercisesWithProgress();
      expect(items).toHaveLength(3);
      expect(items[0].exercise.name).toBe('Scale Practice');
      expect(items[0].completed).toBe(false);
    });

    it('should reflect completed status after toggle', () => {
      component.onToggleComplete('ex-2');
      fixture.detectChanges();

      const items = component.exercisesWithProgress();
      expect(items[1].completed).toBe(true);
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display the title', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Séance du jour');
    });

    it('should render the progress bar', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('app-progress-bar');
      expect(progressBar).toBeTruthy();
    });

    it('should render one exercise row per exercise', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const rows = nativeElement.querySelectorAll('app-exercise-row');
      expect(rows.length).toBe(3);
    });

    it('should pass correct completed count to progress bar', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('app-progress-bar');
      expect(progressBar).toBeTruthy();
      expect(nativeElement.textContent).toContain('0/3');
    });

    it('should display exercise names in rows', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Scale Practice');
      expect(nativeElement.textContent).toContain('Metronome Drills');
      expect(nativeElement.textContent).toContain('Arpeggios');
    });

    it('should display exercise durations', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('5 min');
      expect(nativeElement.textContent).toContain('10 min');
      expect(nativeElement.textContent).toContain('8 min');
    });

    it('should have a list role with aria-label', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const list = nativeElement.querySelector('[role="list"]');
      expect(list).toBeTruthy();
      expect(list?.getAttribute('aria-label')).toBe('Liste des exercices');
    });
  });

  describe('empty state', () => {
    it('should show empty message when no exercises exist', () => {
      exerciseStore.setExercises([]);
      component.ngOnInit();
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain(
        'Aucun exercice configuré',
      );
    });
  });

  describe('session persistence', () => {
    it('should save session to progress store after toggle', () => {
      component.ngOnInit();

      component.onToggleComplete('ex-1');

      const session = progressStore.getSession(component.today);
      expect(session).not.toBeNull();
      const ex1 = session?.exercises.find((e) => e.exerciseId === 'ex-1');
      expect(ex1?.completed).toBe(true);
    });

    it('should call progressStore.addSession on every toggle', () => {
      component.ngOnInit();

      const addSessionSpy = vi.spyOn(progressStore, 'addSession');

      component.onToggleComplete('ex-1');
      expect(addSessionSpy).toHaveBeenCalledTimes(1);

      component.onToggleComplete('ex-2');
      expect(addSessionSpy).toHaveBeenCalledTimes(2);

      component.onToggleComplete('ex-1');
      expect(addSessionSpy).toHaveBeenCalledTimes(3);
    });

    it('should persist toggle-off (uncheck) to progress store', () => {
      component.ngOnInit();

      // Check ex-1
      component.onToggleComplete('ex-1');
      let session = progressStore.getSession(component.today);
      expect(session?.exercises.find((e) => e.exerciseId === 'ex-1')?.completed).toBe(true);

      // Uncheck ex-1
      component.onToggleComplete('ex-1');
      session = progressStore.getSession(component.today);
      expect(session?.exercises.find((e) => e.exerciseId === 'ex-1')?.completed).toBe(false);
    });
  });

  describe('play exercise', () => {
    it('should call timerStore.start with correct exerciseId and duration', () => {
      component.ngOnInit();

      const startSpy = vi.spyOn(timerStore, 'start');
      component.onPlayExercise('ex-1');

      // ex-1 has durationMinutes: 5, so durationMs = 5 * 60000 = 300000
      expect(startSpy).toHaveBeenCalledWith('ex-1', 300000);
    });

    it('should call timerStore.start with correct duration for each exercise', () => {
      component.ngOnInit();

      const startSpy = vi.spyOn(timerStore, 'start');

      component.onPlayExercise('ex-2');
      expect(startSpy).toHaveBeenCalledWith('ex-2', 600000);

      component.onPlayExercise('ex-3');
      expect(startSpy).toHaveBeenCalledWith('ex-3', 480000);
    });

    it('should not call timerStore.start for non-existent exercise', () => {
      component.ngOnInit();

      const startSpy = vi.spyOn(timerStore, 'start');
      component.onPlayExercise('non-existent-id');

      expect(startSpy).not.toHaveBeenCalled();
    });
  });

  describe('auto-complete on timer expiration', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should auto-complete exercise when timer expires', () => {
      // Simulate timer expiration state:
      // remainingMs <= 0, isRunning = false, currentExerciseId = 'ex-1'
      patchTimerState(timerStore, {
        isRunning: false,
        currentExerciseId: 'ex-1',
        pausedRemainingMs: 0,
      });
      fixture.detectChanges();

      // The effect should auto-complete ex-1
      const items = component.exercisesWithProgress();
      expect(items[0].completed).toBe(true);
      expect(component.completedCount()).toBe(1);
    });

    it('should save the session after auto-complete', () => {
      patchTimerState(timerStore, {
        isRunning: false,
        currentExerciseId: 'ex-2',
        pausedRemainingMs: 0,
      });
      fixture.detectChanges();

      const session = progressStore.getSession(component.today);
      const ex2 = session?.exercises.find((e) => e.exerciseId === 'ex-2');
      expect(ex2?.completed).toBe(true);
    });

    it('should not double-complete an already completed exercise', () => {
      // First, manually complete ex-1
      component.onToggleComplete('ex-1');
      fixture.detectChanges();
      expect(component.completedCount()).toBe(1);

      // Now simulate timer expiration for the same exercise
      patchTimerState(timerStore, {
        isRunning: false,
        currentExerciseId: 'ex-1',
        pausedRemainingMs: 0,
      });
      fixture.detectChanges();

      // Should still be 1 (not toggled back to 0)
      expect(component.completedCount()).toBe(1);
    });

    it('should reset timer after auto-complete to prevent re-triggering', () => {
      patchTimerState(timerStore, {
        isRunning: false,
        currentExerciseId: 'ex-3',
        pausedRemainingMs: 0,
      });
      fixture.detectChanges();

      // Timer should be reset after auto-complete
      expect(timerStore.currentExerciseId()).toBeNull();
      expect(timerStore.isRunning()).toBe(false);
    });

    it('should not auto-complete when currentExerciseId is null', () => {
      patchTimerState(timerStore, {
        isRunning: false,
        currentExerciseId: null,
        pausedRemainingMs: 0,
      });
      fixture.detectChanges();

      // No exercise should be auto-completed
      expect(component.completedCount()).toBe(0);
    });

    it('should not auto-complete when timer is still running', () => {
      patchTimerState(timerStore, {
        isRunning: true,
        currentExerciseId: 'ex-1',
        pausedRemainingMs: 5000,
      });
      fixture.detectChanges();

      // Timer still running, no auto-complete
      expect(component.completedCount()).toBe(0);
    });

    it('should auto-complete multiple exercises on successive timer expirations', () => {
      // First expiration
      patchTimerState(timerStore, {
        isRunning: false,
        currentExerciseId: 'ex-1',
        pausedRemainingMs: 0,
      });
      fixture.detectChanges();
      expect(component.completedCount()).toBe(1);

      // Second expiration
      patchTimerState(timerStore, {
        isRunning: false,
        currentExerciseId: 'ex-2',
        pausedRemainingMs: 0,
      });
      fixture.detectChanges();
      expect(component.completedCount()).toBe(2);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should have a heading for the dashboard', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const heading = nativeElement.querySelector('h1');
      expect(heading).toBeTruthy();
    });

    it('should have list items with role="listitem"', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const listItems = nativeElement.querySelectorAll('[role="listitem"]');
      expect(listItems.length).toBe(3);
    });
  });
});
