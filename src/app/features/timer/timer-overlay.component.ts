import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ExerciseService } from '../exercise/exercise.service';
import { TimerService } from './timer.service';

@Component({
  selector: 'app-timer-overlay',
  templateUrl: './timer-overlay.component.html',
})
export class TimerOverlayComponent {
  private readonly timerService = inject(TimerService);
  private readonly exerciseService = inject(ExerciseService);

  protected readonly isRunning = this.timerService.isRunning;
  protected readonly formattedTime = this.timerService.formattedTime;
  protected readonly pause = this.timerService.pause;
  protected readonly resume = this.timerService.resume;
  protected readonly reset = this.timerService.reset;

  protected readonly exerciseName = computed(() => {
    const exerciseId = this.timerService.currentExerciseId();
    if (!exerciseId) {
      return '';
    }
    const exercise = this.exerciseService.exercises().find((e) => e.id === exerciseId);
    return exercise?.name ?? '';
  });

  protected readonly visible = computed(
    () => this.timerService.isRunning() || this.timerService.pausedRemainingMs() > 0,
  );
}
