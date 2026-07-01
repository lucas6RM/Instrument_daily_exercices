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

    // Check if today has a session
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (!sessions.some((s) => s.date === todayStr)) {
      return 0;
    }

    const sessionDates = new Set(sessions.map((s) => s.date));
    let streak = 0;

    while (true) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - streak);
      const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (sessionDates.has(checkStr)) {
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

  /**
   * Ajoute un nouvel exercice à la séance du jour si elle existe.
   * Ne fait rien s'il n'y a pas de séance aujourd'hui ou si l'exercice est déjà présent.
   */
  addExerciseToTodaySession(exerciseId: string, exerciseName: string): void {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const session = this.getSession(todayStr);
    if (!session) {
      return;
    }

    // Évite les doublons
    const alreadyExists = session.exercises.some((se) => se.exerciseId === exerciseId);
    if (alreadyExists) {
      return;
    }

    const updatedSession: DailySession = {
      ...session,
      exercises: [
        ...session.exercises,
        {
          exerciseId,
          exerciseName,
          completed: false,
          actualMinutes: 0,
          bonusMinutes: 0,
        },
      ],
    };
    this.addSession(updatedSession);
  }

  loadFromStorage(): void {
    const stored = this.storageService.get<ProgressState>(STORAGE_KEYS.PROGRESS);
    if (stored) {
      this.dailySessions.set(stored.dailySessions);
      this.migrateBonusMinutes();
    }
  }

  /**
   * Migration F8 : ajoute `bonusMinutes: 0` aux exercices qui ne l'ont pas.
   * S'exécute au chargement des données depuis localStorage.
   */
  private migrateBonusMinutes(): void {
    let hasChanges = false;

    const migratedSessions = this.dailySessions().map((session) => {
      const migratedExercises = session.exercises.map((exercise) => {
        if (exercise.bonusMinutes === undefined) {
          hasChanges = true;
          return { ...exercise, bonusMinutes: 0 };
        }
        return exercise;
      });

      if (migratedExercises !== session.exercises) {
        return { ...session, exercises: migratedExercises };
      }
      return session;
    });

    if (hasChanges) {
      this.dailySessions.set(migratedSessions);
      this.persist();
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

      // Minutes by exercise (using exerciseName from snapshot)
      const minutesByExercise = new Map<string, number>();
      for (const session of weekSessions) {
        for (const ex of session.exercises) {
          const name = ex.exerciseName ?? '(nom inconnu)';
          const current = minutesByExercise.get(name) ?? 0;
          minutesByExercise.set(name, current + ex.actualMinutes);
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
