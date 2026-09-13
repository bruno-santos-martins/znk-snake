import React from 'react';
import type { GameVictoryPayload } from '@znk/shared';

export const VictoryModal: React.FC<{ victory: GameVictoryPayload | null }> = ({ victory }) => {
  if (!victory) return null;
  return (
    <div className="overlay victory">
      <div className="panel">
        <h2>You are the Master!</h2>
        <p style={{ color: victory.color }}>{victory.name}</p>
        <p>Size: {victory.size} Score: {victory.score} Kills: {victory.kills}</p>
      </div>
    </div>
  );
};
