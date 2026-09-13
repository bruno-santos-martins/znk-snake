import type { Position } from '@znk/shared';

export const keyOf = (p: Position): string => `${p.x}:${p.y}`;

export const samePos = (a: Position, b: Position): boolean => a.x === b.x && a.y === b.y;

export const insideBoard = (p: Position, width: number, height: number): boolean => {
  return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
};
