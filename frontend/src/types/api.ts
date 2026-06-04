export type MatchStatus = "scheduled" | "live" | "finished";

export interface Match {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  startTime: string;
  endTime: string | null;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface CreateMatchInput {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  endTime: string;
  homeScore?: number;
  awayScore?: number;
}

export interface UpdateScoreInput {
  homeScore: number;
  awayScore: number;
}

export interface Commentary {
  id: number;
  matchId: number;
  minute: number;
  sequence: number;
  period: string;
  eventType: string;
  actor: string;
  team: string;
  message: string;
  metadata: Record<string, any> | null;
  tags: string[];
  createdAt: string;
}

export interface CreateCommentaryInput {
  minute: number;
  sequence: number;
  period: string;
  eventType: string;
  actor?: string;
  team?: string;
  message: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: any;
}
