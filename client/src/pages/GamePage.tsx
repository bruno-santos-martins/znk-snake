import React from 'react';
import { Board } from '../components/Board';
import { DeathOverlay } from '../components/DeathOverlay';
import { MastersRank } from '../components/MastersRank';
import { PlayerHUD } from '../components/PlayerHUD';
import { VictoryModal } from '../components/VictoryModal';
import { useGameState } from '../hooks/useGameState';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

export const GamePage: React.FC = () => {
  const { state, player, freeCells, isDead, victory, sendMove, respawn } = useGameState();
  useKeyboardControls(sendMove);

  if (!state || !player) return <p className="loading">Waiting state...</p>;

  return (
    <main className="game-shell">
      <PlayerHUD name={player.name} color={player.color} score={player.score} kills={player.kills} freeCells={freeCells} />
      <Board snakes={state.board.snakes} food={state.board.food} />
      <MastersRank masters={state.masters} />
      <DeathOverlay show={isDead} onRespawn={respawn} />
      <VictoryModal victory={victory} />
    </main>
  );
};
