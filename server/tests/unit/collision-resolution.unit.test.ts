import { describe, expect, it } from 'vitest';
import { SnakeService } from '../../src/services/SnakeService';
import type { Snake } from '@znk/shared';

describe('collision helpers', () => {
  it('detects self collision', () => {
    const svc = new SnakeService();
    const snake: Snake = { id: 's1', playerId: 'p1', segments: [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }], direction: 'right', nextDirection: 'right', alive: true, score: 0 };
    expect(svc.isSelfCollision(snake, { x: 2, y: 2 })).toBe(true);
  });
});
