import { ApplicationRef, ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // Pour nettoyer proprement l'abonnement
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialog, HlmDialogClose, HlmDialogContent, HlmDialogDescription, HlmDialogFooter, HlmDialogHeader, HlmDialogPortal, HlmDialogTitle, HlmDialogTrigger } from '@spartan-ng/helm/dialog';
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
  imports: [
    ExerciseRowComponent,
    ProgressBarComponent,
    HlmDialog,
    HlmDialogContent,
    HlmDialogHeader,
    HlmDialogFooter,
    HlmDialogTitle,
    HlmDialogDescription,
    HlmDialogTrigger,
    HlmDialogPortal,
    HlmDialogClose,
    HlmButton,
  ],
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
        ? 1 + Math.floor(bonusMinutes / (actualMinutes || ex.durationMinutes))
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

  // --- F12 : Garde-fou manuel ---
  readonly confirmTarget = signal<string | null>(null);

  readonly confirmTargetName = computed(() => {
    const id = this.confirmTarget();
    if (!id) return null;
    const exercise = this.exerciseService.sortedExercises().find((ex) => ex.id === id);
    return exercise?.name ?? null;
  });

  onToggleComplete(exerciseId: string): void {
    const item = this.exercisesWithProgress().find((i) => i.exercise.id === exerciseId);
    if (item?.completed) {
      return;
    }
    this.confirmTarget.set(exerciseId);
  }

  confirmComplete(): void {
    const exerciseId = this.confirmTarget();
    if (exerciseId) {
      this.onTimerComplete(exerciseId);
    }
    this.confirmTarget.set(null);
  }

  cancelConfirm(): void {
    this.confirmTarget.set(null);
  }

  ngOnInit(): void {
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

      // Backfill des jours manquants si la session n'est pas vide
      if (exercises.length > 0) {
        this.progressService.backfillMissingSessions(this.today, newSession.exercises);
      }
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
            ? { ...se, bonusMinutes: se.bonusMinutes + exercise.durationMinutes }
            : se,
        );
      } else {
        // Première complétion : marquer comme terminé
        updatedExercises = current.exercises.map((se) =>
          se.exerciseId === exerciseId
            ? { ...se, completed: true, actualMinutes: exercise.durationMinutes }
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
          actualMinutes: exercise.durationMinutes,
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
      this.timerService.start(exerciseId, exercise.durationMinutes * 60000);
    }
  }
}
