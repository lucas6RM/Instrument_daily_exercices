import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideChevronLeft, lucideChevronRight } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialog } from '@spartan-ng/helm/dialog';

import { ExerciseService } from '../exercise/exercise.service';
import { ProgressService } from '../progress/progress.service';
import { CatchUpModalComponent } from './catch-up-modal/catch-up-modal.component';
import { WeekDayCardComponent } from './week-day-card/week-day-card.component';
import { WeeklySummaryComponent } from './weekly-summary/weekly-summary.component';

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // days to subtract to reach Monday
  today.setDate(today.getDate() + diff);
  return today;
}

function dateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
  imports: [WeekDayCardComponent, WeeklySummaryComponent, CatchUpModalComponent, HlmButton, HlmDialog, NgIcon],
  templateUrl: './history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideChevronLeft, lucideChevronRight, lucideCalendar })],
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

  // Signal tracking the date selected for the catch-up modal
  readonly selectedDate = signal<string | null>(null);

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

  /** Check if a date falls within the current week (Mon → Sun) */
  isInCurrentWeek(date: Date): boolean {
    const monday = getMondayOfCurrentWeek();
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const dateMs = date.getTime();
    return dateMs >= monday.getTime() && dateMs <= sunday.getTime();
  }

  /** Open the catch-up modal for the given date */
  openCatchUpModal(date: Date): void {
    this.selectedDate.set(dateToString(date));
  }

  /** Close the catch-up modal */
  onModalClosed(): void {
    this.selectedDate.set(null);
  }

  /** Prevent page scroll on Space keypress for clickable elements */
  onSpaceKey(event: Event, date: Date): void {
    (event as KeyboardEvent).preventDefault();
    this.openCatchUpModal(date);
  }
}
