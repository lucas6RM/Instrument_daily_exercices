import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';

import { DailySession, Exercise } from '../../../core/models';
import { ProgressService } from '../../progress/progress.service';
import { ExerciseTimeDisplayComponent } from '../../dashboard/components/exercise-time-display/exercise-time-display.component';

export type ExerciseStatus = 'completed' | 'incomplete' | 'removed';

export interface CatchUpExercise {
  exerciseId: string;
  name: string;
  durationSeconds: number;
  status: ExerciseStatus;
  completed: boolean;
  actualMinutes: number;
  bonusMinutes: number;
  playCount: number;
}

export interface PlayExerciseEvent {
  exerciseId: string;
  name: string;
  durationSeconds: number;
}

@Component({
  selector: 'app-catch-up-modal',
  imports: [
    ExerciseTimeDisplayComponent,
    HlmButton,
    HlmCheckbox,
    NgIcon,
  ],
  templateUrl: './catch-up-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatchUpModalComponent {
  readonly date = input.required<string>();
  readonly exercises = input.required<Exercise[]>();
  readonly closed = output<void>();
  readonly playExercise = output<PlayExerciseEvent>();

  private readonly progressService = inject(ProgressService);

  // Local copy of the session managed via ProgressService
  private readonly localSession = signal<DailySession>({ date: '', exercises: [] });

  constructor() {
    effect(() => {
      const date = this.date();
      const session = this.progressService.getOrCreateSession(date);
      this.localSession.set({ ...session });
    });
  }

  /**
   * Build the list of exercises to display:
   * - Exercises from current routine (completed or incomplete)
   * - Exercises from session that were removed from routine (removed)
   */
  readonly catchUpExercises = computed<CatchUpExercise[]>(() => {
    const routineExercises = this.exercises();
    const session = this.localSession();

    const routineIds = new Set(routineExercises.map((e) => e.id));
    const sessionMap = new Map(session.exercises.map((se) => [se.exerciseId, se]));

    const exercises: CatchUpExercise[] = [];

    // Add exercises from the current routine
    for (const ex of routineExercises) {
      const sessionExercise = sessionMap.get(ex.id);
      const completed = sessionExercise?.completed ?? false;
      const actualMinutes = sessionExercise?.actualMinutes ?? 0;
      const bonusMinutes = sessionExercise?.bonusMinutes ?? 0;
      const playCount = completed ? 1 + Math.floor(bonusMinutes / ex.durationSeconds) : 0;

      exercises.push({
        exerciseId: ex.id,
        name: ex.name,
        durationSeconds: ex.durationSeconds,
        status: completed ? 'completed' : 'incomplete',
        completed,
        actualMinutes,
        bonusMinutes,
        playCount,
      });
    }

    // Add exercises from session that are no longer in the routine (removed)
    for (const se of session.exercises) {
      if (!routineIds.has(se.exerciseId)) {
        exercises.push({
          exerciseId: se.exerciseId,
          name: se.exerciseName ?? '(nom inconnu)',
          durationSeconds: se.actualMinutes,
          status: 'removed',
          completed: se.completed,
          actualMinutes: se.actualMinutes,
          bonusMinutes: se.bonusMinutes,
          playCount: se.completed ? 1 + Math.floor(se.bonusMinutes / se.actualMinutes) : 0,
        });
      }
    }

    return exercises;
  });

  /**
   * Emit the exercise info and close the modal.
   * The parent handles starting the timer and completing the exercise.
   */
  onPlay(exerciseId: string): void {
    const exercise = this.catchUpExercises().find((e) => e.exerciseId === exerciseId);
    if (!exercise || exercise.status === 'removed') {
      return;
    }

    this.playExercise.emit({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      durationSeconds: exercise.durationSeconds,
    });
    this.closed.emit();
  }

  closeModal(): void {
    this.closed.emit();
  }
}
