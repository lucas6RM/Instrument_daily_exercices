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
