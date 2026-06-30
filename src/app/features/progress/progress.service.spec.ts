import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';
import { StorageService } from '../../core/services/storage.service';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { DailySession, ProgressState } from '../../core/models';

describe('ProgressService', () => {
  let service: ProgressService;
  let getSpy: ReturnType<typeof vi.fn>;
  let setSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getSpy = vi.fn(() => null);
    setSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        ProgressService,
        {
          provide: StorageService,
          useValue: {
            get: getSpy,
            set: setSpy,
            remove: vi.fn(),
            keys: STORAGE_KEYS,
          },
        },
      ],
    });

    service = TestBed.inject(ProgressService);
  });

  /* ------------------------------------------------------------------ */
  /* Initial state                                                       */
  /* ------------------------------------------------------------------ */

  describe('initial state', () => {
    it('should have dailySessions as an empty array', () => {
      expect(service.dailySessions()).toEqual([]);
    });
  });

  /* ------------------------------------------------------------------ */
  /* getSession()                                                        */
  /* ------------------------------------------------------------------ */

  describe('getSession()', () => {
    it('should return null when no sessions exist', () => {
      expect(service.getSession('2025-01-01')).toBeNull();
    });

    it('should return the session matching the date', () => {
      const session: DailySession = {
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      };
      service.addSession(session);

      const result = service.getSession('2025-01-01');
      expect(result).toEqual(session);
    });

    it('should return null for a date with no session', () => {
      const session: DailySession = {
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      };
      service.addSession(session);

      expect(service.getSession('2025-01-02')).toBeNull();
    });
  });

  /* ------------------------------------------------------------------ */
  /* streak()                                                            */
  /* ------------------------------------------------------------------ */

  describe('streak()', () => {
    const toLocalISOString = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    it('should return 0 when no sessions exist', () => {
      expect(service.streak()).toBe(0);
    });

    it('should return 1 when today has a session', () => {
      const today = new Date();
      const dateStr = toLocalISOString(today);
      service.addSession({ date: dateStr, exercises: [] });
      expect(service.streak()).toBe(1);
    });

    it('should return 2 when today and yesterday have sessions', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      service.addSession({ date: toLocalISOString(today), exercises: [] });
      service.addSession({ date: toLocalISOString(yesterday), exercises: [] });

      expect(service.streak()).toBe(2);
    });

    it('should break the streak when a day is missing', () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      service.addSession({ date: toLocalISOString(today), exercises: [] });
      service.addSession({ date: toLocalISOString(twoDaysAgo), exercises: [] });

      expect(service.streak()).toBe(1);
    });

    it('should return 0 when the most recent session is not today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      service.addSession({ date: toLocalISOString(yesterday), exercises: [] });
      expect(service.streak()).toBe(0);
    });
  });

  /* ------------------------------------------------------------------ */
  /* addSession()                                                        */
  /* ------------------------------------------------------------------ */

  describe('addSession()', () => {
    it('should add a new session to the list', () => {
      const session: DailySession = {
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      };
      service.addSession(session);

      expect(service.dailySessions()).toHaveLength(1);
      expect(service.dailySessions()[0]).toEqual(session);
    });

    it('should add multiple sessions', () => {
      service.addSession({ date: '2025-01-01', exercises: [] });
      service.addSession({ date: '2025-01-02', exercises: [] });

      expect(service.dailySessions()).toHaveLength(2);
    });

    it('should replace an existing session with the same date', () => {
      const session1: DailySession = {
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: false, actualMinutes: 5 }],
      };
      const session2: DailySession = {
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      };

      service.addSession(session1);
      service.addSession(session2);

      expect(service.dailySessions()).toHaveLength(1);
      expect(service.dailySessions()[0]).toEqual(session2);
    });

    it('should persist after adding a session', () => {
      setSpy.mockClear();
      service.addSession({ date: '2025-01-01', exercises: [] });

      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.PROGRESS, {
        dailySessions: expect.arrayContaining([
          expect.objectContaining({ date: '2025-01-01' }),
        ]),
      });
    });
  });

  /* ------------------------------------------------------------------ */
  /* updateSession()                                                     */
  /* ------------------------------------------------------------------ */

  describe('updateSession()', () => {
    beforeEach(() => {
      service.addSession({
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: false, actualMinutes: 5 }],
      });
      setSpy.mockClear();
    });

    it('should update the session with the given changes', () => {
      service.updateSession('2025-01-01', {
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      });

      const session = service.getSession('2025-01-01')!;
      expect(session.exercises[0].completed).toBe(true);
      expect(session.exercises[0].actualMinutes).toBe(10);
    });

    it('should preserve the date field', () => {
      service.updateSession('2025-01-01', {
        exercises: [{ exerciseId: 'e2', completed: true, actualMinutes: 15 }],
      });

      expect(service.getSession('2025-01-01')?.date).toBe('2025-01-01');
    });

    it('should not affect other sessions', () => {
      service.addSession({
        date: '2025-01-02',
        exercises: [{ exerciseId: 'e1', completed: false, actualMinutes: 5 }],
      });
      service.updateSession('2025-01-01', {
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      });

      const jan2 = service.getSession('2025-01-02')!;
      expect(jan2.exercises[0].completed).toBe(false);
    });

    it('should do nothing for a non-existent date', () => {
      const before = service.dailySessions();
      service.updateSession('2025-99-99', { exercises: [] });
      expect(service.dailySessions()).toEqual(before);
    });

    it('should persist after updating', () => {
      service.updateSession('2025-01-01', {
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      });

      expect(setSpy).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  /* deleteSession()                                                     */
  /* ------------------------------------------------------------------ */

  describe('deleteSession()', () => {
    beforeEach(() => {
      service.addSession({ date: '2025-01-01', exercises: [] });
      service.addSession({ date: '2025-01-02', exercises: [] });
      service.addSession({ date: '2025-01-03', exercises: [] });
      setSpy.mockClear();
    });

    it('should remove the session with the matching date', () => {
      service.deleteSession('2025-01-02');

      expect(service.dailySessions()).toHaveLength(2);
      expect(service.dailySessions().map((s) => s.date)).toEqual([
        '2025-01-01',
        '2025-01-03',
      ]);
    });

    it('should not affect other sessions', () => {
      service.deleteSession('2025-01-02');

      expect(service.getSession('2025-01-01')).not.toBeNull();
      expect(service.getSession('2025-01-03')).not.toBeNull();
    });

    it('should do nothing for a non-existent date', () => {
      const before = service.dailySessions();
      service.deleteSession('2025-99-99');
      expect(service.dailySessions()).toEqual(before);
    });

    it('should empty the list when deleting all sessions', () => {
      service.deleteSession('2025-01-01');
      service.deleteSession('2025-01-02');
      service.deleteSession('2025-01-03');

      expect(service.dailySessions()).toEqual([]);
    });

    it('should persist after deleting', () => {
      service.deleteSession('2025-01-02');
      expect(setSpy).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  /* setProgressState()                                                  */
  /* ------------------------------------------------------------------ */

  describe('setProgressState()', () => {
    it('should replace the entire dailySessions array', () => {
      const state: ProgressState = {
        dailySessions: [
          { date: '2025-01-01', exercises: [] },
          { date: '2025-01-02', exercises: [] },
        ],
      };
      service.setProgressState(state);

      expect(service.dailySessions()).toEqual(state.dailySessions);
    });

    it('should overwrite previous sessions', () => {
      service.addSession({ date: '2025-01-01', exercises: [] });
      service.setProgressState({ dailySessions: [] });

      expect(service.dailySessions()).toEqual([]);
    });

    it('should persist after setting state', () => {
      setSpy.mockClear();
      const state: ProgressState = {
        dailySessions: [{ date: '2025-01-01', exercises: [] }],
      };
      service.setProgressState(state);

      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.PROGRESS, state);
    });
  });

  /* ------------------------------------------------------------------ */
  /* loadFromStorage()                                                   */
  /* ------------------------------------------------------------------ */

  describe('loadFromStorage()', () => {
    it('should load sessions from storage when data exists', () => {
      const stored: ProgressState = {
        dailySessions: [
          { date: '2025-01-01', exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }] },
          { date: '2025-01-02', exercises: [{ exerciseId: 'e2', completed: false, actualMinutes: 5 }] },
        ],
      };
      getSpy.mockReturnValue(stored);

      service.loadFromStorage();

      expect(service.dailySessions()).toEqual(stored.dailySessions);
    });

    it('should not change sessions when storage returns null', () => {
      getSpy.mockReturnValue(null);
      service.addSession({ date: '2025-01-01', exercises: [] });

      const before = service.dailySessions();
      getSpy.mockReturnValue(null);
      service.loadFromStorage();

      expect(service.dailySessions()).toEqual(before);
    });

    it('should call storageService.get with the correct key', () => {
      getSpy.mockReturnValue({ dailySessions: [] });
      service.loadFromStorage();

      expect(getSpy).toHaveBeenCalledWith(STORAGE_KEYS.PROGRESS);
    });
  });

  /* ------------------------------------------------------------------ */
  /* getWeekSessions()                                                   */
  /* ------------------------------------------------------------------ */

  describe('getWeekSessions()', () => {
    it('should return a Signal', () => {
      const result = service.getWeekSessions(new Date('2025-01-06'));
      expect(typeof result).toBe('function');
    });

    it('should return sessions within the 7-day window', () => {
      // Week starts Monday 2025-01-06, ends Sunday 2025-01-12
      const start = new Date('2025-01-06');

      service.addSession({ date: '2025-01-06', exercises: [] }); // Mon (inside)
      service.addSession({ date: '2025-01-08', exercises: [] }); // Wed (inside)
      service.addSession({ date: '2025-01-13', exercises: [] }); // Mon next week (outside)

      const weekSessions = service.getWeekSessions(start);

      expect(weekSessions()).toHaveLength(2);
      expect(weekSessions().map((s) => s.date)).toEqual(['2025-01-06', '2025-01-08']);
    });

    it('should return empty when no sessions in the week', () => {
      const start = new Date('2025-01-06');
      service.addSession({ date: '2025-02-01', exercises: [] });

      const weekSessions = service.getWeekSessions(start);
      expect(weekSessions()).toEqual([]);
    });

    it('should reactively update when sessions change', () => {
      const start = new Date('2025-01-06');
      const weekSessions = service.getWeekSessions(start);

      expect(weekSessions()).toHaveLength(0);

      service.addSession({ date: '2025-01-07', exercises: [] });
      expect(weekSessions()).toHaveLength(1);
    });

    it('should include sessions on the last day of the week', () => {
      const start = new Date('2025-01-06'); // Mon

      service.addSession({ date: '2025-01-12', exercises: [] }); // Sunday (day 7)
      const weekSessions = service.getWeekSessions(start);

      expect(weekSessions()).toHaveLength(1);
    });
  });

  /* ------------------------------------------------------------------ */
  /* getWeeklyStats()                                                    */
  /* ------------------------------------------------------------------ */

  describe('getWeeklyStats()', () => {
    it('should return a Signal', () => {
      const result = service.getWeeklyStats(new Date('2025-01-06'));
      expect(typeof result).toBe('function');
    });

    it('should return 7 days in the days array', () => {
      const start = new Date('2025-01-06');
      const stats = service.getWeeklyStats(start);

      expect(stats().days).toHaveLength(7);
    });

    it('should calculate totalMinutes correctly', () => {
      const start = new Date('2025-01-06');

      service.addSession({
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 10 },
          { exerciseId: 'e2', completed: true, actualMinutes: 15 },
        ],
      });
      service.addSession({
        date: '2025-01-07',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 20 }],
      });

      const stats = service.getWeeklyStats(start);
      expect(stats().totalMinutes).toBe(45);
    });

    it('should calculate minutesByExercise correctly', () => {
      const start = new Date('2025-01-06');

      service.addSession({
        date: '2025-01-06',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10 }],
      });
      service.addSession({
        date: '2025-01-07',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 20 }],
      });
      service.addSession({
        date: '2025-01-08',
        exercises: [{ exerciseId: 'e2', completed: true, actualMinutes: 5 }],
      });

      const stats = service.getWeeklyStats(start);
      expect(stats().minutesByExercise.get('e1')).toBe(30);
      expect(stats().minutesByExercise.get('e2')).toBe(5);
    });

    it('should calculate completionRate based on days with sessions', () => {
      const start = new Date('2025-01-06');

      // 3 out of 7 days have sessions
      service.addSession({ date: '2025-01-06', exercises: [] });
      service.addSession({ date: '2025-01-08', exercises: [] });
      service.addSession({ date: '2025-01-10', exercises: [] });

      const stats = service.getWeeklyStats(start);
      expect(stats().completionRate).toBeCloseTo((3 / 7) * 100);
    });

    it('should return 0 completionRate when no sessions in the week', () => {
      const start = new Date('2025-01-06');
      const stats = service.getWeeklyStats(start);

      expect(stats().completionRate).toBe(0);
    });

    it('should return 100 completionRate when all 7 days have sessions', () => {
      const start = new Date('2025-01-06');
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        service.addSession({ date: d.toISOString().slice(0, 10), exercises: [] });
      }

      const stats = service.getWeeklyStats(start);
      expect(stats().completionRate).toBe(100);
    });

    it('should have correct dates for each day', () => {
      const start = new Date('2025-01-06'); // Monday
      const stats = service.getWeeklyStats(start);

      const expectedDates = ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09',
        '2025-01-10', '2025-01-11', '2025-01-12'];

      const actualDates = stats().days.map((d) => d.date.toISOString().slice(0, 10));
      expect(actualDates).toEqual(expectedDates);
    });

    it('should reactively update when sessions change', () => {
      const start = new Date('2025-01-06');
      const stats = service.getWeeklyStats(start);

      expect(stats().totalMinutes).toBe(0);

      service.addSession({
        date: '2025-01-06',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 30 }],
      });

      expect(stats().totalMinutes).toBe(30);
    });

    it('should return empty minutesByExercise when no sessions', () => {
      const start = new Date('2025-01-06');
      const stats = service.getWeeklyStats(start);

      expect(stats().minutesByExercise.size).toBe(0);
    });

    it('should include sessions with multiple exercises per day', () => {
      const start = new Date('2025-01-06');

      service.addSession({
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 10 },
          { exerciseId: 'e2', completed: true, actualMinutes: 20 },
          { exerciseId: 'e3', completed: false, actualMinutes: 5 },
        ],
      });

      const stats = service.getWeeklyStats(start);
      expect(stats().totalMinutes).toBe(35);
      expect(stats().minutesByExercise.get('e1')).toBe(10);
      expect(stats().minutesByExercise.get('e2')).toBe(20);
      expect(stats().minutesByExercise.get('e3')).toBe(5);
    });
  });

  /* ------------------------------------------------------------------ */
  /* persist() after each mutation                                       */
  /* ------------------------------------------------------------------ */

  describe('persist()', () => {
    it('should persist after addSession', () => {
      setSpy.mockClear();
      service.addSession({ date: '2025-01-01', exercises: [] });
      expect(setSpy).toHaveBeenCalledWith(
        STORAGE_KEYS.PROGRESS,
        expect.objectContaining({ dailySessions: expect.any(Array) }),
      );
    });

    it('should persist after updateSession', () => {
      service.addSession({ date: '2025-01-01', exercises: [] });
      setSpy.mockClear();

      service.updateSession('2025-01-01', { exercises: [] });
      expect(setSpy).toHaveBeenCalled();
    });

    it('should persist after deleteSession', () => {
      service.addSession({ date: '2025-01-01', exercises: [] });
      setSpy.mockClear();

      service.deleteSession('2025-01-01');
      expect(setSpy).toHaveBeenCalled();
    });

    it('should persist after setProgressState', () => {
      setSpy.mockClear();
      service.setProgressState({ dailySessions: [] });
      expect(setSpy).toHaveBeenCalled();
    });

    it('should NOT persist after loadFromStorage', () => {
      getSpy.mockReturnValue({ dailySessions: [] });
      setSpy.mockClear();

      service.loadFromStorage();
      expect(setSpy).not.toHaveBeenCalled();
    });
  });
});
