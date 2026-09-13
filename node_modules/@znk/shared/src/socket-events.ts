import type { DeathCause, Direction, GameState, MasterRankEntry } from './game.types';

export type PlayerPreparePayload = { name: string; sessionId?: string; preferredColor?: string };
export type PlayerJoinPayload = { name: string; reservationId: string; sessionId?: string };
export type PlayerMovePayload = { direction: Direction; sessionId?: string };
export type PlayerRespawnPayload = { reservationId?: string; sessionId?: string };

export type PlayerColorAssignedPayload = {
  reservationId: string;
  color: string;
  expiresAt: number;
};

export type PlayerJoinedPayload = {
  playerId: string;
  name: string;
  color: string;
  cycleId: number;
};

export type GameStatePayload = {
  state: GameState;
  freeCells: number;
};

export type PlayerDiedPayload = {
  playerId: string;
  cause: DeathCause;
};

export type GameVictoryPayload = {
  playerId: string;
  name: string;
  color: string;
  size: number;
  score: number;
  kills: number;
  freeCells: number;
  cycleId: number;
};

export type GameResetPayload = { cycleId: number };
export type RankUpdatePayload = { masters: MasterRankEntry[] };
export type ServerErrorPayload = { code: string; message: string };
