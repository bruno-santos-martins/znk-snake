import { describe, expect, it } from 'vitest';
import { FoodService } from '../../src/services/FoodService';

describe('death to food conversion', () => {
  it('converts all segments to food', () => {
    const svc = new FoodService();
    const foods = svc.convertSnakeToFood({ id: 's', playerId: 'p', segments: [{ x: 0, y: 0 }, { x: 1, y: 0 }], direction: 'right', nextDirection: 'right', alive: true, score: 0 });
    expect(foods).toHaveLength(2);
    expect(foods.every((f) => f.origin === 'snake-body')).toBe(true);
  });
});
