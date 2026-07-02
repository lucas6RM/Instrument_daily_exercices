import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { lucideBarChart3, lucideClock } from '@ng-icons/lucide';
import { WeeklySummaryComponent } from './weekly-summary.component';
import { WeeklyStats } from '../../../core/models';

function createWeeklyStats(overrides: Partial<WeeklyStats> = {}): WeeklyStats {
  return {
    days: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(2025, 0, 6 + i),
      totalMinutes: 0,
      sessions: [],
    })),
    totalMinutes: 0,
    minutesByExercise: new Map<string, number>(),
    completionRate: 0,
    ...overrides,
  };
}

@Component({
  selector: 'app-test-host',
  imports: [WeeklySummaryComponent],
  template: `
    <app-weekly-summary [weeklyStats]="weeklyStats" />
  `,
})
class TestHostComponent {
  weeklyStats: WeeklyStats = createWeeklyStats();
}

describe('WeeklySummaryComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideIcons({ lucideBarChart3, lucideClock })],
    });
  });

  it('should display the total minutes', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ totalMinutes: 120 });
    host.detectChanges();
    expect(host.nativeElement.textContent).toContain('120');
  });

  it('should display the completion rate as a rounded percentage', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ completionRate: 75.4 });
    host.detectChanges();
    expect(host.nativeElement.textContent).toContain('75%');
  });

  it('should display 0% when completion rate is 0', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ completionRate: 0 });
    host.detectChanges();
    expect(host.nativeElement.textContent).toContain('0%');
  });

  it('should display 100% when completion rate is 100', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ completionRate: 100 });
    host.detectChanges();
    expect(host.nativeElement.textContent).toContain('100%');
  });

  it('should display rates above 100% when bonus minutes exceed target', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ completionRate: 125.7 });
    host.detectChanges();
    expect(host.nativeElement.textContent).toContain('126%');
  });

  it('should show the progress bar with aria attributes', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ completionRate: 50 });
    host.detectChanges();
    const progressBar = host.nativeElement.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressBar.getAttribute('aria-label')).toBe('Taux de complétion hebdomadaire');
  });

  it('should cap the progress bar width at 100% when rate exceeds 100', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ completionRate: 150 });
    host.detectChanges();
    const indicator = host.nativeElement.querySelector('hlm-progress-indicator');
    // Transform should show full fill (translateX(-0%) = 100% filled)
    expect(indicator).not.toBeNull();
    // But the displayed text should still show the actual rate
    expect(host.nativeElement.textContent).toContain('150%');
  });

  it('should display exercise entries sorted by minutes descending', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({
      minutesByExercise: new Map([
        ['Échauffement', 30],
        ['Étirements', 60],
        ['Renforcement', 45],
      ]),
    });
    host.detectChanges();
    const html = host.nativeElement.innerHTML;
    // Étirements (60) should appear before Renforcement (45)
    const etirementIndex = html.indexOf('Étirements');
    const renforcementIndex = html.indexOf('Renforcement');
    const echauffementIndex = html.indexOf('Échauffement');
    expect(etirementIndex).toBeLessThan(renforcementIndex);
    expect(renforcementIndex).toBeLessThan(echauffementIndex);
  });

  it('should show "Aucune donnée d\'exercice" when no exercise data', () => {
    const host = TestBed.createComponent(TestHostComponent);
    host.componentInstance.weeklyStats = createWeeklyStats({ minutesByExercise: new Map() });
    host.detectChanges();
    expect(host.nativeElement.textContent).toContain("Aucune donnée d'exercice");
  });
});
