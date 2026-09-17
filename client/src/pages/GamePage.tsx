import React from 'react';
import { Board } from '../components/Board';
import { DeathOverlay } from '../components/DeathOverlay';
import { MastersRank } from '../components/MastersRank';
import { PlayerHUD } from '../components/PlayerHUD';
import { VictoryModal } from '../components/VictoryModal';
import { useGameState } from '../hooks/useGameState';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

export const GamePage: React.FC = () => {
  const { state, player, freeCells, activityLog, isDead, respawnCooldownRemainingMs, victory, sendMove, respawn } = useGameState();
  useKeyboardControls(sendMove);

  if (!state || !player) return <p className="loading">Waiting state...</p>;

  return (
    <main className="game-shell">
      <PlayerHUD name={player.name} color={player.color} score={player.score} kills={player.kills} freeCells={freeCells} />
      <Board snakes={state.board.snakes} players={state.players} food={state.board.food} />
      <section className="right-panel">
        <MastersRank masters={state.masters} />
        <section className="rank feed">
          <h3>Battle Log</h3>
          <ul>
            {activityLog.map((line, idx) => (
              <li key={`${line}-${idx}`}>{line}</li>
            ))}
          </ul>
        </section>
        <section className="rank online-players">
          <h3>Players Online</h3>
          <ul>
            {state.players.map((p) => (
              <li key={p.id}>
                <span className="online-dot" style={{ background: p.color }} />
                <span>{p.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>
      <DeathOverlay show={isDead} onRespawn={respawn} cooldownMs={respawnCooldownRemainingMs} />
      <VictoryModal victory={victory} />
    </main>
  );
};
