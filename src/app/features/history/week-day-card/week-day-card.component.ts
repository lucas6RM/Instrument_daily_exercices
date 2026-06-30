import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Exercise, WeekDayStats } from '../../../core/models';

@Component({
  selector: 'app-week-day-card',
  templateUrl: './week-day-card.component.html',
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
