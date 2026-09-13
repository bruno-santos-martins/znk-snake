import React from 'react';

export const FoodDot: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return <div className="food" style={{ left: x * 10, top: y * 10 }} title="ratinho" />;
};
