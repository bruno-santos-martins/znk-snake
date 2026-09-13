import React, { useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import { GamePage } from './pages/GamePage';
import { LobbyPage } from './pages/LobbyPage';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);

  return (
    <GameProvider>
      {started ? <GamePage /> : <LobbyPage onStart={() => setStarted(true)} />}
    </GameProvider>
  );
};

export default App;
