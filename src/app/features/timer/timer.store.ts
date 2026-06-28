import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { AudioAlertService } from '../../core/services/audio-alert.service';

export const TimerStore = signalStore(
  { providedIn: 'root' },
  withState({
    isRunning: false,
    currentExerciseId: null as string | null,
    startTime: null as number | null,
    endTime: null as number | null,
    durationMs: 0,
    pausedRemainingMs: 0,
    tickCounter: 0,
  }),
  withComputed((store) => {
    const remainingMs = computed(() => {
      // Force recalculation on every tick (tickCounter changes)
      void store.tickCounter();

      if (!store.isRunning()) {
        return Math.max(0, store.pausedRemainingMs());
      }

      const end = store.endTime();
      if (end === null) {
        return 0;
      }

      return Math.max(0, end - Date.now());
    });

    const remainingSeconds = computed(() => Math.ceil(remainingMs() / 1000));

    return {
      remainingMs,
      remainingSeconds,
      formattedTime: computed(() => {
        const totalSeconds = remainingSeconds();
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }),
    };
  }),
  withMethods((store) => {
    const audioAlert = inject(AudioAlertService);
    const intervalId = { value: undefined as ReturnType<typeof setInterval> | undefined };

    const clearTick = (): void => {
      clearInterval(intervalId.value);
      intervalId.value = undefined;
    };

    const resetState = (): void => {
      clearTick();

      patchState(store, {
        isRunning: false,
        currentExerciseId: null,
        startTime: null,
        endTime: null,
        durationMs: 0,
        pausedRemainingMs: 0,
      });
    };

    const tick = (): void => {
      patchState(store, (state) => ({ tickCounter: state.tickCounter + 1 }));

      const remaining = store.remainingMs();
      if (remaining <= 0) {
        audioAlert.playBeep();
        clearTick();
        // Stop the timer but keep currentExerciseId so the dashboard
        // can react to the expiration and auto-complete the exercise.
        patchState(store, {
          isRunning: false,
          pausedRemainingMs: 0,
        });
      }
    };

    return {
      start(exerciseId: string, durationMs: number): void {
        clearTick();

        const now = Date.now();

        patchState(store, {
          isRunning: true,
          currentExerciseId: exerciseId,
          startTime: now,
          endTime: now + durationMs,
          durationMs,
          pausedRemainingMs: 0,
        });

        intervalId.value = setInterval(tick, 250);
      },

      pause(): void {
        clearTick();

        const start = store.startTime();
        const duration = store.durationMs();
        const elapsed = start !== null ? Date.now() - start : 0;
        const remaining = Math.max(0, duration - elapsed);

        patchState(store, {
          isRunning: false,
          pausedRemainingMs: remaining,
        });
      },

      resume(): void {
        const remaining = store.pausedRemainingMs();
        if (remaining <= 0) {
          return;
        }

        patchState(store, {
          isRunning: true,
          startTime: Date.now(),
          endTime: Date.now() + remaining,
          durationMs: remaining,
        });

        intervalId.value = setInterval(tick, 250);
      },

      reset: resetState,
    };
  }),
  withHooks(({ pause }) => ({
    onDestroy(): void {
      pause();
    },
  })),
);
