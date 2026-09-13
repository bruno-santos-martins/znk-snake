import { describe, expect, it } from 'vitest';
import { SnakeService } from '../../src/services/SnakeService';
import type { Snake } from '@znk/shared';
import { GameStateStore } from '../../src/state/GameState';
import { ColorService } from '../../src/services/ColorService';
import { FoodService } from '../../src/services/FoodService';
import { PlayerService } from '../../src/services/PlayerService';
import { RankingService } from '../../src/services/RankingService';
import { GameService } from '../../src/services/GameService';

const createGame = () => {
  const store = new GameStateStore();
  const color = new ColorService();
  const snake = new SnakeService();
  const food = new FoodService();
  const player = new PlayerService(color, snake, food);
  const rank = new RankingService();
  const game = new GameService(store, color, player, snake, food, rank);
  return { store, game };
};

describe('collision helpers', () => {
  it('detects self collision', () => {
    const svc = new SnakeService();
    const snake: Snake = { id: 's1', playerId: 'p1', segments: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }], direction: 'right', nextDirection: 'right', alive: true, score: 0 };
    expect(svc.isSelfCollision(snake, { x: 2, y: 2 })).toBe(true);
  });

  it('eliminates only the snake whose head hits another snake body', () => {
    const { store, game } = createGame();
    store.state.players = [
      { id: 'p1', name: 'A', color: '#39ff14', status: 'alive', score: 0, kills: 0, reservationId: null, reservedAt: null },
      { id: 'p2', name: 'B', color: '#ff3131', status: 'alive', score: 0, kills: 0, reservationId: null, reservedAt: null }
    ];

    const attacker: Snake = {
      id: 's1',
      playerId: 'p1',
      segments: [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
      direction: 'right',
      nextDirection: 'right',
      alive: true,
      score: 0
    };
    const defender: Snake = {
      id: 's2',
      playerId: 'p2',
      segments: [{ x: 4, y: 4 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      direction: 'right',
      nextDirection: 'right',
      alive: true,
      score: 0
    };

    store.state.board.snakes = [attacker, defender];

    const result = game.tick();
    expect(result.deaths.some((d) => d.playerId === 'p1')).toBe(true);
    expect(result.deaths.some((d) => d.playerId === 'p2')).toBe(false);
  });

  it('keeps the larger snake alive on head-to-head collision', () => {
    const { store, game } = createGame();
    store.state.players = [
      { id: 'p1', name: 'Big', color: '#39ff14', status: 'alive', score: 0, kills: 0, reservationId: null, reservedAt: null },
      { id: 'p2', name: 'Small', color: '#ff3131', status: 'alive', score: 0, kills: 0, reservationId: null, reservedAt: null }
    ];

    const bigger: Snake = {
      id: 's1',
      playerId: 'p1',
      segments: [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }],
      direction: 'right',
      nextDirection: 'right',
      alive: true,
      score: 0
    };
    const smaller: Snake = {
      id: 's2',
      playerId: 'p2',
      segments: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 2 }],
      direction: 'left',
      nextDirection: 'left',
      alive: true,
      score: 0
    };

    store.state.board.snakes = [bigger, smaller];

    const result = game.tick();
    expect(result.deaths.some((d) => d.playerId === 'p2' && d.cause === 'head-to-head')).toBe(true);
    expect(result.deaths.some((d) => d.playerId === 'p1')).toBe(false);
  });
});
