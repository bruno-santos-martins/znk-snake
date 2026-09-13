import { useEffect } from 'react';
import type { Direction } from '../types/game.types';

const MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
};

export const useKeyboardControls = (onMove: (direction: Direction) => void): void => {
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      const dir = MAP[ev.key];
      if (!dir) return;
      ev.preventDefault();
      onMove(dir);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onMove]);
};
