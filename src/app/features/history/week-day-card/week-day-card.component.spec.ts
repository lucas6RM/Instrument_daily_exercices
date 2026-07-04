import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideX } from '@ng-icons/lucide';
import { WeekDayCardComponent } from './week-day-card.component';
import { DailySession, Exercise, WeekDayStats } from '../../../core/models';

// Host component to render WeekDayCardComponent with inputs
@Component({
  selector: 'app-test-host',
  imports: [WeekDayCardComponent],
  template: `
    <app-week-day-card
      [dayStats]="dayStats"
      [scheduledExercises]="scheduledExercises"
    />
  `,
})
class TestHostComponent {
  dayStats: WeekDayStats = {
    date: new Date('2025-01-06'),
    totalMinutes: 0,
    sessions: [],
  };
  scheduledExercises: Exercise[] = [];
}

describe('WeekDayCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideIcons({ lucideCheck, lucideX })],
    });
  });

  describe('completedExercisesSignal', () => {
    it('should display exerciseName from snapshot for completed exercises', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 10, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 10,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const completed = card.completedExercisesSignal();
      expect(completed).toHaveLength(1);
      expect(completed[0].exerciseName).toBe('Chromatique');
      expect(completed[0].actualMinutes).toBe(10);
    });

    it('should show "(nom inconnu)" fallback when exerciseName is missing', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 10,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const completed = card.completedExercisesSignal();
      expect(completed[0].exerciseName).toBe('(nom inconnu)');
    });

    it('should aggregate minutes for the same exercise across sessions', () => {
      const session1: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 10, bonusMinutes: 0 },
        ],
      };
      const session2: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 5, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 15,
        sessions: [session1, session2],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const completed = card.completedExercisesSignal();
      expect(completed).toHaveLength(1);
      expect(completed[0].actualMinutes).toBe(15);
    });

    it('should not include uncompleted exercises', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 0,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const completed = card.completedExercisesSignal();
      expect(completed).toHaveLength(0);
    });

    it('should not include exercises with 0 actualMinutes even if completed', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 0,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const completed = card.completedExercisesSignal();
      expect(completed).toHaveLength(0);
    });
  });

  describe('uncompletedExercisesSignal', () => {
    it('should show exerciseName from snapshot for uncompleted exercises in session', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 0,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const uncompleted = card.uncompletedExercisesSignal();
      expect(uncompleted).toHaveLength(1);
      expect(uncompleted[0].name).toBe('Chromatique');
    });

    it('should show "(nom inconnu)" fallback for uncompleted when exerciseName is missing', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 0,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const uncompleted = card.uncompletedExercisesSignal();
      expect(uncompleted[0].name).toBe('(nom inconnu)');
    });

    it('should not include completed exercises', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 10, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 10,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const uncompleted = card.uncompletedExercisesSignal();
      expect(uncompleted).toHaveLength(0);
    });

    it('should include scheduled exercises not in any session', () => {
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 0,
        sessions: [],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.componentInstance.scheduledExercises = [
        { id: 'e1', name: 'Chromatique', durationMinutes: 30, order: 1 },
      ];
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      const uncompleted = card.uncompletedExercisesSignal();
      expect(uncompleted).toHaveLength(1);
      expect(uncompleted[0].name).toBe('Chromatique');
      expect(uncompleted[0].durationMinutes).toBe(30);
    });
  });

  describe('dayLabelSignal', () => {
    it('should return the correct French day abbreviation', () => {
      // 2025-01-06 is a Monday (Lun)
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 0,
        sessions: [],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      expect(card.dayLabelSignal()).toBe('Lun');
    });

    it('should return "Dim" for Sunday', () => {
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-05'),
        totalMinutes: 0,
        sessions: [],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      expect(card.dayLabelSignal()).toBe('Dim');
    });
  });

  describe('dateLabelSignal', () => {
    it('should return formatted date DD/MM/YYYY', () => {
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 0,
        sessions: [],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      expect(card.dateLabelSignal()).toBe('06/01/2025');
    });
  });

  describe('totalMinutesSignal', () => {
    it('should return totalMinutes from dayStats', () => {
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 42,
        sessions: [],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const card = host.debugElement.children[0].componentInstance as WeekDayCardComponent;
      expect(card.totalMinutesSignal()).toBe(42);
    });
  });

  describe('template rendering', () => {
    it('should render completed exercise names in the DOM', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 10, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 10,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const nativeEl = host.nativeElement;
      expect(nativeEl.textContent).toContain('Chromatique');
    });

    it('should render "(nom inconnu)" when exerciseName is missing', () => {
      const session: DailySession = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 },
        ],
      };
      const dayStats: WeekDayStats = {
        date: new Date('2025-01-06'),
        totalMinutes: 10,
        sessions: [session],
      };

      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.dayStats = dayStats;
      host.detectChanges();

      const nativeEl = host.nativeElement;
      expect(nativeEl.textContent).toContain('(nom inconnu)');
    });
  });
});
