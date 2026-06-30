import { Injectable, inject, signal, computed, type Signal } from '@angular/core';

import { DailySession, ProgressState, WeekDayStats, WeeklyStats } from '../../core/models';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { StorageService } from '../../core/services/storage.service';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly storageService = inject(StorageService);

  // --- État (signal readonly) ---
  readonly dailySessions = signal<DailySession[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  // --- Persistance ---
  private persist(): void {
    this.storageService.set<ProgressState>(STORAGE_KEYS.PROGRESS, {
      dailySessions: this.dailySessions(),
    });
  }

  // --- Méthodes ---

  getSession(date: string): DailySession | null {
    return this.dailySessions().find((s) => s.date === date) ?? null;
  }

  streak(): number {
    const sessions = this.dailySessions();
    if (sessions.length === 0) {
      return 0;
    }

    const dates = sessions
      .map((s) => s.date)
      .sort()
      .reverse();
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
  }

  addSession(session: DailySession): void {
    const existingIndex = this.dailySessions().findIndex((s) => s.date === session.date);
    if (existingIndex >= 0) {
      this.dailySessions.update((sessions) =>
        sessions.map((s, i) => (i === existingIndex ? session : s)),
      );
    } else {
      this.dailySessions.update((sessions) => [...sessions, session]);
    }
    this.persist();
  }

  updateSession(date: string, changes: Partial<DailySession>): void {
    this.dailySessions.update((sessions) =>
      sessions.map((s) => (s.date === date ? { ...s, ...changes } : s)),
    );
    this.persist();
  }

  deleteSession(date: string): void {
    this.dailySessions.update((sessions) => sessions.filter((s) => s.date !== date));
    this.persist();
  }

  setProgressState(state: ProgressState): void {
    this.dailySessions.set(state.dailySessions);
    this.persist();
  }

  loadFromStorage(): void {
    const stored = this.storageService.get<ProgressState>(STORAGE_KEYS.PROGRESS);
    if (stored) {
      this.dailySessions.set(stored.dailySessions);
    }
  }

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

      return this.dailySessions().filter((s) => s.date >= startStr && s.date <= endStr);
    });
  }

  getWeeklyStats(startDate: Date): Signal<WeeklyStats> {
    const toLocalISOString = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const weekSessionsSignal = this.getWeekSessions(startDate);

    return computed(() => {
      const weekSessions: DailySession[] = weekSessionsSignal();

      // Build 7 days (Mon → Sun)
      const days: WeekDayStats[] = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);
        const dayStr = toLocalISOString(dayDate);

        const daySessions = weekSessions.filter((s) => s.date === dayStr);
        const totalMinutes = daySessions.reduce(
          (sum, session) =>
            sum + session.exercises.reduce((eSum, ex) => eSum + ex.actualMinutes, 0),
          0,
        );

        days.push({
          date: dayDate,
          totalMinutes,
          sessions: daySessions,
        });
      }

      // Total minutes for the week
      const totalMinutes = days.reduce((sum, day) => sum + day.totalMinutes, 0);

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
  }
}
