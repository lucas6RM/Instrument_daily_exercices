import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ExerciseStore } from '../exercise/exercise.store';
import { TimerStore } from './timer.store';

@Component({
  selector: 'app-timer-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="timer-overlay"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        [attr.aria-label]="'Compte à rebours : ' + formattedTime() + ', exercice : ' + exerciseName()"
      >
        <span class="timer-time">{{ formattedTime() }}</span>
        @if (exerciseName()) {
          <span class="timer-exercise">{{ exerciseName() }}</span>
        }
        <div class="timer-actions">
          @if (isRunning()) {
            <button type="button" (click)="pause()" aria-label="Pause">⏸ Pause</button>
            <button type="button" (click)="reset()" aria-label="Stop">⏹ Stop</button>
          } @else {
            <button type="button" (click)="resume()" aria-label="Resume">▶ Resume</button>
            <button type="button" (click)="reset()" aria-label="Stop">⏹ Stop</button>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .timer-overlay {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background-color: #1a1a2e;
      color: #ffffff;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      min-width: 140px;
    }

    .timer-time {
      font-size: 2.5rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      letter-spacing: 0.05em;
    }

    .timer-exercise {
      font-size: 0.875rem;
      color: #b0b0b0;
      text-align: center;
    }

    .timer-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .timer-actions button {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background-color 0.2s, border-color 0.2s;
    }

    .timer-actions button:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .timer-actions button:focus-visible {
      outline: 2px solid #4a90d9;
      outline-offset: 2px;
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
    const exercise = this.exerciseStore
      .exercises()
      .find((e) => e.id === exerciseId);
    return exercise?.name ?? '';
  });

  protected readonly visible = computed(
    () =>
      this.timerStore.isRunning() || this.timerStore.pausedRemainingMs() > 0,
  );
}
