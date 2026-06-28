import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DailySession } from '../../core/models';
import { ExerciseStore } from '../exercise/exercise.store';
import { ProgressStore } from '../progress/progress.store';
import { TimerStore } from '../timer/timer.store';
import { ExerciseRowComponent } from './components/exercise-row/exercise-row.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';

function getTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-dashboard',
  imports: [ExerciseRowComponent, ProgressBarComponent],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-6">
      <h1 class="mb-6 text-2xl font-bold text-gray-900">
        Séance du jour
      </h1>

      <app-progress-bar
        [completedCount]="completedCount()"
        [totalCount]="totalCount()"
      />

      @if (exercisesWithProgress().length === 0) {
        <p class="mt-6 text-center text-gray-500">
          Aucun exercice configuré. Ajoutez des exercices dans la rubrique Routine.
        </p>
      } @else {
        <div class="mt-6 space-y-3" role="list" aria-label="Liste des exercices">
          @for (item of exercisesWithProgress(); track item.exercise.id) {
            <app-exercise-row
              role="listitem"
              [exercise]="item.exercise"
              [isCompleted]="item.completed"
              (toggleComplete)="onToggleComplete(item.exercise.id)"
              (playExercise)="onPlayExercise(item.exercise.id)"
            />
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly progressStore = inject(ProgressStore);
  private readonly exerciseStore = inject(ExerciseStore);
  private readonly timerStore = inject(TimerStore);

  readonly today = getTodayIso();

  private readonly session = signal<DailySession | null>(null);

  readonly exercisesWithProgress = computed(() => {
    const exercises = this.exerciseStore.sortedExercises();
    const currentSession = this.session();

    return exercises.map((ex) => {
      const sessionExercise = currentSession?.exercises.find(
        (se) => se.exerciseId === ex.id,
      );
      return {
        exercise: ex,
        completed: sessionExercise?.completed ?? false,
      };
    });
  });

  readonly completedCount = computed(() => {
    return this.exercisesWithProgress().filter((item) => item.completed).length;
  });

  readonly totalCount = computed(() => {
    return this.exercisesWithProgress().length;
  });

  private readonly timerExpirationEffect = effect(() => {
    const remaining = this.timerStore.remainingMs();
    const isRunning = this.timerStore.isRunning();
    const exerciseId = this.timerStore.currentExerciseId();

    // Timer expired: remainingMs <= 0, isRunning stopped, exercise ID still set
    if (remaining <= 0 && !isRunning && exerciseId !== null) {
      const session = this.session();
      const alreadyCompleted = session?.exercises.some(
        (se) => se.exerciseId === exerciseId && se.completed,
      );

      if (!alreadyCompleted) {
        this.onToggleComplete(exerciseId);
      }

      // Reset timer to prevent re-triggering the effect
      this.timerStore.reset();
    }
  });

  ngOnInit(): void {
    this.progressStore.loadFromStorage();

    const currentSession = this.progressStore.getSession(this.today);

    if (currentSession) {
      this.session.set(currentSession);
    } else {
      const exercises = this.exerciseStore.sortedExercises();
      const newSession: DailySession = {
        date: this.today,
        exercises: exercises.map((ex) => ({
          exerciseId: ex.id,
          completed: false,
          actualMinutes: 0,
        })),
      };
      this.progressStore.addSession(newSession);
      this.session.set(newSession);
    }
  }

  onToggleComplete(exerciseId: string): void {
    this.session.update((current) => {
      if (!current) {
        return current;
      }
      const updatedExercises = current.exercises.map((se) =>
        se.exerciseId === exerciseId
          ? { ...se, completed: !se.completed }
          : se,
      );
      const updated = { ...current, exercises: updatedExercises };
      this.progressStore.addSession(updated);
      return updated;
    });
  }

  onPlayExercise(exerciseId: string): void {
    const exercise = this.exerciseStore.sortedExercises().find((ex) => ex.id === exerciseId);
    if (exercise) {
      this.timerStore.start(exerciseId, exercise.durationMinutes * 60000);
    }
  }
}
