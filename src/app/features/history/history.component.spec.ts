import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { HistoryComponent } from './history.component';
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

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let progressStore: InstanceType<typeof ProgressStore>;
  let exerciseStore: InstanceType<typeof ExerciseStore>;

  const mockExercises: Exercise[] = [
    { id: 'ex-1', name: 'Scales', durationMinutes: 10, order: 1 },
    { id: 'ex-2', name: 'Arpeggios', durationMinutes: 15, order: 2 },
  ];

  beforeEach(async () => {
    setupMockLocalStorage();

    await TestBed.configureTestingModule({}).compileComponents();

    progressStore = TestBed.inject(ProgressStore);
    exerciseStore = TestBed.inject(ExerciseStore);
    exerciseStore.setExercises(mockExercises);

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize currentWeekStart to the Monday of the current week', () => {
      const start = component.currentWeekStart();
      // Monday has getDay() === 1
      expect(start.getDay()).toBe(1);
    });

    it('should display the week range label', () => {
      const label = component.weekRangeLabel();
      expect(label).toContain('/');
      expect(label).toContain('—');
    });

    it('should render the page title', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Historique hebdomadaire');
    });
  });

  describe('previousWeek navigation', () => {
    it('should shift currentWeekStart by -7 days', () => {
      const before = component.currentWeekStart();
      component.previousWeek();
      const after = component.currentWeekStart();

      const diffDays = (after.getTime() - before.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(-7);
    });

    it('should update the week range label after navigation', () => {
      const beforeLabel = component.weekRangeLabel();
      component.previousWeek();
      fixture.detectChanges();
      const afterLabel = component.weekRangeLabel();

      expect(afterLabel).not.toBe(beforeLabel);
    });

    it('should allow multiple previous week navigations', () => {
      const initial = component.currentWeekStart();
      component.previousWeek();
      component.previousWeek();
      const after = component.currentWeekStart();

      const diffDays = (after.getTime() - initial.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(-14);
    });
  });

  describe('nextWeek navigation', () => {
    it('should shift currentWeekStart by +7 days', () => {
      const before = component.currentWeekStart();
      component.nextWeek();
      const after = component.currentWeekStart();

      const diffDays = (after.getTime() - before.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });

    it('should update the week range label after navigation', () => {
      const beforeLabel = component.weekRangeLabel();
      component.nextWeek();
      fixture.detectChanges();
      const afterLabel = component.weekRangeLabel();

      expect(afterLabel).not.toBe(beforeLabel);
    });
  });

  describe('goToCurrentWeek', () => {
    it('should reset currentWeekStart to the Monday of the current week', () => {
      // Navigate away first
      component.previousWeek();
      component.previousWeek();
      const afterNav = component.currentWeekStart();

      // Go back to current week
      component.goToCurrentWeek();
      const afterReset = component.currentWeekStart();

      // Should be different from the navigated date
      expect(afterReset.getTime()).not.toBe(afterNav.getTime());
      // Should be a Monday
      expect(afterReset.getDay()).toBe(1);
    });
  });

  describe('isNextWeekDisabled', () => {
    it('should be true when on the current week', () => {
      expect(component.isNextWeekDisabled()).toBe(true);
    });

    it('should be false when on a past week', () => {
      component.previousWeek();
      expect(component.isNextWeekDisabled()).toBe(false);
    });

    it('should be true again after navigating back to current week', () => {
      component.previousWeek();
      expect(component.isNextWeekDisabled()).toBe(false);

      component.nextWeek();
      fixture.detectChanges();
      expect(component.isNextWeekDisabled()).toBe(true);
    });

    it('should be true after goToCurrentWeek', () => {
      component.previousWeek();
      component.goToCurrentWeek();
      fixture.detectChanges();
      expect(component.isNextWeekDisabled()).toBe(true);
    });
  });

  describe('reactive data updates', () => {
    it('should update weeklyStats when navigating to a different week', () => {
      const initialStats = component.weeklyStats();
      expect(initialStats.days.length).toBe(7);

      component.previousWeek();
      fixture.detectChanges();

      const newStats = component.weeklyStats();
      expect(newStats.days.length).toBe(7);
      // The dates should be different
      expect(newStats.days[0].date.getTime()).not.toBe(initialStats.days[0].date.getTime());
    });

    it('should reflect sessions in the correct week', () => {
      // Add a session for a past week
      component.previousWeek();
      const pastWeekMonday = component.currentWeekStart();

      const pastDateStr = `${pastWeekMonday.getFullYear()}-${String(pastWeekMonday.getMonth() + 1).padStart(2, '0')}-${String(pastWeekMonday.getDate()).padStart(2, '0')}`;

      const session: DailySession = {
        date: pastDateStr,
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
        ],
      };
      progressStore.addSession(session);

      fixture.detectChanges();

      // The past week should have the session
      const pastStats = component.weeklyStats();
      expect(pastStats.totalMinutes).toBe(10);

      // Navigate to current week — should have 0 minutes
      component.goToCurrentWeek();
      fixture.detectChanges();

      const currentStats = component.weeklyStats();
      expect(currentStats.totalMinutes).toBe(0);
    });
  });

  describe('navigation buttons in template', () => {
    it('should render the previous week button', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const buttons = nativeElement.querySelectorAll('button');
      const prevButton = Array.from(buttons).find(
        (b) => b.getAttribute('aria-label') === 'Semaine précédente'
      );
      expect(prevButton).toBeTruthy();
    });

    it('should render the next week button', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const buttons = nativeElement.querySelectorAll('button');
      const nextButton = Array.from(buttons).find(
        (b) => b.getAttribute('aria-label') === 'Semaine suivante'
      );
      expect(nextButton).toBeTruthy();
    });

    it('should render the "today" button', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const buttons = nativeElement.querySelectorAll('button');
      const todayButton = Array.from(buttons).find(
        (b) => b.getAttribute('aria-label') === 'Semaine en cours'
      );
      expect(todayButton).toBeTruthy();
    });

    it('should disable the next week button on the current week', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const nextButton = Array.from(nativeElement.querySelectorAll('button')).find(
        (b) => b.getAttribute('aria-label') === 'Semaine suivante'
      );
      expect(nextButton?.getAttribute('disabled')).toBe('true');
    });

    it('should enable the next week button on a past week', () => {
      component.previousWeek();
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const nextButton = Array.from(nativeElement.querySelectorAll('button')).find(
        (b) => b.getAttribute('aria-label') === 'Semaine suivante'
      );
      expect(nextButton?.getAttribute('disabled')).toBeNull();
    });

    it('should have a nav element with aria-label for week navigation', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const nav = nativeElement.querySelector('nav[aria-label="Navigation entre semaines"]');
      expect(nav).toBeTruthy();
    });
  });

  describe('week days rendering', () => {
    it('should render 7 week day cards', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const cards = nativeElement.querySelectorAll('app-week-day-card');
      expect(cards.length).toBe(7);
    });

    it('should render the weekly summary component', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const summary = nativeElement.querySelector('app-weekly-summary');
      expect(summary).toBeTruthy();
    });
  });
});
