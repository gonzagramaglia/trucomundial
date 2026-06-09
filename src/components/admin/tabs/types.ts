export interface MatchSummary {
  id: string;
  match_id: string;
  userId: string;
  rivalName: string;
  myScore: number;
  rivalScore: number;
  winner: "player" | "cpu";
  date: string;
  log: any[];
  isTournament?: boolean;
  tournamentId?: string;
  tournamentName?: string;
}

export interface PlayerStats {
  userId: string;
  userName: string;
  email: string;
  totalGames: number;
  wins: number;
  losses: number;
  lastPlayed: string;
  votes?: Record<string, number>;
  createdAt?: string;
}

export interface UserStarsPayload {
  userName: string;
  userEmail: string;
  votes?: Record<string, number>;
}

export interface CreatorApplication {
  id: string;
  user_id: string;
  email: string;
  channel_name: string;
  social_link?: string;
  streaming_link?: string;
  motivation?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: string;
  is_approved: boolean;
  start_time: string;
  organizer: string;
  max_participants: number;
  prize: string[] | string;
  visibility: string;
  code_type: string;
  codes?: string[];
  [key: string]: unknown;
}

export interface Ticket {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  message: string;
  status: "open" | "closed";
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  [key: string]: unknown;
}

export interface UsedCode {
  code: string;
  userId: string;
}
