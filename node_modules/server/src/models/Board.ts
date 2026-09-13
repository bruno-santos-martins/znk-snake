import type { Board } from '@znk/shared';

export const createBoard = (width: number, height: number): Board => ({
  width,
  height,
  totalCells: width * height,
  snakes: [],
  food: []
});
