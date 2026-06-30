import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  ApplicationRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // Pour nettoyer proprement l'abonnement
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
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Séance du jour</h1>
        <p class="mt-2 text-sm text-gray-500">Vos exercices quotidiens — restez régulier !</p>
      </header>

      <section aria-label="Progression de la séance">
        <app-progress-bar [completedCount]="completedCount()" [totalCount]="totalCount()" />
      </section>

      @if (exercisesWithProgress().length === 0) {
        <div
          class="mt-6 sm:mt-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center"
        >
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
  private readonly appRef = inject(ApplicationRef);

  readonly today = getTodayIso();

  // --- PLUS DE SIGNAL LOCAL "session" COMPLIQUÉ ---
  // On dérive DIRECTEMENT et proprement la session depuis le store global de manière réactive
  readonly currentSession = computed(() => this.progressService.getSession(this.today));

  constructor() {
    // Écoute propre de l'événement d'expiration sans polluer le moteur des éffets Angular
    this.timerService.expired$
      .pipe(takeUntilDestroyed()) // Sécurité anti-fuite de mémoire si on change de page
      .subscribe((event) => {
        this.onTimerComplete(event.exerciseId);
        this.timerService.reset();
        this.appRef.tick();
      });
  }

  readonly exercisesWithProgress = computed(() => {
    const exercises = this.exerciseService.sortedExercises();
    const session = this.currentSession(); // Utilise le computed global

    return exercises.map((ex) => {
      const sessionExercise = session?.exercises.find((se) => se.exerciseId === ex.id);
      return {
        exercise: ex,
        completed: sessionExercise?.completed ?? false,
      };
    });
  });

  readonly completedCount = computed(
    () => this.exercisesWithProgress().filter((item) => item.completed).length,
  );
  readonly totalCount = computed(() => this.exercisesWithProgress().length);

  ngOnInit(): void {
    // On s'assure simplement qu'une session existe dans le store global pour aujourd'hui
    const sessionExists = this.progressService.getSession(this.today);

    if (!sessionExists) {
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
    }
  }

  onTimerComplete(exerciseId: string): void {
    const exercise = this.exerciseService.sortedExercises().find((ex) => ex.id === exerciseId);
    const current = this.progressService.getSession(this.today);

    if (!exercise || !current) return;

    // Mise à jour de l'état directement dans le service global
    const updatedExercises = current.exercises.map((se) =>
      se.exerciseId === exerciseId
        ? { ...se, completed: true, actualMinutes: exercise.durationSeconds }
        : se,
    );

    this.progressService.addSession({ ...current, exercises: updatedExercises });
  }

  onPlayExercise(exerciseId: string): void {
    const exercise = this.exerciseService.sortedExercises().find((ex) => ex.id === exerciseId);
    if (exercise) {
      this.timerService.start(exerciseId, exercise.durationSeconds * 1000);
    }
  }
}
