import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Exercise, WeekDayStats } from '../../../core/models';

@Component({
  selector: 'app-week-day-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let exercises = scheduledExercises();
    @let dayLabel = dayLabelSignal();
    @let dateLabel = dateLabelSignal();
    @let totalMin = totalMinutesSignal();
    @let completedExercises = completedExercisesSignal();
    @let uncompletedExercises = uncompletedExercisesSignal();

    <article
      class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5"
      [attr.aria-label]="'Statistiques du ' + dateLabel"
    >
      <!-- Header: day + date + total -->
      <header class="mb-3 flex items-baseline justify-between border-b border-gray-100 pb-3 sm:mb-4 sm:pb-4">
        <div>
          <h3 class="text-base font-bold text-gray-900 sm:text-lg">
            {{ dayLabel }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ dateLabel }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium text-gray-500">Total</p>
          <p class="text-xl font-bold text-blue-600 sm:text-2xl">
            {{ totalMin }}
            <span class="text-sm font-normal text-gray-500">min</span>
          </p>
        </div>
      </header>

      <!-- Completed exercises -->
      <section aria-label="Exercices réalisés">
        @if (completedExercises.length > 0) {
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">
            Réalisés
          </h4>
          <ul class="mb-3 space-y-1.5" role="list">
            @for (item of completedExercises; track item.exercise.id) {
              <li
                class="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm"
              >
                <span class="font-medium text-green-900">
                  {{ item.exercise.name }}
                </span>
                <span class="font-semibold text-green-700">
                  {{ item.actualMinutes }} min
                </span>
              </li>
            }
          </ul>
        }
      </section>

      <!-- Uncompleted exercises -->
      <section aria-label="Exercices non réalisés">
        @if (uncompletedExercises.length > 0) {
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Non réalisés
          </h4>
          <ul class="space-y-1.5" role="list">
            @for (ex of uncompletedExercises; track ex.id) {
              <li
                class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
              >
                <span class="font-medium text-gray-400 line-through">
                  {{ ex.name }}
                </span>
                <span class="text-gray-400">
                  {{ ex.durationMinutes }} min
                </span>
              </li>
            }
          </ul>
        }
      </section>

      <!-- No exercises scheduled -->
      @if (exercises.length === 0) {
        <p class="py-4 text-center text-sm italic text-gray-400">
          Aucun exercice prévu
        </p>
      }
    </article>
  `,
})
export class WeekDayCardComponent {
  readonly dayStats = input.required<WeekDayStats>();
  readonly scheduledExercises = input<Exercise[]>([]);

  private readonly dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  readonly dayLabelSignal = computed(() => {
    const date = this.dayStats().date;
    return this.dayNames[date.getDay()];
  });

  readonly dateLabelSignal = computed(() => {
    const date = this.dayStats().date;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  });

  readonly totalMinutesSignal = computed(() => this.dayStats().totalMinutes);

  readonly completedExercisesSignal = computed(() => {
    const sessions = this.dayStats().sessions;
    const scheduled = this.scheduledExercises();

    const completedMap = new Map<string, number>();

    for (const session of sessions) {
      for (const ex of session.exercises) {
        if (ex.completed && ex.actualMinutes > 0) {
          const current = completedMap.get(ex.exerciseId) ?? 0;
          completedMap.set(ex.exerciseId, current + ex.actualMinutes);
        }
      }
    }

    return scheduled
      .filter((ex) => completedMap.has(ex.id))
      .map((ex) => ({
        exercise: ex,
        actualMinutes: completedMap.get(ex.id) ?? 0,
      }));
  });

  readonly uncompletedExercisesSignal = computed(() => {
    const completed = this.completedExercisesSignal();
    const scheduled = this.scheduledExercises();
    const completedIds = new Set(completed.map((c) => c.exercise.id));

    return scheduled.filter((ex) => !completedIds.has(ex.id));
  });
}
