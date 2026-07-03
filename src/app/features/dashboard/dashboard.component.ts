import { ApplicationRef, ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
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
  templateUrl: './dashboard.component.html',
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
        this.timerService.close();
        this.appRef.tick();
      });
  }

  readonly exercisesWithProgress = computed(() => {
    const exercises = this.exerciseService.sortedExercises();
    const session = this.currentSession(); // Utilise le computed global

    return exercises.map((ex) => {
      const sessionExercise = session?.exercises.find((se) => se.exerciseId === ex.id);
      const completed = sessionExercise?.completed ?? false;
      const actualMinutes = sessionExercise?.actualMinutes ?? 0;
      const bonusMinutes = sessionExercise?.bonusMinutes ?? 0;
      const playCount = completed
        ? 1 + Math.floor(bonusMinutes / (actualMinutes || ex.durationSeconds))
        : 1;

      return {
        exercise: ex,
        completed,
        actualMinutes,
        bonusMinutes,
        playCount,
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
          exerciseName: ex.name,
          completed: false,
          actualMinutes: 0,
          bonusMinutes: 0,
        })),
      };
      this.progressService.addSession(newSession);
    }
  }

  onTimerComplete(exerciseId: string): void {
    const exercise = this.exerciseService.sortedExercises().find((ex) => ex.id === exerciseId);
    const current = this.progressService.getSession(this.today);

    if (!exercise || !current) {
      return;
    }

    // 1. On vérifie si l'exercice fait déjà partie de la séance enregistrée
    const hasExercise = current.exercises.some((se) => se.exerciseId === exerciseId);

    let updatedExercises;
    if (hasExercise) {
      const sessionExercise = current.exercises.find((se) => se.exerciseId === exerciseId)!;
      if (sessionExercise.completed) {
        // REPLAY (F8) : l'exercice est déjà complété → incrémenter bonusMinutes
        updatedExercises = current.exercises.map((se) =>
          se.exerciseId === exerciseId
            ? { ...se, bonusMinutes: se.bonusMinutes + exercise.durationSeconds }
            : se,
        );
      } else {
        // Première complétion : marquer comme terminé
        updatedExercises = current.exercises.map((se) =>
          se.exerciseId === exerciseId
            ? { ...se, completed: true, actualMinutes: exercise.durationSeconds }
            : se,
        );
      }
    } else {
      // S'il n'existe pas (ajouté après la création de la séance), on l'injecte dynamiquement !
      updatedExercises = [
        ...current.exercises,
        {
          exerciseId: exerciseId,
          exerciseName: exercise.name,
          completed: true,
          actualMinutes: exercise.durationSeconds,
          bonusMinutes: 0,
        },
      ];
    }

    const updated = { ...current, exercises: updatedExercises };
    this.progressService.addSession(updated);
  }

  onPlayExercise(exerciseId: string): void {
    const exercise = this.exerciseService.sortedExercises().find((ex) => ex.id === exerciseId);
    if (exercise) {
      this.timerService.start(exerciseId, exercise.durationSeconds * 1000);
    }
  }
}
