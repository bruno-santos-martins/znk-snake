import React from 'react';
import type { MasterRankEntry } from '../../types/game.types';

export const MastersRank: React.FC<{ masters: MasterRankEntry[] }> = ({ masters }) => {
  return (
    <section className="rank">
      <h3>Masters</h3>
      <ul>
        {masters.map((m, i) => (
          <li key={`${m.name}-${m.date}-${i}`}>
            <span style={{ color: m.color }}>{m.name}</span> size {m.size} score {m.score} kills {m.kills}
          </li>
        ))}
      </ul>
    </section>
  );
};
