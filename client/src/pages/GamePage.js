import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Board } from '../components/Board';
import { DeathOverlay } from '../components/DeathOverlay';
import { MastersRank } from '../components/MastersRank';
import { PlayerHUD } from '../components/PlayerHUD';
import { VictoryModal } from '../components/VictoryModal';
import { useGameState } from '../hooks/useGameState';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
export const GamePage = () => {
    const { state, player, freeCells, isDead, victory, sendMove, respawn } = useGameState();
    useKeyboardControls(sendMove);
    if (!state || !player)
        return _jsx("p", { className: "loading", children: "Waiting state..." });
    return (_jsxs("main", { className: "game-shell", children: [_jsx(PlayerHUD, { name: player.name, color: player.color, score: player.score, kills: player.kills, freeCells: freeCells }), _jsx(Board, { snakes: state.board.snakes, players: state.players, food: state.board.food }), _jsx(MastersRank, { masters: state.masters }), _jsx(DeathOverlay, { show: isDead, onRespawn: respawn }), _jsx(VictoryModal, { victory: victory })] }));
};
