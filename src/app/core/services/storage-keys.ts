export const STORAGE_KEYS = {
  EXERCISES: 'instrument_daily_exercises',
  PROGRESS: 'instrument_daily_progress',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
