import { DailySession } from './daily-session';

export interface WeekDayStats {
  date: Date;
  totalMinutes: number;
  sessions: DailySession[];
}

export interface WeeklyStats {
  days: WeekDayStats[];
  totalMinutes: number;
  minutesByExercise: Map<string, number>;
  completionRate: number;
}
