import { describe, expect, it } from 'vitest';
import { SnakeService } from '../../src/services/SnakeService';

describe('snake movement', () => {
  it('prevents immediate opposite reversal', () => {
    const svc = new SnakeService();
    const snake = { id: 's', playerId: 'p', segments: [{ x: 1, y: 1 }], direction: 'right', nextDirection: 'right', alive: true, score: 0 } as const;
    const mutable = { ...snake, segments: [...snake.segments] };
    svc.queueDirection(mutable, 'left');
    expect(mutable.nextDirection).toBe('right');
  });
});
