import { describe, expect, it } from 'vitest';
import { GameStateStore } from '../../src/state/GameState';
import { ColorService } from '../../src/services/ColorService';
import { SnakeService } from '../../src/services/SnakeService';
import { FoodService } from '../../src/services/FoodService';
import { PlayerService } from '../../src/services/PlayerService';
import { RankingService } from '../../src/services/RankingService';
import { GameService } from '../../src/services/GameService';

describe('evaluateVictory', () => {
  it('returns winner when one snake alive and free cells in 6..10', () => {
    const store = new GameStateStore();
    const color = new ColorService();
    const snake = new SnakeService();
    const food = new FoodService();
    const player = new PlayerService(color, snake, food);
    const rank = new RankingService();
    const game = new GameService(store, color, player, snake, food, rank);

    store.state.players.push({ id: 'p1', name: 'A', color: '#fff', status: 'alive', score: 1, kills: 0, reservationId: null, reservedAt: null });
    store.state.board.totalCells = 20;
    store.state.board.snakes.push({ id: 's1', playerId: 'p1', segments: Array.from({ length: 10 }, (_, i) => ({ x: i, y: 0 })), direction: 'right', nextDirection: 'right', alive: true, score: 1 });
    store.state.board.food = Array.from({ length: 4 }, (_, i) => ({ id: `f${i}`, position: { x: i, y: 1 }, origin: 'spawned', createdAt: Date.now(), value: 1 }));

    const v = game.evaluateVictory();
    expect(v?.winnerPlayerId).toBe('p1');
  });
});
