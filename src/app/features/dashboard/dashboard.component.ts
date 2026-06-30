import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DailySession } from '../../core/models';
import { ExerciseService } from '../exercise/exercise.service';
import { ProgressService } from '../progress/progress.service';
import { TimerService } from '../timer/timer.service';
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
    <main class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <header class="mb-6 sm:mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Séance du jour
        </h1>
        <p class="mt-2 text-sm text-gray-500">
          Vos exercices quotidiens — restez régulier !
        </p>
      </header>

      <section aria-label="Progression de la séance">
        <app-progress-bar
          [completedCount]="completedCount()"
          [totalCount]="totalCount()"
        />
      </section>

      @if (exercisesWithProgress().length === 0) {
        <div class="mt-6 sm:mt-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 6v6l4 2"
            />
          </svg>
          <p class="mt-4 text-sm text-gray-500">
            Aucun exercice configuré. Ajoutez des exercices dans la rubrique Routine.
          </p>
        </div>
      } @else {
        <div class="mt-6 sm:mt-8 space-y-3" role="list" aria-label="Liste des exercices">
          @for (item of exercisesWithProgress(); track item.exercise.id) {
            <app-exercise-row
              role="listitem"
              [exercise]="item.exercise"
              [isCompleted]="item.completed"
              (playExercise)="onPlayExercise(item.exercise.id)"
            />
          }
        </div>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly progressService = inject(ProgressService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly timerService = inject(TimerService);

  readonly today = getTodayIso();

  private readonly session = signal<DailySession | null>(null);

  // --- Timer expiration via expired$ observable ---
  private readonly expiredSignal = toSignal(this.timerService.expired$, { initialValue: null });
  private readonly expirationEffect = effect(() => {
    const event = this.expiredSignal();
    if (event) {
      this.onTimerComplete(event.exerciseId);
      this.timerService.reset();
    }
  });

  readonly exercisesWithProgress = computed(() => {
    const exercises = this.exerciseService.sortedExercises();
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

  ngOnInit(): void {
    const currentSession = this.progressService.getSession(this.today);

    if (currentSession) {
      this.session.set(currentSession);
    } else {
      const exercises = this.exerciseService.sortedExercises();
      const newSession: DailySession = {
        date: this.today,
        exercises: exercises.map((ex) => ({
          exerciseId: ex.id,
          completed: false,
          actualMinutes: 0,
        })),
      };
      this.progressService.addSession(newSession);
      this.session.set(newSession);
    }
  }

  onTimerComplete(exerciseId: string): void {
    const exercise = this.exerciseService.sortedExercises().find((ex) => ex.id === exerciseId);
    if (!exercise) {
      return;
    }

    this.session.update((current) => {
      if (!current) {
        return current;
      }
      const updatedExercises = current.exercises.map((se) =>
        se.exerciseId === exerciseId
          ? { ...se, completed: true, actualMinutes: exercise.durationMinutes }
          : se,
      );
      const updated = { ...current, exercises: updatedExercises };
      this.progressService.addSession(updated);
      return updated;
    });
  }

  onPlayExercise(exerciseId: string): void {
    const exercise = this.exerciseService.sortedExercises().find((ex) => ex.id === exerciseId);
    if (exercise) {
      this.timerService.start(exerciseId, exercise.durationMinutes * 60000);
    }
  }
}
