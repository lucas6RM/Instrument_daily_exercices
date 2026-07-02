export interface DailySession {
  date: string; // ISO date 'YYYY-MM-DD'
  exercises: {
    exerciseId: string;
    exerciseName?: string; // snapshot du nom (optionnel pour compatibilité)
    completed: boolean;
    actualMinutes: number; // durée de la dernière session
    bonusMinutes: number; // cumul des replays (F8)
  }[];
}
