import { computed, inject, type Signal } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { DailySession, ProgressState, WeekDayStats, WeeklyStats } from '../../core/models';
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
      getWeekSessions(startDate: Date): Signal<DailySession[]> {
        const toLocalISOString = (date: Date): string => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

        return computed(() => {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          end.setHours(23, 59, 59, 999);

          const startStr = toLocalISOString(start);
          const endStr = toLocalISOString(end);

          return store
            .dailySessions()
            .filter((s) => s.date >= startStr && s.date <= endStr);
        });
      },
    };
  }),
  withMethods((store) => {
    return {
      getWeeklyStats(startDate: Date): Signal<WeeklyStats> {
        const toLocalISOString = (date: Date): string => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

        const weekSessionsSignal = store.getWeekSessions(startDate);

        return computed(() => {
          const weekSessions: DailySession[] = weekSessionsSignal();

          // Build 7 days (Mon → Sun)
          const days: WeekDayStats[] = [];
          for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(dayDate.getDate() + i);
            const dayStr = toLocalISOString(dayDate);

            const daySessions = weekSessions.filter((s: DailySession) => s.date === dayStr);
            const totalMinutes = daySessions.reduce(
              (sum: number, session: DailySession) =>
                sum + session.exercises.reduce((eSum: number, ex) => eSum + ex.actualMinutes, 0),
              0,
            );

            days.push({
              date: dayDate,
              totalMinutes,
              sessions: daySessions,
            });
          }

          // Total minutes for the week
          const totalMinutes = days.reduce((sum: number, day: WeekDayStats) => sum + day.totalMinutes, 0);

          // Minutes by exercise
          const minutesByExercise = new Map<string, number>();
          for (const session of weekSessions) {
            for (const ex of session.exercises) {
              const current = minutesByExercise.get(ex.exerciseId) ?? 0;
              minutesByExercise.set(ex.exerciseId, current + ex.actualMinutes);
            }
          }

          // Completion rate: days with at least one session / 7 * 100
          const daysWithSessions = days.filter((day) => day.sessions.length > 0).length;
          const completionRate = (daysWithSessions / 7) * 100;

          return {
            days,
            totalMinutes,
            minutesByExercise,
            completionRate,
          };
        });
      },
    };
  }),
  withHooks((store) => ({
    onInit(): void {
      store.loadFromStorage();
    },
  })),
);
