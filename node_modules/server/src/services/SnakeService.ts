import type { Direction, Position, Snake } from '@znk/shared';
import { insideBoard, keyOf, samePos } from '../utils/position';

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

export class SnakeService {
  queueDirection(snake: Snake, direction: Direction): void {
    if (OPPOSITE[snake.direction] === direction) return;
    snake.nextDirection = direction;
  }

  nextHead(snake: Snake): Position {
    const head = snake.segments[0];
    const dir = snake.nextDirection;
    if (dir === 'up') return { x: head.x, y: head.y - 1 };
    if (dir === 'down') return { x: head.x, y: head.y + 1 };
    if (dir === 'left') return { x: head.x - 1, y: head.y };
    return { x: head.x + 1, y: head.y };
  }

  move(snake: Snake, nextHead: Position, growBy = 0): void {
    snake.direction = snake.nextDirection;
    snake.segments = [nextHead, ...snake.segments];
    if (growBy <= 0) {
      snake.segments.pop();
    }
  }

  validateInsideBoard(pos: Position, width: number, height: number): boolean {
    return insideBoard(pos, width, height);
  }

  isSelfCollision(snake: Snake, pos: Position): boolean {
    return snake.segments.slice(1).some((seg) => samePos(seg, pos));
  }

  isBodyCollision(otherSnakes: Snake[], selfId: string, pos: Position): boolean {
    return otherSnakes.some((s) => s.id !== selfId && s.segments.some((seg) => samePos(seg, pos)));
  }

  spawnSnake(playerId: string, start: Position[], direction: Direction): Snake {
    return {
      id: `snake_${playerId}`,
      playerId,
      segments: start,
      direction,
      nextDirection: direction,
      alive: true,
      score: 0
    };
  }

  occupiedKeys(snakes: Snake[]): Set<string> {
    const keys = new Set<string>();
    for (const s of snakes) {
      for (const seg of s.segments) keys.add(keyOf(seg));
    }
    return keys;
  }
}
