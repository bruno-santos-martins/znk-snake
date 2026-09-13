import React from 'react';

export const PlayerHUD: React.FC<{ name: string; color: string; score: number; kills: number; freeCells: number }> = ({ name, color, score, kills, freeCells }) => {
  return (
    <aside className="hud">
      <h3>{name}</h3>
      <div className="dot" style={{ background: color }} />
      <p>Score: {score}</p>
      <p>Kills: {kills}</p>
      <p>Free cells: {freeCells}</p>
    </aside>
  );
};
