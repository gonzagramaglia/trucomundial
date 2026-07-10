import type { Card } from "../../data/cards";
export type { Card };

/** Game mode: 1v1, 2v2 (with partner), or online multiplayer. */
export type GameMode = "1v1" | "2v2" | "multiplayer";

/** High-level game state: on the landing screen or actively playing. */
export type GameState = "landing" | "playing";

/** Identifies each seat in a game (local player, CPU opponents, partner). */
export type PlayerRole = "player" | "cpu" | "partner" | "opponent2" | "cpu2";

/** A card that has been played onto the table, with positional and ownership data. */
export interface PlayedCard extends Card {
  rotation?: number;
  x?: number;
  y?: number;
  owner: "player" | "cpu" | "partner" | "opponent2" | "cpu2";
  instanceId?: string;
}

/** Tracks the current truco escalation state (truco → retruco → vale cuatro). */
export interface TrucoState {
  level: number; // 0: none, 1: truco, 2: retruco, 3: vale4
  caller: PlayerRole | null;
  status: "none" | "pending" | "accepted" | "declined" | "finished";
}

/** Tracks the current envido escalation state (envido → real envido → falta envido). */
export interface EnvidoState {
  level: number; // 0: none, 1: envido, 2: envido-envido, 3: real, 4: falta
  caller: PlayerRole | null;
  status: "none" | "pending" | "accepted" | "declined" | "finished";
  prevLevel?: number;
}

/** Represents a pending truco or envido call awaiting a response. */
export interface PendingAction {
  type: "truco" | "envido";
  level: number;
  caller: PlayerRole;
}

/** Current score for both sides of the match. */
export interface Score {
  player: number;
  cpu: number;
}
