import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';
import { StorageService } from '../../core/services/storage.service';
import { STORAGE_KEYS } from '../../core/services/storage-keys';
import { DailySession, Exercise, ProgressState } from '../../core/models';

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
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
      };
      service.addSession(session);

      const result = service.getSession('2025-01-01');
      expect(result).toEqual(session);
    });

    it('should return null for a date with no session', () => {
      const session: DailySession = {
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
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
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
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
        exercises: [{ exerciseId: 'e1', completed: false, actualMinutes: 5, bonusMinutes: 0 }],
      };
      const session2: DailySession = {
        date: '2025-01-01',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
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
        exercises: [{ exerciseId: 'e1', completed: false, actualMinutes: 5, bonusMinutes: 0 }],
      });
      setSpy.mockClear();
    });

    it('should update the session with the given changes', () => {
      service.updateSession('2025-01-01', {
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
      });

      const session = service.getSession('2025-01-01')!;
      expect(session.exercises[0].completed).toBe(true);
      expect(session.exercises[0].actualMinutes).toBe(10);
    });

    it('should preserve the date field', () => {
      service.updateSession('2025-01-01', {
        exercises: [{ exerciseId: 'e2', completed: true, actualMinutes: 15, bonusMinutes: 0 }],
      });

      expect(service.getSession('2025-01-01')?.date).toBe('2025-01-01');
    });

    it('should not affect other sessions', () => {
      service.addSession({
        date: '2025-01-02',
        exercises: [{ exerciseId: 'e1', completed: false, actualMinutes: 5, bonusMinutes: 0 }],
      });
      service.updateSession('2025-01-01', {
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
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
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
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
  /* addExerciseToTodaySession()                                         */
  /* ------------------------------------------------------------------ */

  describe('addExerciseToTodaySession()', () => {
    const toLocalISOString = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    it('should add the exercise to today session if it exists', () => {
      const today = new Date();
      const todayStr = toLocalISOString(today);

      service.addSession({
        date: todayStr,
        exercises: [{ exerciseId: 'e1', exerciseName: 'Ex1', completed: false, actualMinutes: 0, bonusMinutes: 0 }],
      });

      service.addExerciseToTodaySession('e2', 'NewExercise');

      const session = service.getSession(todayStr)!;
      expect(session.exercises).toHaveLength(2);
      expect(session.exercises[1]).toEqual({
        exerciseId: 'e2',
        exerciseName: 'NewExercise',
        completed: false,
        actualMinutes: 0,
        bonusMinutes: 0,
      });
    });

    it('should do nothing when there is no session for today', () => {
      service.addSession({ date: '2025-01-01', exercises: [] });

      service.addExerciseToTodaySession('e1', 'Exercise');

      expect(service.dailySessions()).toHaveLength(1);
      expect(service.getSession('2025-01-01')?.exercises).toHaveLength(0);
    });

    it('should not add a duplicate exercise', () => {
      const today = new Date();
      const todayStr = toLocalISOString(today);

      service.addSession({
        date: todayStr,
        exercises: [{ exerciseId: 'e1', exerciseName: 'Ex1', completed: false, actualMinutes: 0, bonusMinutes: 0 }],
      });

      service.addExerciseToTodaySession('e1', 'Ex1');

      const session = service.getSession(todayStr)!;
      expect(session.exercises).toHaveLength(1);
    });

    it('should persist after adding the exercise', () => {
      const today = new Date();
      const todayStr = toLocalISOString(today);

      service.addSession({
        date: todayStr,
        exercises: [],
      });
      setSpy.mockClear();

      service.addExerciseToTodaySession('e1', 'Exercise');

      expect(setSpy).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  /* loadFromStorage()                                                   */
  /* ------------------------------------------------------------------ */

  describe('loadFromStorage()', () => {
    it('should load sessions from storage when data exists', () => {
      const stored: ProgressState = {
        dailySessions: [
          { date: '2025-01-01', exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }] },
          { date: '2025-01-02', exercises: [{ exerciseId: 'e2', completed: false, actualMinutes: 5, bonusMinutes: 0 }] },
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
  /* Migration bonusMinutes (F8)                                         */
  /* ------------------------------------------------------------------ */

  describe('migrateBonusMinutes()', () => {
    it('should add bonusMinutes: 0 to exercises missing the field', () => {
      // Simule des données legacy sans bonusMinutes
      const stored = {
        dailySessions: [
          {
            date: '2025-01-01',
            exercises: [
              { exerciseId: 'e1', completed: true, actualMinutes: 10 },
              { exerciseId: 'e2', completed: false, actualMinutes: 0 },
            ],
          },
        ],
      } as unknown as ProgressState;
      getSpy.mockReturnValue(stored);
      setSpy.mockClear();

      service.loadFromStorage();

      const sessions = service.dailySessions();
      expect(sessions[0].exercises[0].bonusMinutes).toBe(0);
      expect(sessions[0].exercises[1].bonusMinutes).toBe(0);
      expect(setSpy).toHaveBeenCalled();
    });

    it('should not persist when all exercises already have bonusMinutes', () => {
      const stored: ProgressState = {
        dailySessions: [
          {
            date: '2025-01-01',
            exercises: [
              { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 5 },
            ],
          },
        ],
      };
      getSpy.mockReturnValue(stored);
      setSpy.mockClear();

      service.loadFromStorage();

      expect(setSpy).not.toHaveBeenCalled();
    });

    it('should preserve existing bonusMinutes values', () => {
      const stored = {
        dailySessions: [
          {
            date: '2025-01-01',
            exercises: [
              { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 7 },
              { exerciseId: 'e2', completed: false, actualMinutes: 0 },
            ],
          },
        ],
      } as unknown as ProgressState;
      getSpy.mockReturnValue(stored);

      service.loadFromStorage();

      const sessions = service.dailySessions();
      expect(sessions[0].exercises[0].bonusMinutes).toBe(7);
      expect(sessions[0].exercises[1].bonusMinutes).toBe(0);
    });

    it('should handle sessions with empty exercises array', () => {
      const stored: ProgressState = {
        dailySessions: [
          { date: '2025-01-01', exercises: [] },
        ],
      };
      getSpy.mockReturnValue(stored);
      setSpy.mockClear();

      service.loadFromStorage();

      expect(service.dailySessions()).toEqual(stored.dailySessions);
      expect(setSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple sessions with mixed state', () => {
      const stored = {
        dailySessions: [
          {
            date: '2025-01-01',
            exercises: [
              { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 3 },
            ],
          },
          {
            date: '2025-01-02',
            exercises: [
              { exerciseId: 'e2', completed: false, actualMinutes: 0 },
            ],
          },
        ],
      } as unknown as ProgressState;
      getSpy.mockReturnValue(stored);

      service.loadFromStorage();

      const sessions = service.dailySessions();
      expect(sessions[0].exercises[0].bonusMinutes).toBe(3);
      expect(sessions[1].exercises[0].bonusMinutes).toBe(0);
    });

    it('should persist migrated data to storage', () => {
      const stored = {
        dailySessions: [
          {
            date: '2025-01-01',
            exercises: [
              { exerciseId: 'e1', completed: true, actualMinutes: 10 },
            ],
          },
        ],
      } as unknown as ProgressState;
      getSpy.mockReturnValue(stored);
      setSpy.mockClear();

      service.loadFromStorage();

      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.PROGRESS, {
        dailySessions: [
          {
            date: '2025-01-01',
            exercises: [
              { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 },
            ],
          },
        ],
      });
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
    const routine: Exercise[] = [
      { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
      { id: 'e2', name: 'Gammes', durationSeconds: 30, order: 2 },
    ];

    it('should return a Signal', () => {
      const result = service.getWeeklyStats(new Date('2025-01-06'), routine);
      expect(typeof result).toBe('function');
    });

    it('should return 7 days in the days array', () => {
      const start = new Date('2025-01-06');
      const stats = service.getWeeklyStats(start, routine);

      expect(stats().days).toHaveLength(7);
    });

    it('should calculate totalMinutes correctly', () => {
      const start = new Date('2025-01-06');

      service.addSession({
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 },
          { exerciseId: 'e2', completed: true, actualMinutes: 15, bonusMinutes: 0 },
        ],
      });
      service.addSession({
        date: '2025-01-07',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 20, bonusMinutes: 0 }],
      });

      const stats = service.getWeeklyStats(start, routine);
      expect(stats().totalMinutes).toBe(45);
    });

    it('should calculate minutesByExercise correctly using exerciseName', () => {
      const start = new Date('2025-01-06');

      service.addSession({
        date: '2025-01-06',
        exercises: [{ exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
      });
      service.addSession({
        date: '2025-01-07',
        exercises: [{ exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 20, bonusMinutes: 0 }],
      });
      service.addSession({
        date: '2025-01-08',
        exercises: [{ exerciseId: 'e2', exerciseName: 'Gammes', completed: true, actualMinutes: 5, bonusMinutes: 0 }],
      });

      const stats = service.getWeeklyStats(start, routine);
      expect(stats().minutesByExercise.get('Chromatique')).toBe(30);
      expect(stats().minutesByExercise.get('Gammes')).toBe(5);
    });

    it('should use fallback "(nom inconnu)" when exerciseName is missing', () => {
      const start = new Date('2025-01-06');

      service.addSession({
        date: '2025-01-06',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 }],
      });
      service.addSession({
        date: '2025-01-07',
        exercises: [{ exerciseId: 'e2', completed: true, actualMinutes: 5, bonusMinutes: 0 }],
      });

      const stats = service.getWeeklyStats(start, routine);
      expect(stats().minutesByExercise.get('(nom inconnu)')).toBe(15);
    });

    it('should calculate completionRate as actual time / target time', () => {
      const start = new Date('2025-01-06');

      // Routine: 2 exercises × 30s = 60s/day → 420s/week target

      // Day 1: 10 + 15 = 25s actual
      service.addSession({
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 10, bonusMinutes: 0 },
          { exerciseId: 'e2', completed: true, actualMinutes: 15, bonusMinutes: 0 },
        ],
      });
      // Day 2: 20s actual
      service.addSession({
        date: '2025-01-07',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 20, bonusMinutes: 0 }],
      });

      const stats = service.getWeeklyStats(start, routine);
      // totalActual = 10 + 15 + 20 = 45, totalTarget = 60 * 7 = 420
      expect(stats().completionRate).toBeCloseTo((45 / 420) * 100);
    });

    it('should include bonusMinutes in completionRate', () => {
      const start = new Date('2025-01-06');
      const singleRoutine: Exercise[] = [
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
      ];

      // 30s actual + 10s bonus = 40s, target = 30 * 7 = 210
      service.addSession({
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 30, bonusMinutes: 10 },
        ],
      });

      const stats = service.getWeeklyStats(start, singleRoutine);
      expect(stats().completionRate).toBeCloseTo((40 / 210) * 100);
    });

    it('should return 0 completionRate when no sessions in the week', () => {
      const start = new Date('2025-01-06');

      const stats = service.getWeeklyStats(start, routine);

      expect(stats().completionRate).toBe(0);
    });

    it('should return 0 completionRate when no exercises in routine', () => {
      const start = new Date('2025-01-06');

      // Empty routine → target = 0 → completionRate = 0
      service.addSession({
        date: '2025-01-06',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 30, bonusMinutes: 0 }],
      });

      const stats = service.getWeeklyStats(start, []);
      expect(stats().completionRate).toBe(0);
    });

    it('should return 100 completionRate when actual equals target', () => {
      const start = new Date('2025-01-06');
      const singleRoutine: Exercise[] = [
        { id: 'e1', name: 'Chromatique', durationSeconds: 30, order: 1 },
      ];

      // Fill all 7 days with 30s each = 210s = target
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        service.addSession({
          date: d.toISOString().slice(0, 10),
          exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 30, bonusMinutes: 0 }],
        });
      }

      const stats = service.getWeeklyStats(start, singleRoutine);
      expect(stats().completionRate).toBeCloseTo(100);
    });

    it('should have correct dates for each day', () => {
      const start = new Date('2025-01-06'); // Monday
      const stats = service.getWeeklyStats(start, routine);

      const expectedDates = ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09',
        '2025-01-10', '2025-01-11', '2025-01-12'];

      const actualDates = stats().days.map((d) => d.date.toISOString().slice(0, 10));
      expect(actualDates).toEqual(expectedDates);
    });

    it('should reactively update when sessions change', () => {
      const start = new Date('2025-01-06');
      const stats = service.getWeeklyStats(start, routine);

      expect(stats().totalMinutes).toBe(0);

      service.addSession({
        date: '2025-01-06',
        exercises: [{ exerciseId: 'e1', completed: true, actualMinutes: 30, bonusMinutes: 0 }],
      });

      expect(stats().totalMinutes).toBe(30);
    });

    it('should return empty minutesByExercise when no sessions', () => {
      const start = new Date('2025-01-06');
      const stats = service.getWeeklyStats(start, routine);

      expect(stats().minutesByExercise.size).toBe(0);
    });

    it('should include sessions with multiple exercises per day', () => {
      const start = new Date('2025-01-06');

      service.addSession({
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 10, bonusMinutes: 0 },
          { exerciseId: 'e2', exerciseName: 'Gammes', completed: true, actualMinutes: 20, bonusMinutes: 0 },
          { exerciseId: 'e3', exerciseName: 'Accords', completed: false, actualMinutes: 5, bonusMinutes: 0 },
        ],
      });

      const stats = service.getWeeklyStats(start, routine);
      expect(stats().totalMinutes).toBe(35);
      expect(stats().minutesByExercise.get('Chromatique')).toBe(10);
      expect(stats().minutesByExercise.get('Gammes')).toBe(20);
      expect(stats().minutesByExercise.get('Accords')).toBe(5);
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
