export interface DailySession {
  date: string; // ISO date 'YYYY-MM-DD'
  exercises: {
    exerciseId: string;
    completed: boolean;
    actualMinutes: number;
  }[];
}
