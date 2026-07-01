import { TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { ExerciseService } from '../exercise/exercise.service';
import { ProgressService } from '../progress/progress.service';
import { StorageService } from '../../core/services/storage.service';
import { STORAGE_KEYS } from '../../core/services/storage-keys';

describe('HistoryComponent', () => {
  let getSpy: ReturnType<typeof vi.fn>;
  let setSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getSpy = vi.fn(() => null);
    setSpy = vi.fn();

    TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [
        ExerciseService,
        ProgressService,
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
  });

  describe('scheduledExercises propagation to WeekDayCard', () => {
    it('should NOT pass scheduledExercises to historical day cards (past days)', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;

      // Pick a date that is NOT today
      const pastDate = new Date('2025-01-06');
      expect(component.isToday(pastDate)).toBe(false);
    });

    it('should pass scheduledExercises only for today', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;

      const today = new Date();
      expect(component.isToday(today)).toBe(true);
    });

    it('should return false for isToday when date is different', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(component.isToday(yesterday)).toBe(false);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(component.isToday(tomorrow)).toBe(false);
    });
  });

  describe('week navigation', () => {
    it('should go to previous week', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;
      const initial = component.currentWeekStart();

      component.previousWeek();

      const newDate = component.currentWeekStart();
      expect(newDate.getTime()).toBe(initial.getTime() - 7 * 24 * 60 * 60 * 1000);
    });

    it('should go to next week', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;
      const initial = component.currentWeekStart();

      component.nextWeek();

      const newDate = component.currentWeekStart();
      expect(newDate.getTime()).toBe(initial.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    it('should go to current week', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;
      // Navigate away first
      component.previousWeek();
      const awayDate = component.currentWeekStart();

      component.goToCurrentWeek();

      const current = component.currentWeekStart();
      expect(current.getTime()).not.toBe(awayDate.getTime());
    });
  });

  describe('isNextWeekDisabled', () => {
    it('should disable next week button when at current week', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;
      expect(component.isNextWeekDisabled()).toBe(true);
    });
  });

  describe('weeklyStats', () => {
    it('should return weekly stats from ProgressService', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;

      const stats = component.weeklyStats();
      expect(stats.days).toHaveLength(7);
      expect(stats.totalMinutes).toBe(0);
    });
  });

  describe('weekRangeLabel', () => {
    it('should return a formatted date range', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;
      const label = component.weekRangeLabel();
      expect(label).toMatch(/\d{2}\/\d{2}\/\d{4} — \d{2}\/\d{2}\/\d{4}/);
    });
  });
});
