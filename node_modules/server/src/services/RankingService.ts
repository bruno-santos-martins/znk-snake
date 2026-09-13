import type { MasterRankEntry } from '@znk/shared';

export class RankingService {
  private masters: MasterRankEntry[] = [];

  append(entry: MasterRankEntry): void {
    this.masters.push(entry);
  }

  all(): MasterRankEntry[] {
    return [...this.masters];
  }
}
