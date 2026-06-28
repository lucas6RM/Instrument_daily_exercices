import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { WeeklySummaryComponent } from './weekly-summary.component';
import { Exercise, WeeklyStats } from '../../../core/models';

describe('WeeklySummaryComponent', () => {
  let component: WeeklySummaryComponent;
  let fixture: ComponentFixture<WeeklySummaryComponent>;

  const mockExercises: Exercise[] = [
    { id: 'ex-1', name: 'Scales', durationMinutes: 10, order: 1 },
    { id: 'ex-2', name: 'Arpeggios', durationMinutes: 15, order: 2 },
    { id: 'ex-3', name: 'Etude', durationMinutes: 20, order: 3 },
  ];

  const mockWeeklyStats: WeeklyStats = {
    days: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(2025, 5, 16 + i),
      totalMinutes: i < 5 ? 30 : 0,
      sessions: [],
    })),
    totalMinutes: 150,
    minutesByExercise: new Map<string, number>([
      ['ex-1', 60],
      ['ex-2', 45],
      ['ex-3', 45],
    ]),
    completionRate: (5 / 7) * 100,
  };

  const mockEmptyStats: WeeklyStats = {
    days: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(2025, 5, 16 + i),
      totalMinutes: 0,
      sessions: [],
    })),
    totalMinutes: 0,
    minutesByExercise: new Map<string, number>(),
    completionRate: 0,
  };

  const mockFullStats: WeeklyStats = {
    days: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(2025, 5, 16 + i),
      totalMinutes: 45,
      sessions: [],
    })),
    totalMinutes: 315,
    minutesByExercise: new Map<string, number>([
      ['ex-1', 105],
      ['ex-2', 105],
      ['ex-3', 105],
    ]),
    completionRate: 100,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(WeeklySummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('weeklyStats', mockWeeklyStats);
    fixture.componentRef.setInput('exercises', mockExercises);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('total minutes display', () => {
    it('should display the total minutes', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('150');
      expect(nativeElement.textContent).toContain('min');
    });

    it('should display 0 min when no minutes', () => {
      fixture.componentRef.setInput('weeklyStats', mockEmptyStats);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('0');
    });

    it('should display large totals correctly', () => {
      fixture.componentRef.setInput('weeklyStats', mockFullStats);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('315');
    });
  });

  describe('completion rate display', () => {
    it('should display the rounded completion rate', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('71%');
    });

    it('should display 0% when no completion', () => {
      fixture.componentRef.setInput('weeklyStats', mockEmptyStats);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('0%');
    });

    it('should display 100% when fully completed', () => {
      fixture.componentRef.setInput('weeklyStats', mockFullStats);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('100%');
    });
  });

  describe('minutes by exercise', () => {
    it('should list exercises with their minutes', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;

      expect(nativeElement.textContent).toContain('Scales');
      expect(nativeElement.textContent).toContain('60 min');
      expect(nativeElement.textContent).toContain('Arpeggios');
      expect(nativeElement.textContent).toContain('45 min');
      expect(nativeElement.textContent).toContain('Etude');
    });

    it('should sort exercises by minutes descending', () => {
      fixture.detectChanges();
      const entries = component.exerciseEntriesSignal();
      expect(entries[0].exerciseName).toBe('Scales');
      expect(entries[0].minutes).toBe(60);
    });

    it('should show "Aucune donnée d\'exercice" when no exercise data', () => {
      fixture.componentRef.setInput('weeklyStats', mockEmptyStats);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain("Aucune donnée d'exercice");
    });

    it('should display exercise ID when exercise name is not found', () => {
      const statsWithUnknownExercise: WeeklyStats = {
        ...mockWeeklyStats,
        minutesByExercise: new Map<string, number>([
          ['ex-unknown', 30],
        ]),
      };
      fixture.componentRef.setInput('weeklyStats', statsWithUnknownExercise);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('ex-unknown');
    });
  });

  describe('section heading', () => {
    it('should display "Temps par exercice" heading', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Temps par exercice');
    });

    it('should display "Résumé de la semaine" title', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Résumé de la semaine');
    });

    it('should display "Temps total" label', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Temps total');
    });

    it('should display "Taux de complétion" label', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Taux de complétion');
    });
  });

  describe('reactivity', () => {
    it('should update when weeklyStats changes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('150');

      fixture.componentRef.setInput('weeklyStats', mockFullStats);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('315');
    });

    it('should update exercise entries when exercises input changes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Scales');

      const newExercises: Exercise[] = [
        { id: 'ex-1', name: 'New Scales', durationMinutes: 10, order: 1 },
      ];
      fixture.componentRef.setInput('exercises', newExercises);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('New Scales');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have a section with aria-labelledby', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const section = nativeElement.querySelector('section');
      expect(section?.getAttribute('aria-labelledby')).toBe('weekly-summary-title');
    });

    it('should have a heading with id matching aria-labelledby', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const heading = nativeElement.querySelector('h2#weekly-summary-title');
      expect(heading).toBeTruthy();
    });

    it('should have a progressbar role with aria attributes', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]');
      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('aria-valuemin')).toBe('0');
      expect(progressBar?.getAttribute('aria-valuemax')).toBe('100');
      expect(progressBar?.getAttribute('aria-valuenow')).toBe('71.42857142857143');
    });

    it('should use role="list" on exercise list', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const list = nativeElement.querySelector('ul[role="list"]');
      expect(list).toBeTruthy();
    });

    it('should use semantic HTML with section, dl, dt, dd elements', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.querySelector('section')).toBeTruthy();
      expect(nativeElement.querySelectorAll('dl').length).toBeGreaterThan(0);
      expect(nativeElement.querySelectorAll('dt').length).toBeGreaterThan(0);
      expect(nativeElement.querySelectorAll('dd').length).toBeGreaterThan(0);
    });
  });

  describe('progress bar visual', () => {
    it('should set the inner bar width to the completion rate percentage', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const innerBar = nativeElement.querySelector('[role="progressbar"] > div');
      expect(innerBar).toBeTruthy();
    });

    it('should show 0% width when completion rate is 0', () => {
      fixture.componentRef.setInput('weeklyStats', mockEmptyStats);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const innerBar = nativeElement.querySelector('[role="progressbar"] > div');
      expect(innerBar?.getAttribute('style')).toContain('width');
    });

    it('should show 100% width when completion rate is 100', () => {
      fixture.componentRef.setInput('weeklyStats', mockFullStats);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const innerBar = nativeElement.querySelector('[role="progressbar"] > div');
      expect(innerBar?.getAttribute('style')).toContain('width');
    });
  });
});
