import type { Snake } from '@znk/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameStateStore } from '../../src/state/GameState';
import { ColorService } from '../../src/services/ColorService';
import { SnakeService } from '../../src/services/SnakeService';
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

afterEach(() => {
  vi.useRealTimers();
});

describe('spawn threshold', () => {
  it('does not spawn food when free cells <= 10', () => {
    const { store, game } = createGame();

    store.state.board.totalCells = 10;
    game.spawnTick();
    expect(store.state.board.food).toHaveLength(0);
  });

  it('spawns a new point only 2s after the previous spawned point is eaten', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const { store, game } = createGame();

    const snake: Snake = {
      id: 'snake_p1',
      playerId: 'p1',
      segments: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ],
      direction: 'right',
      nextDirection: 'right',
      alive: true,
      score: 0
    };

    store.state.board.snakes = [snake];
    store.state.board.food = [
      {
        id: 'f1',
        position: { x: 11, y: 10 },
        origin: 'spawned',
        createdAt: Date.now(),
        value: 1
      }
    ];

    game.tick();
    expect(store.state.board.food).toHaveLength(0);

    game.spawnTick();
    expect(store.state.board.food).toHaveLength(0);

    vi.advanceTimersByTime(1999);
    game.spawnTick();
    expect(store.state.board.food).toHaveLength(0);

    vi.advanceTimersByTime(1);
    game.spawnTick();
    expect(store.state.board.food).toHaveLength(1);
    expect(store.state.board.food[0].origin).toBe('spawned');
  });

  it('spawns player near center with safe space around at join', () => {
    const { store, game } = createGame();

    store.state.board.width = 20;
    store.state.board.height = 20;
    store.state.board.totalCells = 400;

    const reservation = game.prepare('p1', 'Player 1');
    game.join('p1', 'Player 1', reservation.reservationId);

    const snake = store.state.board.snakes.find((s) => s.playerId === 'p1');
    expect(snake).toBeDefined();

    const head = snake!.segments[0];
    expect(Math.abs(head.x - 10) + Math.abs(head.y - 10)).toBeLessThanOrEqual(2);

    const own = new Set(snake!.segments.map((seg) => `${seg.x}:${seg.y}`));
    const occupied = new Set<string>();
    for (const s of store.state.board.snakes) {
      for (const seg of s.segments) occupied.add(`${seg.x}:${seg.y}`);
    }
    for (const f of store.state.board.food) occupied.add(`${f.position.x}:${f.position.y}`);

    for (const seg of snake!.segments) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = seg.x + dx;
          const ny = seg.y + dy;
          expect(nx).toBeGreaterThanOrEqual(0);
          expect(ny).toBeGreaterThanOrEqual(0);
          expect(nx).toBeLessThan(store.state.board.width);
          expect(ny).toBeLessThan(store.state.board.height);

          const key = `${nx}:${ny}`;
          if (!own.has(key)) {
            expect(occupied.has(key)).toBe(false);
          }
        }
      }
    }
  });

  it('keeps player color on respawn', () => {
    const { store, game } = createGame();

    const reservation = game.prepare('p1', 'Player 1');
    const joined = game.join('p1', 'Player 1', reservation.reservationId);
    const initialColor = joined.color;

    const snake = store.state.board.snakes.find((s) => s.playerId === 'p1');
    expect(snake).toBeDefined();

    snake!.segments = [{ x: 0, y: 0 }];
    snake!.direction = 'left';
    snake!.nextDirection = 'left';

    game.tick();

    const respawned = game.respawn('p1');
    expect(respawned.color).toBe(initialColor);
  });
});
