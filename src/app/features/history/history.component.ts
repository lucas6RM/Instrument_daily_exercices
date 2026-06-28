import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ExerciseStore } from '../exercise/exercise.store';
import { ProgressStore } from '../progress/progress.store';
import { WeekDayCardComponent } from './week-day-card/week-day-card.component';
import { WeeklySummaryComponent } from './weekly-summary/weekly-summary.component';

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
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
  template: `
    <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <!-- Header with title and navigation -->
      <header class="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row sm:mb-8">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Historique hebdomadaire
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ weekRangeLabel() }}
          </p>
        </div>

        <nav aria-label="Navigation entre semaines" class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            (click)="previousWeek()"
            aria-label="Semaine précédente"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Précédent
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            (click)="nextWeek()"
            aria-label="Semaine suivante"
          >
            Suivant
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            (click)="goToCurrentWeek()"
            aria-label="Semaine en cours"
          >
            Aujourd'hui
          </button>
        </nav>
      </header>

      <!-- Week days grid -->
      <section aria-label="Statistiques par jour de la semaine" class="mb-8">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (day of weeklyStats().days; track $index) {
            <app-week-day-card
              [dayStats]="day"
              [scheduledExercises]="exercises()"
            />
          }
        </div>
      </section>

      <!-- Weekly summary -->
      <section aria-label="Résumé hebdomadaire">
        <app-weekly-summary
          [weeklyStats]="weeklyStats()"
          [exercises]="exercises()"
        />
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  private readonly progressStore = inject(ProgressStore);
  private readonly exerciseStore = inject(ExerciseStore);

  readonly currentWeekStart = signal<Date>(getMondayOfCurrentWeek());

  readonly exercises = computed(() => this.exerciseStore.sortedExercises());

  readonly weeklyStats = computed(() =>
    this.progressStore.getWeeklyStats(this.currentWeekStart())()
  );

  readonly weekRangeLabel = computed(() =>
    formatDateRange(this.currentWeekStart())
  );

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
}
