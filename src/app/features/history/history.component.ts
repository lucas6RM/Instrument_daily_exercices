import { ApplicationRef, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogContent, HlmDialogPortal, HlmDialogTrigger } from '@spartan-ng/helm/dialog';

import { DailySession } from '../../core/models';
import { ExerciseService } from '../exercise/exercise.service';
import { ProgressService } from '../progress/progress.service';
import { TimerService } from '../timer/timer.service';
import { CatchUpModalComponent, PlayExerciseEvent } from './catch-up-modal/catch-up-modal.component';
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
  imports: [
    WeekDayCardComponent,
    WeeklySummaryComponent,
    CatchUpModalComponent,
    HlmButton,
    HlmDialog,
    HlmDialogContent,
    HlmDialogTrigger,
    HlmDialogPortal,
    NgIcon,
  ],
  templateUrl: './history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  private readonly progressService = inject(ProgressService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly timerService = inject(TimerService);
  private readonly appRef = inject(ApplicationRef);

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

  hasExercises(): boolean {
    return this.exercises().length > 0;
  }

  // Signal tracking the date selected for the catch-up modal
  readonly selectedDate = signal<string | null>(null);

  // Track the date for which the timer was started (to complete exercise on the right date)
  private readonly timerDate = signal<string | null>(null);

  constructor() {
    this.timerService.expired$
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        this.onTimerComplete(event.exerciseId);
        this.timerService.close();
        this.appRef.tick();
      });
  }

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

  /** Handle play exercise from catch-up modal: close modal and start timer */
  onPlayExercise(event: PlayExerciseEvent): void {
    this.timerDate.set(this.selectedDate());
    this.selectedDate.set(null);
    this.timerService.start(event.exerciseId, event.durationSeconds * 1000);
  }

  /** Handle timer expiration: mark exercise as completed or add bonus minutes */
  private onTimerComplete(exerciseId: string): void {
    const date = this.timerDate();
    if (!date) {
      return;
    }

    const exercise = this.exercises().find((ex) => ex.id === exerciseId);
    const current = this.progressService.getSession(date);

    if (!exercise || !current) {
      this.timerDate.set(null);
      return;
    }

    const hasExercise = current.exercises.some((se) => se.exerciseId === exerciseId);
    let updatedExercises: DailySession['exercises'];

    if (hasExercise) {
      const sessionExercise = current.exercises.find((se) => se.exerciseId === exerciseId)!;
      if (sessionExercise.completed) {
        updatedExercises = current.exercises.map((se) =>
          se.exerciseId === exerciseId
            ? { ...se, bonusMinutes: se.bonusMinutes + exercise.durationSeconds }
            : se,
        );
      } else {
        updatedExercises = current.exercises.map((se) =>
          se.exerciseId === exerciseId
            ? { ...se, completed: true, actualMinutes: exercise.durationSeconds }
            : se,
        );
      }
    } else {
      updatedExercises = [
        ...current.exercises,
        {
          exerciseId,
          exerciseName: exercise.name,
          completed: true,
          actualMinutes: exercise.durationSeconds,
          bonusMinutes: 0,
        },
      ];
    }

    const updated = { ...current, exercises: updatedExercises };
    this.progressService.addSession(updated);
    this.timerDate.set(null);
  }

  /** Prevent page scroll on Space keypress for clickable elements */
  onSpaceKey(event: Event, date: Date): void {
    (event as KeyboardEvent).preventDefault();
    this.openCatchUpModal(date);
  }
}
