import { Component, computed, input } from '@angular/core';

import { Exercise, WeeklyStats } from '../../../core/models';

@Component({
  selector: 'app-weekly-summary',
  templateUrl: './weekly-summary.component.html',
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
