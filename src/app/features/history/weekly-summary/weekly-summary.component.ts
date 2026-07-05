import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmProgressImports } from '@spartan-ng/helm/progress';

import { WeeklyStats } from '../../../core/models';

@Component({
  selector: 'app-weekly-summary',
  imports: [HlmCardImports, HlmProgressImports, NgIcon],
  templateUrl: './weekly-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklySummaryComponent {
  readonly weeklyStats = input.required<WeeklyStats>();

  readonly totalMinutesSignal = computed(() => this.weeklyStats().totalMinutes);

  readonly formattedTotalTimeSignal = computed(() => {
    const total = this.weeklyStats().totalMinutes;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (hours === 0) {
      return `${minutes} min`;
    }
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
  });

  readonly completionRateSignal = computed(() => this.weeklyStats().completionRate);

  readonly formattedRateSignal = computed(() => {
    const rate = this.weeklyStats().completionRate;
    return Math.round(rate);
  });

  /** Progress bar width capped at 100% (bonus minutes can push rate above 100) */
  readonly progressBarWidthSignal = computed(() => {
    const rate = this.weeklyStats().completionRate;
    return Math.min(rate, 100);
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
