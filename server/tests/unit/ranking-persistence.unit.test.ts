import { describe, expect, it } from 'vitest';
import { RankingService } from '../../src/services/RankingService';

describe('ranking persistence', () => {
  it('retains entries in memory', () => {
    const rank = new RankingService();
    rank.append({ name: 'A', color: '#f00', size: 10, score: 8, kills: 2, date: Date.now(), cycleId: 1 });
    expect(rank.all()).toHaveLength(1);
  });
});
