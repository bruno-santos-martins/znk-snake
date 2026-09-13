import type { Direction } from '@znk/shared';
import { GameService } from '../services/GameService';

export class GameController {
  constructor(private gameService: GameService) {}

  prepare(playerId: string, name: string, preferredColor?: string) {
    return this.gameService.prepare(playerId, name, preferredColor);
  }

  join(playerId: string, name: string, reservationId: string) {
    return this.gameService.join(playerId, name, reservationId);
  }

  respawn(playerId: string) {
    return this.gameService.respawn(playerId);
  }

  move(playerId: string, direction: Direction): void {
    this.gameService.move(playerId, direction);
  }

  disconnect(playerId: string) {
    return this.gameService.disconnect(playerId);
  }

  state() {
    return this.gameService.getState();
  }
}
