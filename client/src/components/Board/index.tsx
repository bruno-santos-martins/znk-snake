import React from 'react';
import type { Food, Player, Snake } from '../../types/game.types';
import { FoodDot } from '../FoodDot';
import { SnakeSegment } from '../SnakeSegment';

export const Board: React.FC<{ snakes: Snake[]; players: Player[]; food: Food[] }> = ({ snakes, players, food }) => {
  const playerColors = new Map(players.map((player) => [player.id, player.color]));

  return (
    <div className="board" style={{ width: 800, height: 600 }}>
      {food.map((f) => (
        <FoodDot key={f.id} x={f.position.x} y={f.position.y} />
      ))}
      {snakes.map((snake) =>
        snake.segments.map((seg, i) => (
          <SnakeSegment
            key={`${snake.id}-${i}`}
            x={seg.x}
            y={seg.y}
            isHead={i === 0}
            color={playerColors.get(snake.playerId) ?? '#39ff14'}
          />
        ))
      )}
    </div>
  );
};
