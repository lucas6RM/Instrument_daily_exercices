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
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <!-- Header with title and navigation -->
      <header class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:mb-10">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Historique hebdomadaire
          </h1>
          <p class="mt-1.5 flex items-center gap-2 text-sm text-gray-500">
            <svg
              class="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ weekRangeLabel() }}
          </p>
        </div>

        <nav aria-label="Navigation entre semaines" class="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 active:scale-[0.98]"
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
            <span class="hidden sm:inline">Précédent</span>
          </button>

          <button
            type="button"
            [class]="isNextWeekDisabled()
              ? 'inline-flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-300 shadow-none cursor-not-allowed'
              : 'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 active:scale-[0.98]'"
            (click)="nextWeek()"
            [attr.disabled]="isNextWeekDisabled() ? 'true' : null"
            aria-label="Semaine suivante"
          >
            <span class="hidden sm:inline">Suivant</span>
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
            class="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-green-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 active:scale-[0.98]"
            (click)="goToCurrentWeek()"
            aria-label="Semaine en cours"
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="hidden sm:inline">Aujourd'hui</span>
          </button>
        </nav>
      </header>

      <!-- Week days grid -->
      <section aria-label="Statistiques par jour de la semaine" class="mb-10">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
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
}
