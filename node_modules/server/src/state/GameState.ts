import type { GameState, MasterRankEntry, Player } from '@znk/shared';
import { createBoard } from '../models/Board';
import { env } from '../config/env';

export class GameStateStore {
  public state: GameState;
  public colorReservations = new Map<string, { color: string; playerId: string; expiresAt: number }>();

  constructor() {
    this.state = {
      board: createBoard(env.BOARD_WIDTH, env.BOARD_HEIGHT),
      players: [],
      masters: [],
      cycleId: 1,
      lastTickAt: Date.now()
    };
  }

  getPlayer(playerId: string): Player | undefined {
    return this.state.players.find((p) => p.id === playerId);
  }

  addMaster(entry: MasterRankEntry): void {
    this.state.masters.push(entry);
  }
}
