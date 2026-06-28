import { signal, computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

export const TimerStore = signalStore(
  { providedIn: 'root' },
  withState({
    isRunning: false,
    remainingMs: 0,
    currentExerciseId: null as string | null,
    startTime: null as number | null,
    durationMs: 0,
  }),
  withComputed(({ remainingMs }) => {
    const remainingSeconds = computed(() => Math.ceil(remainingMs() / 1000));
    return {
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
    const intervalId = signal<ReturnType<typeof setInterval> | undefined>(undefined);

    const tick = (): void => {
      const start = store.startTime();
      const duration = store.durationMs();

      if (start === null || duration === 0) {
        return;
      }

      const endTime = start + duration;
      const remaining = Math.max(0, endTime - Date.now());

      patchState(store, { remainingMs: remaining });

      if (remaining <= 0) {
        patchState(store, { isRunning: false });
        clearInterval(intervalId());
        intervalId.set(undefined);
      }
    };

    return {
      start(exerciseId: string, durationMs: number): void {
        clearInterval(intervalId());
        intervalId.set(undefined);

        const now = Date.now();

        patchState(store, {
          isRunning: true,
          remainingMs: durationMs,
          currentExerciseId: exerciseId,
          startTime: now,
          durationMs,
        });

        const id = setInterval(tick, 250);
        intervalId.set(id);
      },

      pause(): void {
        clearInterval(intervalId());
        intervalId.set(undefined);
        patchState(store, { isRunning: false });
      },

      reset(): void {
        clearInterval(intervalId());
        intervalId.set(undefined);
        patchState(store, {
          isRunning: false,
          remainingMs: 0,
          currentExerciseId: null,
          startTime: null,
          durationMs: 0,
        });
      },
    };
  }),
  withHooks(({ pause }) => ({
    onDestroy(): void {
      pause();
    },
  })),
);
