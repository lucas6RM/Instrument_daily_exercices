import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DashboardComponent } from './dashboard.component';
import { ProgressStore } from '../progress/progress.store';
import { ExerciseStore } from '../exercise/exercise.store';
import { DailySession, Exercise } from '../../core/models';

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

    exerciseStore.setExercises(mockExercises);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('session loading', () => {
    it('should load from storage on init', () => {
      const loadSpy = vi.spyOn(progressStore, 'loadFromStorage');
      component.ngOnInit();
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should create a new session when no session exists for today', () => {
      component.ngOnInit();

      const session = progressStore.getSession(component.today);
      expect(session).not.toBeNull();
      expect(session?.exercises).toHaveLength(3);
      expect(session?.exercises[0].completed).toBe(false);
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
  });

  describe('play exercise', () => {
    it('should handle playExercise event without error', () => {
      component.ngOnInit();
      fixture.detectChanges();

      expect(() => component.onPlayExercise('ex-1')).not.toThrow();
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
