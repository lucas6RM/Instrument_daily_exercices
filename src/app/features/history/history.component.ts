import { Component, computed, inject, signal } from '@angular/core';
import { ExerciseService } from '../exercise/exercise.service';
import { ProgressService } from '../progress/progress.service';
import { WeekDayCardComponent } from './week-day-card/week-day-card.component';
import { WeeklySummaryComponent } from './weekly-summary/weekly-summary.component';

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDateRange(startDate: Date): string {
  const format = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);

  return `${format(startDate)} — ${format(end)}`;
}

@Component({
  selector: 'app-history',
  imports: [WeekDayCardComponent, WeeklySummaryComponent],
  templateUrl: './history.component.html',
})
export class HistoryComponent {
  private readonly progressService = inject(ProgressService);
  private readonly exerciseService = inject(ExerciseService);

  readonly currentWeekStart = signal<Date>(getMondayOfCurrentWeek());

  readonly exercises = computed(() => this.exerciseService.sortedExercises());

  readonly weeklyStats = computed(() =>
    this.progressService.getWeeklyStats(this.currentWeekStart(), this.exerciseService.exercises())(),
  );

  readonly weekRangeLabel = computed(() => formatDateRange(this.currentWeekStart()));

  readonly isNextWeekDisabled = computed(() => {
    const current = this.currentWeekStart();
    const todayMonday = getMondayOfCurrentWeek();
    return current.getTime() >= todayMonday.getTime();
  });

  previousWeek(): void {
    this.currentWeekStart.update((date) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }

  nextWeek(): void {
    this.currentWeekStart.update((date) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }

  goToCurrentWeek(): void {
    this.currentWeekStart.set(getMondayOfCurrentWeek());
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }
}
