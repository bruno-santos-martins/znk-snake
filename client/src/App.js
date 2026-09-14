import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import { GamePage } from './pages/GamePage';
import { LobbyPage } from './pages/LobbyPage';
const App = () => {
    const [started, setStarted] = useState(false);
    return (_jsx(GameProvider, { children: started ? _jsx(GamePage, {}) : _jsx(LobbyPage, { onStart: () => setStarted(true) }) }));
};
export default App;
