import React from 'react';

export const DeathOverlay: React.FC<{ show: boolean; onRespawn: () => void }> = ({ show, onRespawn }) => {
  if (!show) return null;
  return (
    <div className="overlay">
      <div className="panel">
        <h2>You died</h2>
        <button onClick={onRespawn}>Respawn now</button>
      </div>
    </div>
  );
};
