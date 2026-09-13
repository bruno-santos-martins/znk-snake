import type { Player, Position } from '@znk/shared';
import { ColorService } from './ColorService';
import { SnakeService } from './SnakeService';
import { FoodService } from './FoodService';

export class PlayerService {
  constructor(
    private colorService: ColorService,
    private snakeService: SnakeService,
    private foodService: FoodService
  ) {}

  ensurePlayer(players: Player[], playerId: string, name: string): Player {
    const existing = players.find((p) => p.id === playerId);
    if (existing) {
      existing.name = name;
      return existing;
    }
    const player: Player = {
      id: playerId,
      name,
      color: '#ffffff',
      status: 'prepared',
      score: 0,
      kills: 0,
      reservationId: null,
      reservedAt: null
    };
    players.push(player);
    return player;
  }

  freeCells(width: number, height: number, occupied: Set<string>): Position[] {
    const free: Position[] = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const key = `${x}:${y}`;
        if (!occupied.has(key)) free.push({ x, y });
      }
    }
    return free;
  }

  claimOrReserveColor(reservations: Map<string, { color: string; playerId: string; expiresAt: number }>, playerId: string, reservationId: string): string | null {
    return this.colorService.claimReservedColor(reservations, reservationId, playerId);
  }

  releaseColor(color: string): void {
    this.colorService.releaseColor(color);
  }
}
