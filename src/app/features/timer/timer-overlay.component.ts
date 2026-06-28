import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ExerciseStore } from '../exercise/exercise.store';
import { TimerStore } from './timer.store';

@Component({
  selector: 'app-timer-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed top-4 right-4 z-1000 bg-slate-900 text-white p-4 px-6 rounded-xl shadow-xl flex flex-col items-center gap-2 min-w-35"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        [attr.aria-label]="
          'Compte à rebours : ' + formattedTime() + ', exercice : ' + exerciseName()
        "
      >
        <span class="text-5xl font-bold tabular-nums leading-none tracking-wide">{{
          formattedTime()
        }}</span>
        @if (exerciseName()) {
          <span class="text-sm text-gray-400 text-center">{{ exerciseName() }}</span>
        }
        <div class="flex gap-2 mt-1">
          @if (isRunning()) {
            <button
              type="button"
              (click)="pause()"
              aria-label="Pause"
              class="bg-transparent border border-white/30 text-white py-1.5 px-3 rounded cursor-pointer text-xs transition-colors duration-200 hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              ⏸ Pause
            </button>
            <button
              type="button"
              (click)="reset()"
              aria-label="Stop"
              class="bg-transparent border border-white/30 text-white py-1.5 px-3 rounded cursor-pointer text-xs transition-colors duration-200 hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              ⏹ Stop
            </button>
          } @else {
            <button
              type="button"
              (click)="resume()"
              aria-label="Resume"
              class="bg-transparent border border-white/30 text-white py-1.5 px-3 rounded cursor-pointer text-xs transition-colors duration-200 hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              ▶ Resume
            </button>
            <button
              type="button"
              (click)="reset()"
              aria-label="Stop"
              class="bg-transparent border border-white/30 text-white py-1.5 px-3 rounded cursor-pointer text-xs transition-colors duration-200 hover:bg-white/10 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              ⏹ Stop
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class TimerOverlayComponent {
  private readonly timerStore = inject(TimerStore);
  private readonly exerciseStore = inject(ExerciseStore);

  protected readonly isRunning = this.timerStore.isRunning;
  protected readonly formattedTime = this.timerStore.formattedTime;
  protected readonly pause = this.timerStore.pause;
  protected readonly resume = this.timerStore.resume;
  protected readonly reset = this.timerStore.reset;

  protected readonly exerciseName = computed(() => {
    const exerciseId = this.timerStore.currentExerciseId();
    if (!exerciseId) {
      return '';
    }
    const exercise = this.exerciseStore.exercises().find((e) => e.id === exerciseId);
    return exercise?.name ?? '';
  });

  protected readonly visible = computed(
    () => this.timerStore.isRunning() || this.timerStore.pausedRemainingMs() > 0,
  );
}
