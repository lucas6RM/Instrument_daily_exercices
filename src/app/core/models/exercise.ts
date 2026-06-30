export interface Exercise {
  id: string;
  name: string;
  durationSeconds: number;
  youtubeUrl?: string;
  description?: string;
  order: number;
}
