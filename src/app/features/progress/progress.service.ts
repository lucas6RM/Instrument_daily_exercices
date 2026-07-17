import { Injectable, inject, signal, computed, type Signal } from '@angular/core';

import { Exercise } from '../../core/models/exercise';
import { DailySession, ProgressState, WeekDayStats, WeeklyStats } from '../../core/models';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { StorageService } from '../../core/services/storage.service';

function getMondayOfDate(date: Date): Date {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  const dayOfWeek = monday.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);
  return monday;
}

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

  getOrCreateSession(date: string): DailySession {
    const existing = this.dailySessions().find((s) => s.date === date);
    if (existing) {
      return existing;
    }
    const newSession: DailySession = { date, exercises: [] };
    this.dailySessions.update((sessions) => [...sessions, newSession]);
    this.persist();
    return newSession;
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

  /**
   * Remplit les jours manquants entre la dernière session enregistrée et aujourd'hui.
   * Crée des sessions avec les exercices fournis, toutes marquées comme non complétées.
   * Limité aux 7 derniers jours et ne crée que si aucune session n'existe déjà.
   */
  backfillMissingSessions(todayDate: string, exercises: { exerciseId: string; exerciseName?: string }[]): void {
    if (exercises.length === 0) {
      return;
    }

    const sessions = this.dailySessions();
    const sessionDates = new Set(sessions.map((s) => s.date));

    // Find the last recorded session date before today
    const sortedDates = sessions
      .map((s) => s.date)
      .filter((date) => date < todayDate)
      .sort((a, b) => b.localeCompare(a));

    if (sortedDates.length === 0) {
      return;
    }

    const lastSessionDate = sortedDates[0];
    const lastDate = new Date(lastSessionDate);
    const today = new Date(todayDate);

    // Generate backfill sessions for each missing day between last session and today
    const backfillSessions: DailySession[] = [];
    const currentDate = new Date(lastDate);
    currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate < today) {
      // Check if we're within the 7-day limit from today
      const daysFromToday = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysFromToday > 7) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      if (!sessionDates.has(dateStr)) {
        backfillSessions.push({
          date: dateStr,
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName ?? '',
            completed: false,
            actualMinutes: 0,
            bonusMinutes: 0,
          })),
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (backfillSessions.length > 0) {
      this.dailySessions.update((sessions) => [...sessions, ...backfillSessions]);
      this.persist();
    }
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

  getWeeklyStats(startDate: Date, exercises: Exercise[], today: Date): Signal<WeeklyStats> {
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
            sum + session.exercises.reduce((eSum, ex) => eSum + ex.actualMinutes + ex.bonusMinutes, 0),
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
          minutesByExercise.set(name, current + ex.actualMinutes + (ex.bonusMinutes ?? 0));
        }
      }

      const totalActualMinutes = weekSessions.reduce(
        (sum, session) =>
          sum + session.exercises.reduce((eSum, ex) => eSum + ex.actualMinutes + ex.bonusMinutes, 0),
        0,
      );

      // Build exerciseId → durationMinutes lookup from the current routine
      const durationLookup = new Map<string, number>();
      for (const ex of exercises) {
        durationLookup.set(ex.id, ex.durationMinutes);
      }

      // Determine the range of days to consider for the target
      const isCurrentWeek = startDate.toDateString() === getMondayOfDate(today).toDateString();
      const maxDayIndex = isCurrentWeek
        ? Math.floor((today.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 6;

      // Calculate total target per day: only days with sessions contribute to the target
      let totalTargetMinutes = 0;
      for (let i = 0; i <= maxDayIndex; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);
        const dayStr = toLocalISOString(dayDate);

        const daySession = weekSessions.find((s) => s.date === dayStr);
        if (daySession) {
          for (const se of daySession.exercises) {
            const duration = durationLookup.get(se.exerciseId);
            if (duration !== undefined) {
              totalTargetMinutes += duration;
            }
          }
        }
      }

      const completionRate = totalTargetMinutes > 0 ? (totalActualMinutes / totalTargetMinutes) * 100 : 0;

      return {
        days,
        totalMinutes,
        minutesByExercise,
        completionRate,
      };
    });
  }
}
