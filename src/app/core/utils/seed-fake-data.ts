import { Exercise } from '../models/exercise';
import { DailySession, ProgressState } from '../models';
import { STORAGE_KEYS } from '../services/storage-keys';

export const seedFakeData = (): void => {
  const exercises: Exercise[] = [
    {
      id: 'ex-blues-major',
      name: 'Gamme blues',
      durationMinutes: 15,
      description: 'Sur une tonalité choisie',
      order: 0,
    },
    {
      id: 'ex-ii-vi-minor',
      name: '2-5-1 mineur',
      durationMinutes: 15,
      description: 'Sur le cycle des quintes',
      order: 1,
    },
    {
      id: 'ex-some-other-time',
      name: 'Some Other Time',
      durationMinutes: 15,
      youtubeUrl: 'https://youtu.be/kpx36aAlmc8?si=VhUjhYnC9D3hhU7x',
      description: 'Standard de jazz',
      order: 2,
    },
    {
      id: 'ex-impro-libre',
      name: 'Improvisation libre',
      durationMinutes: 15,
      order: 3,
    },
  ];

  const dateStr = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const firstSet = [
    { exerciseId: 'ex-blues-major', exerciseName: 'Gamme blues', durationMinutes: 15 },
    { exerciseId: 'ex-some-other-time', exerciseName: 'Some Other Time', durationMinutes: 15 },
    { exerciseId: 'ex-impro-libre', exerciseName: 'Improvisation libre', durationMinutes: 15 },
  ];

  const secondSet = [
    { exerciseId: 'ex-blues-major', exerciseName: 'Gamme blues', durationMinutes: 15 },
    { exerciseId: 'ex-ii-vi-minor', exerciseName: '2-5-1 mineur', durationMinutes: 15 },
    { exerciseId: 'ex-some-other-time', exerciseName: 'Some Other Time', durationMinutes: 15 },
    { exerciseId: 'ex-impro-libre', exerciseName: 'Improvisation libre', durationMinutes: 15 },
  ];

  const completionPattern: Record<number, boolean[]> = {
    14: [true, true, true],
    13: [true, true, false],
    12: [true, true, true],
    11: [true, false, false],
    10: [true, true, true],
    9: [true, true, true],
    8: [true, true, false],
    7: [true, true, true],
    6: [true, true, true, true],
    5: [true, true, true, false],
    4: [true, true, true, true],
    3: [true, false, true, true],
    2: [true, true, true, true],
    1: [true, true, false, false],
    0: [true, false, false, false],
  };

  const bonusPattern: Record<number, number[]> = {
    14: [0, 15, 0],
    13: [15, 0, 0],
    12: [0, 0, 15],
    11: [0, 0, 0],
    10: [15, 15, 0],
    9: [0, 0, 0],
    8: [0, 15, 0],
    7: [15, 0, 15],
    6: [0, 15, 0, 15],
    5: [15, 0, 15, 0],
    4: [0, 0, 0, 0],
    3: [0, 0, 15, 0],
    2: [15, 15, 0, 15],
    1: [0, 0, 0, 0],
    0: [0, 0, 0, 0],
  };

  const dailySessions: DailySession[] = [];

  for (let offset = 14; offset >= 0; offset--) {
    const isSecondSet = offset <= 6;
    const set = isSecondSet ? secondSet : firstSet;
    const completed = completionPattern[offset];
    const bonuses = bonusPattern[offset];

    dailySessions.push({
      date: dateStr(offset),
      exercises: set.map((ex, i) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        completed: completed[i],
        actualMinutes: completed[i] ? ex.durationMinutes : 0,
        bonusMinutes: bonuses[i] ?? 0,
      })),
    });
  }

  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify({ dailySessions } as ProgressState));
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');

  console.log(`✅ Fake data seeded: ${exercises.length} exercises, ${dailySessions.length} days`);
};
