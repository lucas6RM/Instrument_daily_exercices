import { ApplicationRef, afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DailySession, Exercise } from '../../../core/models';
import { ProgressService } from '../../progress/progress.service';
import { TimerService } from '../../timer/timer.service';
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

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-catch-up-modal',
  imports: [ExerciseTimeDisplayComponent],
  templateUrl: './catch-up-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class CatchUpModalComponent {
  readonly date = input.required<string>();
  readonly exercises = input.required<Exercise[]>();
  readonly closed = output<void>();

  private readonly progressService = inject(ProgressService);
  private readonly timerService = inject(TimerService);
  private readonly appRef = inject(ApplicationRef);

  // Local copy of the session managed via ProgressService
  private readonly localSession = signal<DailySession>({ date: '', exercises: [] });

  // Track which exercise timer is currently active
  readonly activeTimerExerciseId = signal<string | null>(null);

  // Reference to the modal container for focus trap
  private modalContainer: HTMLElement | null = null;

  constructor() {
    // On date change (or init), get or create the session from ProgressService
    effect(() => {
      const date = this.date();
      const session = this.progressService.getOrCreateSession(date);
      this.localSession.set({ ...session });
    });

    // Listen for timer expiration
    this.timerService.expired$
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        this.onTimerComplete(event.exerciseId);
        this.timerService.reset();
        this.appRef.tick();
      });

    // After first render, set up focus trap and focus the close button
    afterNextRender(() => {
      this.setupFocusTrap();
      this.focusCloseButton();
    });
  }

  /**
   * Handle keyboard events at the document level.
   * - Escape: close the modal
   * - Tab / Shift+Tab: trap focus inside the modal
   */
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeModal();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    this.trapFocus(event);
  }

  /**
   * Set up the focus trap by storing a reference to the modal container.
   */
  private setupFocusTrap(): void {
    // The modal container is the dialog element itself
    this.modalContainer = document.querySelector('[role="dialog"]');
  }

  /**
   * Trap focus within the modal container on Tab / Shift+Tab.
   */
  private trapFocus(event: KeyboardEvent): void {
    if (!this.modalContainer) {
      return;
    }

    const focusableElements = this.modalContainer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const elementsArray = Array.from(focusableElements);

    if (elementsArray.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusable = elementsArray[0];
    const lastFocusable = elementsArray[elementsArray.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      // Shift+Tab: if focus is on the first element, wrap to the last
      if (activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: if focus is on the last element, wrap to the first
      if (activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  /**
   * Focus the close button when the modal opens.
   */
  private focusCloseButton(): void {
    const closeButton = this.modalContainer?.querySelector<HTMLButtonElement>('[aria-label="Fermer le modal"]');
    closeButton?.focus();
  }

  /**
   * Handle click on the overlay to close the modal.
   */
  onOverlayClick(event: Event): void {
    // Only close if the click is directly on the overlay (not on the modal content)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /**
   * Handle keyboard on the overlay (Enter/Space to close).
   * Required by the lint rule: click must be accompanied by keyup/keydown/keypress.
   */
  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.closeModal();
    }
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
   * Start the timer for an exercise.
   * Works for both initial completion and replay (bonus minutes).
   */
  playExercise(exerciseId: string): void {
    const exercise = this.catchUpExercises().find((e) => e.exerciseId === exerciseId);
    if (!exercise || exercise.status === 'removed') {
      return;
    }

    this.activeTimerExerciseId.set(exerciseId);
    this.timerService.start(exerciseId, exercise.durationSeconds * 1000);
  }

  /**
   * Handle timer expiration: mark as completed or add bonus minutes.
   */
  private onTimerComplete(exerciseId: string): void {
    const date = this.date();
    const catchUpExercise = this.catchUpExercises().find((e) => e.exerciseId === exerciseId);

    if (!catchUpExercise) {
      return;
    }

    const currentSession = this.progressService.getOrCreateSession(date);
    const sessionExercise = currentSession.exercises.find((se) => se.exerciseId === exerciseId);

    let updatedExercises: DailySession['exercises'];

    if (sessionExercise) {
      if (sessionExercise.completed) {
        // REPLAY: exercise already completed → increment bonusMinutes
        updatedExercises = currentSession.exercises.map((se) =>
          se.exerciseId === exerciseId
            ? { ...se, bonusMinutes: se.bonusMinutes + catchUpExercise.durationSeconds }
            : se,
        );
      } else {
        // First completion: mark as completed
        updatedExercises = currentSession.exercises.map((se) =>
          se.exerciseId === exerciseId
            ? {
                ...se,
                completed: true,
                actualMinutes: catchUpExercise.durationSeconds,
                exerciseName: catchUpExercise.name,
              }
            : se,
        );
      }
    } else {
      // Exercise not in session yet (shouldn't happen for routine exercises, but handle it)
      updatedExercises = [
        ...currentSession.exercises,
        {
          exerciseId,
          exerciseName: catchUpExercise.name,
          completed: true,
          actualMinutes: catchUpExercise.durationSeconds,
          bonusMinutes: 0,
        },
      ];
    }

    const updatedSession: DailySession = { ...currentSession, exercises: updatedExercises };
    this.progressService.addSession(updatedSession);

    // Update local session signal
    this.localSession.set(updatedSession);

    this.activeTimerExerciseId.set(null);
  }

  closeModal(): void {
    this.closed.emit();
  }

  /** Expose timer service for the template */
  protected readonly timerServiceRef = this.timerService;
}
