import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

import { Exercise, WeekDayStats } from '../../../core/models';

@Component({
  selector: 'app-week-day-card',
  imports: [HlmCardImports, NgIcon],
  templateUrl: './week-day-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekDayCardComponent {
  readonly dayStats = input.required<WeekDayStats>();
  readonly scheduledExercises = input<Exercise[]>([]);
  readonly isToday = input(false);

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

    const completedMap = new Map<string, { name: string; minutes: number }>();

    for (const session of sessions) {
      for (const ex of session.exercises) {
        if (ex.completed && ex.actualMinutes > 0) {
          const existing = completedMap.get(ex.exerciseId);
          if (existing) {
            existing.minutes += ex.actualMinutes + (ex.bonusMinutes ?? 0);
          } else {
            completedMap.set(ex.exerciseId, {
              name: ex.exerciseName ?? '(nom inconnu)',
              minutes: ex.actualMinutes + (ex.bonusMinutes ?? 0),
            });
          }
        }
      }
    }

    return Array.from(completedMap.entries()).map(([exerciseId, data]) => ({
      exerciseId,
      exerciseName: data.name,
      actualMinutes: data.minutes,
    }));
  });

  readonly uncompletedExercisesSignal = computed(() => {
    const sessions = this.dayStats().sessions;
    const scheduled = this.scheduledExercises();
    const completedIds = new Set<string>();
    const uncompletedMap = new Map<string, string>();

    // First pass: identify completed exercise IDs
    for (const session of sessions) {
      for (const ex of session.exercises) {
        if (ex.completed) {
          completedIds.add(ex.exerciseId);
        }
      }
    }

    // Second pass: collect uncompleted exercises from sessions (use snapshot name)
    for (const session of sessions) {
      for (const ex of session.exercises) {
        if (!completedIds.has(ex.exerciseId) && !uncompletedMap.has(ex.exerciseId)) {
          uncompletedMap.set(ex.exerciseId, ex.exerciseName ?? '(nom inconnu)');
        }
      }
    }

    // Third pass: add scheduled exercises not present in any session
    for (const ex of scheduled) {
      if (!completedIds.has(ex.id) && !uncompletedMap.has(ex.id)) {
        uncompletedMap.set(ex.id, ex.name);
      }
    }

    // Build scheduled lookup for durationMinutes fallback
    const scheduledMap = new Map(scheduled.map((e) => [e.id, e]));

    return Array.from(uncompletedMap.entries()).map(([id, name]) => {
      const scheduledEx = scheduledMap.get(id);
      return {
        id,
        name,
        durationMinutes: scheduledEx?.durationMinutes,
      };
    });
  });
}
