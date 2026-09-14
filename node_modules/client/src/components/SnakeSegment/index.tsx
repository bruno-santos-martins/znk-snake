import React from 'react';

export const SnakeSegment: React.FC<{ x: number; y: number; isHead: boolean; color: string }> = ({ x, y, isHead, color }) => {
  return (
    <div
      className={isHead ? 'snake head' : 'snake'}
      style={{
        left: x * 10,
        top: y * 10,
        background: color,
        filter: isHead ? 'brightness(1.15)' : undefined
      }}
    />
  );
};
