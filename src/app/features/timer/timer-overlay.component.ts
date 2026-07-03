import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmProgressImports } from '@spartan-ng/helm/progress';

import { ExerciseService } from '../exercise/exercise.service';
import { TimerService } from './timer.service';

@Component({
  selector: 'app-timer-overlay',
  imports: [NgIcon, HlmButtonImports, HlmProgressImports],
  templateUrl: './timer-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerOverlayComponent {
  private readonly timerService = inject(TimerService);
  private readonly exerciseService = inject(ExerciseService);

  protected readonly isRunning = this.timerService.isRunning;
  protected readonly formattedTime = this.timerService.formattedTime;
  protected readonly pause = this.timerService.pause.bind(this.timerService);
  protected readonly resume = this.timerService.resume.bind(this.timerService);
  protected readonly resetToOriginal = this.timerService.resetToOriginal.bind(this.timerService);
  protected readonly close = this.timerService.close.bind(this.timerService);

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

  protected readonly progress = computed(() => {
    const remaining = this.timerService.remainingMs();
    const duration = this.timerService.durationMs();
    if (duration <= 0) {
      return 0;
    }
    return Math.round((remaining / duration) * 100);
  });
}
