import React, { useState } from 'react';
import { ColorPreview } from '../components/ColorPreview';
import { useGameState } from '../hooks/useGameState';

export const LobbyPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [name, setName] = useState('');
  const { reservation, prepare, join } = useGameState();

  return (
    <main className="lobby">
      <h1>ZNK Snake Multiplayer</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      {!reservation ? (
        <button onClick={() => prepare(name)} disabled={!name.trim()}>Reserve color</button>
      ) : (
        <>
          <ColorPreview color={reservation.color} />
          <button onClick={() => { join(name); onStart(); }}>Join game</button>
        </>
      )}
    </main>
  );
};
