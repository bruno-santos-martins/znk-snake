import type { Food, Position, Snake } from '@znk/shared';
import { keyOf } from '../utils/position';
import { randomInt } from '../utils/random';

export class FoodService {
  spawnFood(freePositions: Position[], origin: Food['origin'] = 'spawned', value = 1): Food | null {
    if (freePositions.length === 0) return null;
    const pos = freePositions[randomInt(0, freePositions.length - 1)];
    return {
      id: `food_${Math.random().toString(36).slice(2, 10)}`,
      position: pos,
      origin,
      createdAt: Date.now(),
      value
    };
  }

  convertSnakeToFood(snake: Snake): Food[] {
    return snake.segments.map((segment) => ({
      id: `food_${Math.random().toString(36).slice(2, 10)}`,
      position: segment,
      origin: 'snake-body',
      createdAt: Date.now(),
      value: 1
    }));
  }

  removeOldestFoodsForSpace(food: Food[], occupiedSnakeKeys: Set<string>, neededCells: number): Food[] {
    const sorted = [...food].sort((a, b) => a.createdAt - b.createdAt);
    const remaining = [...food];
    let freed = 0;
    for (const candidate of sorted) {
      if (freed >= neededCells) break;
      if (!occupiedSnakeKeys.has(keyOf(candidate.position))) {
        const idx = remaining.findIndex((f) => f.id === candidate.id);
        if (idx >= 0) {
          remaining.splice(idx, 1);
          freed += 1;
        }
      }
    }
    return remaining;
  }
}
