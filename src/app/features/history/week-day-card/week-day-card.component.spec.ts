import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { WeekDayCardComponent } from './week-day-card.component';
import { Exercise, WeekDayStats } from '../../../core/models';

describe('WeekDayCardComponent', () => {
  let component: WeekDayCardComponent;
  let fixture: ComponentFixture<WeekDayCardComponent>;

  const mockExercises: Exercise[] = [
    { id: 'ex-1', name: 'Scales', durationMinutes: 10, order: 1 },
    { id: 'ex-2', name: 'Arpeggios', durationMinutes: 15, order: 2 },
    { id: 'ex-3', name: 'Etude', durationMinutes: 20, order: 3 },
  ];

  const mockDayStats: WeekDayStats = {
    date: new Date(2025, 5, 16), // Monday June 16, 2025
    totalMinutes: 25,
    sessions: [
      {
        date: '2025-06-16',
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          { exerciseId: 'ex-2', completed: true, actualMinutes: 15 },
        ],
      },
    ],
  };

  const mockDayStatsNoSessions: WeekDayStats = {
    date: new Date(2025, 5, 17), // Tuesday June 17, 2025
    totalMinutes: 0,
    sessions: [],
  };

  const mockDayStatsAllCompleted: WeekDayStats = {
    date: new Date(2025, 5, 18), // Wednesday June 18, 2025
    totalMinutes: 45,
    sessions: [
      {
        date: '2025-06-18',
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          { exerciseId: 'ex-2', completed: true, actualMinutes: 15 },
          { exerciseId: 'ex-3', completed: true, actualMinutes: 20 },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(WeekDayCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dayStats', mockDayStats);
    fixture.componentRef.setInput('scheduledExercises', mockExercises);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('day and date display', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display the day of the week', () => {
      expect(component.dayLabelSignal()).toBe('Lun');
    });

    it('should display the formatted date', () => {
      expect(component.dateLabelSignal()).toBe('16/06/2025');
    });

    it('should render the day label in the template', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Lun');
    });

    it('should render the date in the template', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('16/06/2025');
    });
  });

  describe('total minutes', () => {
    it('should display the total minutes from dayStats', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('25');
      expect(nativeElement.textContent).toContain('min');
    });

    it('should display 0 min when no sessions', () => {
      fixture.componentRef.setInput('dayStats', mockDayStatsNoSessions);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('0');
    });
  });

  describe('completed exercises', () => {
    it('should list completed exercises with actual minutes', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;

      expect(nativeElement.textContent).toContain('Scales');
      expect(nativeElement.textContent).toContain('10 min');
      expect(nativeElement.textContent).toContain('Arpeggios');
      expect(nativeElement.textContent).toContain('15 min');
    });

    it('should show the "Réalisés" section label', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Réalisés');
    });

    it('should apply green styling to completed exercises', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const completedItems = nativeElement.querySelectorAll('li.bg-green-50');
      expect(completedItems.length).toBe(2);
    });

    it('should not show "Non réalisés" section when all completed', () => {
      fixture.componentRef.setInput('dayStats', mockDayStatsAllCompleted);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).not.toContain('Non réalisés');
    });
  });

  describe('uncompleted exercises', () => {
    it('should list uncompleted exercises grayed out', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;

      expect(nativeElement.textContent).toContain('Etude');
      expect(nativeElement.textContent).toContain('Non réalisés');
    });

    it('should apply line-through to uncompleted exercise names', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      const lineThroughElements = nativeElement.querySelectorAll('span.line-through');
      expect(lineThroughElements.length).toBeGreaterThan(0);
      expect(lineThroughElements[0].textContent).toContain('Etude');
    });

    it('should show scheduled duration for uncompleted exercises', () => {
      fixture.detectChanges();
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('20 min');
    });

    it('should not show uncompleted section when all completed', () => {
      fixture.componentRef.setInput('dayStats', mockDayStatsAllCompleted);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const uncompletedSection = nativeElement.querySelector(
        'section[aria-label="Exercices non réalisés"]'
      );
      const headings = uncompletedSection?.querySelectorAll('h4');
      expect(headings?.length).toBe(0);
    });
  });

  describe('no exercises scheduled', () => {
    it('should display "Aucun exercice prévu" when no exercises are scheduled', () => {
      fixture.componentRef.setInput('scheduledExercises', []);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Aucun exercice prévu');
    });
  });

  describe('multiple sessions aggregation', () => {
    it('should aggregate actual minutes from multiple sessions', () => {
      const multiSessionStats: WeekDayStats = {
        date: new Date(2025, 5, 16),
        totalMinutes: 30,
        sessions: [
          {
            date: '2025-06-16',
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 5 },
            ],
          },
          {
            date: '2025-06-16',
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 5 },
            ],
          },
        ],
      };

      fixture.componentRef.setInput('dayStats', multiSessionStats);
      fixture.detectChanges();

      const completed = component.completedExercisesSignal();
      expect(completed.length).toBe(1);
      expect(completed[0].actualMinutes).toBe(10);
    });
  });

  describe('reactivity', () => {
    it('should update when dayStats changes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('16/06/2025');

      fixture.componentRef.setInput('dayStats', mockDayStatsNoSessions);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('17/06/2025');
    });

    it('should update when scheduledExercises changes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Scales');

      const newExercises: Exercise[] = [
        { id: 'ex-new', name: 'New Exercise', durationMinutes: 30, order: 4 },
      ];
      fixture.componentRef.setInput('scheduledExercises', newExercises);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('New Exercise');
      expect(fixture.nativeElement.textContent).not.toContain('Scales');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have an aria-label on the article with the date', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const article = nativeElement.querySelector('article');
      expect(article?.getAttribute('aria-label')).toBe('Statistiques du 16/06/2025');
    });

    it('should have section aria-labels for completed and uncompleted exercises', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const sections = nativeElement.querySelectorAll('section[aria-label]');
      const labels = Array.from(sections).map((s) => s.getAttribute('aria-label'));
      expect(labels).toContain('Exercices réalisés');
      expect(labels).toContain('Exercices non réalisés');
    });

    it('should use semantic HTML with article, header, section, and ul elements', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.querySelector('article')).toBeTruthy();
      expect(nativeElement.querySelector('header')).toBeTruthy();
      expect(nativeElement.querySelectorAll('section').length).toBe(2);
      expect(nativeElement.querySelectorAll('ul[role="list"]').length).toBe(2);
    });

    it('should use role="list" on exercise lists', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const lists = nativeElement.querySelectorAll('ul[role="list"]');
      expect(lists.length).toBe(2);
    });
  });

  describe('day label for each day of the week', () => {
    it('should return correct day name for Sunday', () => {
      const sundayStats: WeekDayStats = {
        date: new Date(2025, 5, 15), // June 15, 2025 is Sunday
        totalMinutes: 0,
        sessions: [],
      };
      fixture.componentRef.setInput('dayStats', sundayStats);
      fixture.detectChanges();
      expect(component.dayLabelSignal()).toBe('Dim');
    });

    it('should return correct day name for Saturday', () => {
      const saturdayStats: WeekDayStats = {
        date: new Date(2025, 5, 14), // June 14, 2025 is Saturday
        totalMinutes: 0,
        sessions: [],
      };
      fixture.componentRef.setInput('dayStats', saturdayStats);
      fixture.detectChanges();
      expect(component.dayLabelSignal()).toBe('Sam');
    });
  });
});
