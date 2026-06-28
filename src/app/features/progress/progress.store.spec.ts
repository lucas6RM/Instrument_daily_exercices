import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ProgressStore } from './progress.store';
import { StorageService } from '../../core/services/storage.service';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { DailySession, ProgressState } from '../../core/models';

function setupMockLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
    },
    writable: true,
  });

  return store;
}

describe('ProgressStore', () => {
  let store: InstanceType<typeof ProgressStore>;
  let lsStore: Record<string, string>;

  beforeEach(() => {
    lsStore = setupMockLocalStorage();
    TestBed.configureTestingModule({});
    store = TestBed.inject(ProgressStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with an empty dailySessions array', () => {
      expect(store.dailySessions()).toEqual([]);
    });
  });

  describe('methods', () => {
    describe('getSession', () => {
      it('should return null when no session exists for the date', () => {
        expect(store.getSession('2025-01-01')).toBeNull();
      });

      it('should return the session for the given date', () => {
        const session: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };
        store.addSession(session);

        expect(store.getSession('2025-01-01')).toEqual(session);
      });
    });

    describe('streak', () => {
      it('should return 0 when there are no sessions', () => {
        store.setProgressState({ dailySessions: [] });
        expect(store.streak()).toBe(0);
      });

      it('should calculate the current streak correctly', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const sessions: DailySession[] = [
          {
            date: today.toISOString().split('T')[0],
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: yesterday.toISOString().split('T')[0],
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: twoDaysAgo.toISOString().split('T')[0],
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];

        store.setProgressState({ dailySessions: sessions });
        expect(store.streak()).toBe(3);
      });

      it('should return 0 when today has no session', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const sessions: DailySession[] = [
          {
            date: yesterday.toISOString().split('T')[0],
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];

        store.setProgressState({ dailySessions: sessions });
        expect(store.streak()).toBe(0);
      });

      it('should stop counting at a gap in the streak', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const sessions: DailySession[] = [
          {
            date: today.toISOString().split('T')[0],
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: yesterday.toISOString().split('T')[0],
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: threeDaysAgo.toISOString().split('T')[0],
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];

        store.setProgressState({ dailySessions: sessions });
        expect(store.streak()).toBe(2);
      });
    });

    describe('addSession', () => {
      it('should add a new session to the array', () => {
        const session: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };
        store.addSession(session);

        expect(store.dailySessions()).toHaveLength(1);
        expect(store.dailySessions()[0]).toEqual(session);
      });

      it('should update an existing session with the same date', () => {
        const session1: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };
        const session2: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 15 },
            { exerciseId: 'ex-2', completed: false, actualMinutes: 0 },
          ],
        };

        store.addSession(session1);
        store.addSession(session2);

        expect(store.dailySessions()).toHaveLength(1);
        expect(store.dailySessions()[0]).toEqual(session2);
      });
    });

    describe('updateSession', () => {
      it('should update an existing session by date', () => {
        const session: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: false, actualMinutes: 0 },
          ],
        };
        store.addSession(session);

        store.updateSession('2025-01-01', {
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        });

        const updated = store.getSession('2025-01-01');
        expect(updated?.exercises[0].completed).toBe(true);
        expect(updated?.exercises[0].actualMinutes).toBe(10);
      });

      it('should not affect other sessions', () => {
        const session1: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };
        const session2: DailySession = {
          date: '2025-01-02',
          exercises: [
            { exerciseId: 'ex-1', completed: false, actualMinutes: 0 },
          ],
        };

        store.addSession(session1);
        store.addSession(session2);

        store.updateSession('2025-01-01', {
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 20 },
          ],
        });

        expect(store.getSession('2025-01-02')?.exercises[0].actualMinutes).toBe(0);
      });
    });

    describe('deleteSession', () => {
      it('should remove a session by date', () => {
        const session: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };
        store.addSession(session);

        store.deleteSession('2025-01-01');

        expect(store.dailySessions()).toHaveLength(0);
      });

      it('should not affect other sessions', () => {
        const session1: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };
        const session2: DailySession = {
          date: '2025-01-02',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };

        store.addSession(session1);
        store.addSession(session2);

        store.deleteSession('2025-01-01');

        expect(store.dailySessions()).toHaveLength(1);
        expect(store.dailySessions()[0].date).toBe('2025-01-02');
      });
    });

    describe('setProgressState', () => {
      it('should replace the entire state', () => {
        const session: DailySession = {
          date: '2025-01-01',
          exercises: [
            { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
          ],
        };
        store.addSession(session);

        const newState: ProgressState = {
          dailySessions: [
            {
              date: '2025-02-01',
              exercises: [
                { exerciseId: 'ex-2', completed: false, actualMinutes: 0 },
              ],
            },
          ],
        };
        store.setProgressState(newState);

        expect(store.dailySessions()).toEqual(newState.dailySessions);
      });
    });

    describe('loadFromStorage', () => {
      it('should load state from localStorage', () => {
        const storedState: ProgressState = {
          dailySessions: [
            {
              date: '2025-01-01',
              exercises: [
                { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
              ],
            },
          ],
        };
        lsStore[STORAGE_KEYS.PROGRESS] = JSON.stringify(storedState);

        store.loadFromStorage();

        expect(store.dailySessions()).toEqual(storedState.dailySessions);
      });

      it('should not change state when localStorage is empty', () => {
        const initialSessions = store.dailySessions();
        store.loadFromStorage();

        expect(store.dailySessions()).toEqual(initialSessions);
      });
    });

    describe('getWeekSessions', () => {
      it('should return an empty array when there are no sessions', () => {
        store.setProgressState({ dailySessions: [] });
        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toEqual([]);
      });

      it('should return sessions within the week (Mon-Sun)', () => {
        // 2025-01-06 is a Monday
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-07', // Tuesday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 15 }],
          },
          {
            date: '2025-01-12', // Sunday
            exercises: [{ exerciseId: 'ex-1', completed: false, actualMinutes: 0 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(3);
        expect(weekSessions().map((s: DailySession) => s.date)).toEqual([
          '2025-01-06',
          '2025-01-07',
          '2025-01-12',
        ]);
      });

      it('should exclude sessions before the week', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-05', // Sunday of previous week
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-06', // Monday of target week
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 15 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(1);
        expect(weekSessions()[0].date).toBe('2025-01-06');
      });

      it('should exclude sessions after the week', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-12', // Sunday of target week
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-13', // Monday of next week
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 15 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(1);
        expect(weekSessions()[0].date).toBe('2025-01-12');
      });

      it('should be reactive to state changes', () => {
        store.setProgressState({ dailySessions: [] });
        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(0);

        store.addSession({
          date: '2025-01-08', // Wednesday
          exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 20 }],
        });

        expect(weekSessions()).toHaveLength(1);
        expect(weekSessions()[0].date).toBe('2025-01-08');
      });

      it('should handle sessions outside the week range', () => {
        const sessions: DailySession[] = [
          {
            date: '2024-12-01', // Far before
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-08', // Within week (Wed)
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 15 }],
          },
          {
            date: '2026-06-15', // Far after
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 20 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(1);
        expect(weekSessions()[0].date).toBe('2025-01-08');
      });

      it('should include multiple sessions on the same day', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-08', // Wednesday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(1);
        expect(weekSessions()[0].date).toBe('2025-01-08');
      });

      it('should filter boundary dates correctly (start day included)', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday (start of week)
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(1);
        expect(weekSessions()[0].date).toBe('2025-01-06');
      });

      it('should filter boundary dates correctly (end day included)', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-12', // Sunday (end of week)
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const weekSessions = store.getWeekSessions(monday);

        expect(weekSessions()).toHaveLength(1);
        expect(weekSessions()[0].date).toBe('2025-01-12');
      });
    });

    describe('getWeeklyStats', () => {
      it('should return empty stats for a week with no sessions', () => {
        store.setProgressState({ dailySessions: [] });
        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const stats = store.getWeeklyStats(monday);

        const result = stats();
        expect(result.days).toHaveLength(7);
        expect(result.totalMinutes).toBe(0);
        expect(result.minutesByExercise.size).toBe(0);
        expect(result.completionRate).toBe(0);

        // All days should have 0 minutes and no sessions
        for (const day of result.days) {
          expect(day.totalMinutes).toBe(0);
          expect(day.sessions).toHaveLength(0);
        }
      });

      it('should aggregate total minutes correctly', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
              { exerciseId: 'ex-2', completed: true, actualMinutes: 20 },
            ],
          },
          {
            date: '2025-01-07', // Tuesday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 15 },
            ],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        expect(result.totalMinutes).toBe(45);
      });

      it('should aggregate minutes by exercise across the week', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
              { exerciseId: 'ex-2', completed: true, actualMinutes: 5 },
            ],
          },
          {
            date: '2025-01-07', // Tuesday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 15 },
              { exerciseId: 'ex-3', completed: true, actualMinutes: 8 },
            ],
          },
          {
            date: '2025-01-08', // Wednesday
            exercises: [
              { exerciseId: 'ex-2', completed: true, actualMinutes: 12 },
            ],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        expect(result.minutesByExercise.get('ex-1')).toBe(25);
        expect(result.minutesByExercise.get('ex-2')).toBe(17);
        expect(result.minutesByExercise.get('ex-3')).toBe(8);
        expect(result.minutesByExercise.size).toBe(3);
      });

      it('should calculate completion rate based on days with sessions', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-08', // Wednesday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-10', // Friday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        // 3 days with sessions out of 7
        expect(result.completionRate).toBeCloseTo((3 / 7) * 100);
      });

      it('should give 100% completion rate when all 7 days have sessions', () => {
        const sessions: DailySession[] = [];
        for (let i = 6; i <= 12; i++) {
          const day = String(i).padStart(2, '0');
          sessions.push({
            date: `2025-01-${day}`,
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          });
        }
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        expect(result.completionRate).toBe(100);
      });

      it('should aggregate per-day stats correctly', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
              { exerciseId: 'ex-2', completed: true, actualMinutes: 20 },
            ],
          },
          {
            date: '2025-01-07', // Tuesday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 5 },
            ],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        // Monday: 10 + 20 = 30 minutes
        const mondayStats = result.days.find((d) => d.date.getDate() === 6);
        expect(mondayStats?.totalMinutes).toBe(30);
        expect(mondayStats?.sessions).toHaveLength(1);

        // Tuesday: 5 minutes
        const tuesdayStats = result.days.find((d) => d.date.getDate() === 7);
        expect(tuesdayStats?.totalMinutes).toBe(5);
        expect(tuesdayStats?.sessions).toHaveLength(1);

        // Wednesday (no session): 0 minutes
        const wednesdayStats = result.days.find((d) => d.date.getDate() === 8);
        expect(wednesdayStats?.totalMinutes).toBe(0);
        expect(wednesdayStats?.sessions).toHaveLength(0);
      });

      it('should handle multiple exercises on the same day', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
              { exerciseId: 'ex-2', completed: true, actualMinutes: 15 },
              { exerciseId: 'ex-3', completed: true, actualMinutes: 25 },
            ],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        const mondayStats = result.days.find((d) => d.date.getDate() === 6);
        expect(mondayStats?.totalMinutes).toBe(50);
        expect(result.totalMinutes).toBe(50);
        expect(result.minutesByExercise.get('ex-1')).toBe(10);
        expect(result.minutesByExercise.get('ex-2')).toBe(15);
        expect(result.minutesByExercise.get('ex-3')).toBe(25);
      });

      it('should exclude sessions outside the week from stats', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-05', // Previous Sunday (outside)
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 100 }],
          },
          {
            date: '2025-01-06', // Monday (inside)
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-13', // Next Monday (outside)
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 200 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        expect(result.totalMinutes).toBe(10);
        expect(result.minutesByExercise.get('ex-1')).toBe(10);
        expect(result.completionRate).toBeCloseTo((1 / 7) * 100);
      });

      it('should days array follow Mon-Sun order', () => {
        store.setProgressState({ dailySessions: [] });

        const monday = new Date(2025, 0, 6); // 2025-01-06 (Monday)
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        const dates = result.days.map((d) => d.date.getDate());
        expect(dates).toEqual([6, 7, 8, 9, 10, 11, 12]);
      });

      it('should be reactive to state changes', () => {
        store.setProgressState({ dailySessions: [] });
        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);

        // Initially empty
        expect(stats().totalMinutes).toBe(0);
        expect(stats().completionRate).toBe(0);

        // Add a session
        store.addSession({
          date: '2025-01-08', // Wednesday
          exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 30 }],
        });

        // Stats should update
        expect(stats().totalMinutes).toBe(30);
        expect(stats().minutesByExercise.get('ex-1')).toBe(30);
        expect(stats().completionRate).toBeCloseTo((1 / 7) * 100);

        // Add another session
        store.addSession({
          date: '2025-01-09', // Thursday
          exercises: [{ exerciseId: 'ex-2', completed: true, actualMinutes: 20 }],
        });

        expect(stats().totalMinutes).toBe(50);
        expect(stats().minutesByExercise.get('ex-2')).toBe(20);
        expect(stats().completionRate).toBeCloseTo((2 / 7) * 100);
      });

      it('should handle partial week with sessions only on some days', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
          {
            date: '2025-01-12', // Sunday
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        expect(result.days).toHaveLength(7);
        expect(result.totalMinutes).toBe(20);
        expect(result.completionRate).toBeCloseTo((2 / 7) * 100);

        // Only Mon and Sun have sessions
        const daysWithSessions = result.days.filter((d) => d.sessions.length > 0);
        expect(daysWithSessions).toHaveLength(2);
        expect(daysWithSessions[0].date.getDate()).toBe(6);
        expect(daysWithSessions[1].date.getDate()).toBe(12);
      });

      it('should handle exercises with 0 actualMinutes', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06', // Monday
            exercises: [
              { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
              { exerciseId: 'ex-2', completed: false, actualMinutes: 0 },
            ],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);
        const result = stats();

        expect(result.totalMinutes).toBe(10);
        expect(result.minutesByExercise.get('ex-1')).toBe(10);
        expect(result.minutesByExercise.get('ex-2')).toBe(0);
      });

      it('should return a Signal that depends on the store state', () => {
        const sessions: DailySession[] = [
          {
            date: '2025-01-06',
            exercises: [{ exerciseId: 'ex-1', completed: true, actualMinutes: 10 }],
          },
        ];
        store.setProgressState({ dailySessions: sessions });

        const monday = new Date(2025, 0, 6);
        const stats = store.getWeeklyStats(monday);

        // Deleting the session should update the stats
        store.deleteSession('2025-01-06');

        expect(stats().totalMinutes).toBe(0);
        expect(stats().completionRate).toBe(0);
        expect(stats().minutesByExercise.size).toBe(0);
      });
    });
  });

  describe('dependencies', () => {
    it('should inject StorageService', () => {
      const storageService = TestBed.inject(StorageService);
      expect(storageService).toBeDefined();
    });
  });

  describe('persistence to localStorage', () => {
    it('should persist to localStorage when addSession is called', () => {
      // Reset store to empty state for isolation
      store.setProgressState({ dailySessions: [] });
      // Clear the storage key from the mock
      delete lsStore[STORAGE_KEYS.PROGRESS];

      const session: DailySession = {
        date: '2025-06-28',
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
        ],
      };
      store.addSession(session);

      // The store should have persisted the updated state to localStorage
      const persisted = JSON.parse(lsStore[STORAGE_KEYS.PROGRESS]) as ProgressState;
      expect(persisted.dailySessions).toEqual([session]);
    });

    it('should persist the updated session when an exercise completion toggles', () => {
      // Reset store to empty state for isolation
      store.setProgressState({ dailySessions: [] });
      delete lsStore[STORAGE_KEYS.PROGRESS];

      // Initial session with exercise not completed
      const initialSession: DailySession = {
        date: '2025-06-28',
        exercises: [
          { exerciseId: 'ex-1', completed: false, actualMinutes: 0 },
        ],
      };
      store.addSession(initialSession);

      // Simulate toggle: mark exercise as completed
      const updatedSession: DailySession = {
        date: '2025-06-28',
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
        ],
      };
      store.addSession(updatedSession);

      // The effect should have persisted the updated state
      const persisted = JSON.parse(lsStore[STORAGE_KEYS.PROGRESS]) as ProgressState;
      expect(persisted.dailySessions).toEqual([updatedSession]);

      // Verify the store state reflects the update
      const retrieved = store.getSession('2025-06-28');
      expect(retrieved?.exercises[0].completed).toBe(true);
    });

    it('should persist multiple sessions independently', () => {
      // Reset store to empty state for isolation
      store.setProgressState({ dailySessions: [] });
      delete lsStore[STORAGE_KEYS.PROGRESS];

      const session1: DailySession = {
        date: '2025-06-27',
        exercises: [
          { exerciseId: 'ex-1', completed: true, actualMinutes: 10 },
        ],
      };
      const session2: DailySession = {
        date: '2025-06-28',
        exercises: [
          { exerciseId: 'ex-1', completed: false, actualMinutes: 0 },
        ],
      };

      store.addSession(session1);
      store.addSession(session2);

      // Both sessions should be persisted
      const persisted = JSON.parse(lsStore[STORAGE_KEYS.PROGRESS]) as ProgressState;
      expect(persisted.dailySessions).toHaveLength(2);
      expect(persisted.dailySessions).toEqual([session1, session2]);
    });
  });
});
