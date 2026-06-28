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
  });

  describe('dependencies', () => {
    it('should inject StorageService', () => {
      const storageService = TestBed.inject(StorageService);
      expect(storageService).toBeDefined();
    });
  });
});
