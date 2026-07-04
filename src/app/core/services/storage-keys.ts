export const STORAGE_KEYS = {
  EXERCISES: 'instrument_daily_exercises',
  PROGRESS: 'instrument_daily_progress',
  ONBOARDING_COMPLETED: 'instrument_daily_onboarding_completed',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
