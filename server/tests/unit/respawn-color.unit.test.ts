import { describe, expect, it } from 'vitest';
import { ColorService } from '../../src/services/ColorService';
import { FoodService } from '../../src/services/FoodService';
import { GameService } from '../../src/services/GameService';
import { PlayerService } from '../../src/services/PlayerService';
import { RankingService } from '../../src/services/RankingService';
import { SnakeService } from '../../src/services/SnakeService';
import { GameStateStore } from '../../src/state/GameState';

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

describe('respawn color', () => {
  it('keeps the originally chosen color after death and respawn', () => {
    const { store, game } = createGame();
    const chosenColor = '#ff3131';

    const reservation = game.prepare('p1', 'Player 1', chosenColor);
    const joined = game.join('p1', 'Player 1', reservation.reservationId);
    expect(joined.color).toBe(chosenColor);

    const snake = store.state.board.snakes.find((s) => s.playerId === 'p1');
    expect(snake).toBeTruthy();
    if (!snake) return;

    snake.segments = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 }
    ];
    snake.direction = 'up';
    snake.nextDirection = 'up';

    game.tick();

    const deadPlayer = store.getPlayer('p1');
    expect(deadPlayer?.status).toBe('dead');
    expect(deadPlayer?.color).toBe(chosenColor);

    const respawned = game.respawn('p1');
    expect(respawned.status).toBe('alive');
    expect(respawned.color).toBe(chosenColor);
  });
});
