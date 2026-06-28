import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Exercise, WeeklyStats } from '../../../core/models';

@Component({
  selector: 'app-weekly-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let totalMinutes = totalMinutesSignal();
    @let completionRate = completionRateSignal();
    @let formattedRate = formattedRateSignal();
    @let exerciseEntries = exerciseEntriesSignal();

    <section
      class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="weekly-summary-title"
    >
      <h2
        id="weekly-summary-title"
        class="mb-4 text-lg font-bold text-gray-900 sm:text-xl"
      >
        Résumé de la semaine
      </h2>

      <!-- Total time -->
      <div class="mb-5">
        <dl class="flex items-center gap-3">
          <dt class="text-sm font-medium text-gray-500">Temps total</dt>
          <dd class="text-2xl font-bold text-blue-600 sm:text-3xl">
            {{ totalMinutes }}
            <span class="text-sm font-normal text-gray-500">min</span>
          </dd>
        </dl>
      </div>

      <!-- Completion rate -->
      <div class="mb-5">
        <dl class="mb-2 flex items-center gap-3">
          <dt class="text-sm font-medium text-gray-500">Taux de complétion</dt>
          <dd class="text-lg font-bold text-green-600 sm:text-xl">
            {{ formattedRate }}%
          </dd>
        </dl>
        <div
          class="h-3 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          [attr.aria-valuenow]="completionRate"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Taux de complétion hebdomadaire"
        >
          <div
            class="h-full rounded-full bg-green-500 transition-all duration-300"
            [style.width.%]="completionRate"
          ></div>
        </div>
      </div>

      <!-- Minutes by exercise -->
      <div>
        <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Temps par exercice
        </h3>
        @if (exerciseEntries.length > 0) {
          <ul class="space-y-2" role="list">
            @for (entry of exerciseEntries; track entry.exerciseId) {
              <li class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span class="font-medium text-gray-700">
                  {{ entry.exerciseName }}
                </span>
                <span class="font-semibold text-gray-900">
                  {{ entry.minutes }} min
                </span>
              </li>
            }
          </ul>
        } @else {
          <p class="py-3 text-center text-sm italic text-gray-400">
            Aucune donnée d'exercice
          </p>
        }
      </div>
    </section>
  `,
})
export class WeeklySummaryComponent {
  readonly weeklyStats = input.required<WeeklyStats>();
  readonly exercises = input<Exercise[]>([]);

  readonly totalMinutesSignal = computed(() => this.weeklyStats().totalMinutes);

  readonly completionRateSignal = computed(() => this.weeklyStats().completionRate);

  readonly formattedRateSignal = computed(() => {
    const rate = this.weeklyStats().completionRate;
    return Math.round(rate);
  });

  readonly exerciseEntriesSignal = computed(() => {
    const stats = this.weeklyStats();
    const exercises = this.exercises();
    const minutesByExercise = stats.minutesByExercise;

    const exerciseMap = new Map<string, Exercise>();
    for (const ex of exercises) {
      exerciseMap.set(ex.id, ex);
    }

    const entries: { exerciseId: string; exerciseName: string; minutes: number }[] = [];

    for (const [exerciseId, minutes] of minutesByExercise) {
      const exercise = exerciseMap.get(exerciseId);
      entries.push({
        exerciseId,
        exerciseName: exercise?.name ?? exerciseId,
        minutes,
      });
    }

    return entries.sort((a, b) => b.minutes - a.minutes);
  });
}
