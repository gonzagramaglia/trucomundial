export interface Tournament {
  id: string;
  name: string;
  is_approved?: boolean;
  status: "open" | "active" | "finished";
  participants: number;
  max_participants: number;
  start_time: string;
  prize: string[];
  bg_gradient: string;
  winner?: string;
  organizer: string;
  code_type?: string;
  codes?: string[];
  allowed_teams?: string[];
  ranking_snapshot?: Record<string, number> | null;
  description?: string;
  min_participants?: number;
}

export type Registration = { user_id: string; code_used: string };

