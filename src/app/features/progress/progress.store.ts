import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { DailySession, ProgressState } from '../../core/models';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { StorageService } from '../../core/services/storage.service';

export const ProgressStore = signalStore(
  { providedIn: 'root' },
  withState<ProgressState>({ dailySessions: [] }),
  withMethods((store) => {
    const storageService = inject(StorageService);

    // Persist current state to localStorage
    const persist = (): void => {
      storageService.set<ProgressState>(STORAGE_KEYS.PROGRESS, {
        dailySessions: store.dailySessions(),
      });
    };

    return {
      getSession(date: string): DailySession | null {
        return store.dailySessions().find((s) => s.date === date) ?? null;
      },
      streak(): number {
        const sessions = store.dailySessions();
        if (sessions.length === 0) {
          return 0;
        }

        const dates = sessions.map((s) => s.date).sort().reverse();
        let streak = 0;

        for (const dateStr of dates) {
          const currentDate = new Date(dateStr);
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - streak);
          expectedDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);

          if (currentDate.getTime() === expectedDate.getTime()) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },
      addSession(session: DailySession): void {
        const existingIndex = store.dailySessions().findIndex((s) => s.date === session.date);
        if (existingIndex >= 0) {
          patchState(store, {
            dailySessions: store
              .dailySessions()
              .map((s, i) => (i === existingIndex ? session : s)),
          });
        } else {
          patchState(store, {
            dailySessions: [...store.dailySessions(), session],
          });
        }
        persist();
      },
      updateSession(date: string, changes: Partial<DailySession>): void {
        patchState(store, {
          dailySessions: store
            .dailySessions()
            .map((s) => (s.date === date ? { ...s, ...changes } : s)),
        });
        persist();
      },
      deleteSession(date: string): void {
        patchState(store, {
          dailySessions: store.dailySessions().filter((s) => s.date !== date),
        });
        persist();
      },
      setProgressState(state: ProgressState): void {
        patchState(store, state);
        persist();
      },
      loadFromStorage(): void {
        const stored = storageService.get<ProgressState>(STORAGE_KEYS.PROGRESS);
        if (stored) {
          patchState(store, stored);
        }
      },
    };
  }),
);
