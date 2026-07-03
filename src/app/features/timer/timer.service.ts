import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, interval } from 'rxjs';

import { AudioAlertService } from '../../core/services/audio-alert.service';

export interface TimerExpiredEvent {
  exerciseId: string;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class TimerService implements OnDestroy {
  private readonly audioAlert = inject(AudioAlertService);

  // --- État (signals readonly) ---
  readonly isRunning = signal(false);
  readonly currentExerciseId = signal<string | null>(null);
  readonly endTime = signal<number | null>(null);
  readonly durationMs = signal(0);
  readonly originalDurationMs = signal(0);
  readonly pausedRemainingMs = signal(0);

  // --- Tick réactif via interval + toSignal ---
  private readonly tick$ = new Subject<void>();
  private readonly tick = toSignal(interval(250), { initialValue: 0 });

  // --- Computed ---
  readonly remainingMs = computed(() => {
    this.tick(); // dépendance pour forcer le recalcul
    if (!this.isRunning()) return Math.max(0, this.pausedRemainingMs());
    const end = this.endTime();
    return end ? Math.max(0, end - Date.now()) : 0;
  });

  readonly remainingSeconds = computed(() => Math.ceil(this.remainingMs() / 1000));
  readonly formattedTime = computed(() => {
    const total = this.remainingSeconds();
    const mins = String(Math.floor(total / 60)).padStart(2, '0');
    const secs = String(total % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  });

  // --- Événements ---
  private readonly expiredSubject = new Subject<TimerExpiredEvent>();
  readonly expired$ = this.expiredSubject.asObservable();

  // --- Expiration timeout ---
  private expirationTimeoutId: ReturnType<typeof setTimeout> | undefined;

  // --- Actions ---

  start(exerciseId: string, durationMs: number): void {
    const now = Date.now();

    this.isRunning.set(true);
    this.currentExerciseId.set(exerciseId);
    this.endTime.set(now + durationMs);
    this.durationMs.set(durationMs);
    this.originalDurationMs.set(durationMs);
    this.pausedRemainingMs.set(0);

    // Expiration detection via setTimeout
    clearTimeout(this.expirationTimeoutId);
    this.expirationTimeoutId = setTimeout(() => {
      this.onTimerExpired();
    }, durationMs);
  }

  pause(): void {
    clearTimeout(this.expirationTimeoutId);

    const end = this.endTime();
    const remaining = end !== null ? Math.max(0, end - Date.now()) : 0;

    this.isRunning.set(false);
    this.pausedRemainingMs.set(remaining);
  }

  resume(): void {
    const remaining = this.pausedRemainingMs();
    if (remaining <= 0) {
      return;
    }

    const now = Date.now();

    this.isRunning.set(true);
    this.endTime.set(now + remaining);
    this.durationMs.set(remaining);

    // Expiration detection via setTimeout
    clearTimeout(this.expirationTimeoutId);
    this.expirationTimeoutId = setTimeout(() => {
      this.onTimerExpired();
    }, remaining);
  }

  close(): void {
    clearTimeout(this.expirationTimeoutId);

    this.isRunning.set(false);
    this.currentExerciseId.set(null);
    this.endTime.set(null);
    this.durationMs.set(0);
    this.originalDurationMs.set(0);
    this.pausedRemainingMs.set(0);
  }

  resetToOriginal(): void {
    clearTimeout(this.expirationTimeoutId);
    const original = this.originalDurationMs();
    if (original <= 0) {
      return;
    }
    const now = Date.now();
    this.isRunning.set(false);
    this.endTime.set(now + original);
    this.durationMs.set(original);
    this.pausedRemainingMs.set(original);
    this.expirationTimeoutId = setTimeout(() => {
      this.onTimerExpired();
    }, original);
  }

  // --- Expiration handler ---
  private onTimerExpired(): void {
    this.audioAlert.playBeep();
    this.expiredSubject.next({
      exerciseId: this.currentExerciseId()!,
      durationMs: this.durationMs(),
    });

    // Stop the timer but keep currentExerciseId so the dashboard
    // can react to the expiration and auto-complete the exercise.
    this.isRunning.set(false);
    this.pausedRemainingMs.set(0);
  }

  // --- Lifecycle ---
  ngOnDestroy(): void {
    this.close();
    this.expiredSubject.complete();
    this.tick$.complete();
  }
}
