import { Component, computed, input } from '@angular/core';

import { WeeklyStats } from '../../../core/models';

@Component({
  selector: 'app-weekly-summary',
  templateUrl: './weekly-summary.component.html',
})
export class WeeklySummaryComponent {
  readonly weeklyStats = input.required<WeeklyStats>();

  readonly totalMinutesSignal = computed(() => this.weeklyStats().totalMinutes);

  readonly completionRateSignal = computed(() => this.weeklyStats().completionRate);

  readonly formattedRateSignal = computed(() => {
    const rate = this.weeklyStats().completionRate;
    return Math.round(rate);
  });

  readonly exerciseEntriesSignal = computed(() => {
    const stats = this.weeklyStats();
    const minutesByExercise = stats.minutesByExercise;

    const entries: { exerciseName: string; minutes: number }[] = [];

    for (const [exerciseName, minutes] of minutesByExercise) {
      entries.push({
        exerciseName,
        minutes,
      });
    }

    return entries.sort((a, b) => b.minutes - a.minutes);
  });
}
