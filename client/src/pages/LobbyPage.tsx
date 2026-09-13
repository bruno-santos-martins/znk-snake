import React, { useState } from 'react';
import { ColorPreview } from '../components/ColorPreview';
import { useGameState } from '../hooks/useGameState';

const COLOR_OPTIONS = [
  '#39ff14', '#ff3131', '#00e5ff', '#ffd60a', '#ff00ff', '#7df9ff', '#ff6ec7',
  '#00ff85', '#ff9f1c', '#b8ff00', '#ff4d6d', '#00bbf9'
];

export const LobbyPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const { reservation, errorMessage, prepare, join } = useGameState();

  return (
    <main className="lobby">
      <h1>ZNK Snake Multiplayer</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <div className="color-picker" role="radiogroup" aria-label="Choose color">
        {COLOR_OPTIONS.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-option${selectedColor === color ? ' selected' : ''}`}
            style={{ background: color }}
            onClick={() => setSelectedColor(color)}
            aria-label={`Choose color ${color}`}
          />
        ))}
      </div>
      {!reservation ? (
        <button onClick={() => prepare(name, selectedColor)} disabled={!name.trim()}>Reserve color</button>
      ) : (
        <>
          <ColorPreview color={reservation.color} />
          <button onClick={() => { join(name); onStart(); }}>Join game</button>
        </>
      )}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
    </main>
  );
};
