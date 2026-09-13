import { nowMs } from '../utils/time';

const BASE_COLORS = [
  '#39ff14', '#ff3131', '#00e5ff', '#ffd60a', '#ff00ff', '#7df9ff', '#ff6ec7',
  '#00ff85', '#ff9f1c', '#b8ff00', '#ff4d6d', '#00bbf9', '#f15bb5', '#9b5de5',
  '#fee440', '#00f5d4', '#fb5607', '#8338ec', '#3a86ff', '#06ffa5'
];

export class ColorService {
  private activeColors = new Set<string>();

  reserveColor(
    reservations: Map<string, { color: string; playerId: string; expiresAt: number }>,
    playerId: string,
    ttlMs: number,
    options?: { excludeColors?: string[] }
  ): { reservationId: string; color: string; expiresAt: number } {
    const excluded = new Set(options?.excludeColors ?? []);
    const color = this.pickColor(excluded);
    const reservationId = `res_${playerId}_${Math.random().toString(36).slice(2, 9)}`;
    const expiresAt = nowMs() + ttlMs;
    this.activeColors.add(color);
    reservations.set(reservationId, { color, playerId, expiresAt });
    return { reservationId, color, expiresAt };
  }

  claimReservedColor(reservations: Map<string, { color: string; playerId: string; expiresAt: number }>, reservationId: string, playerId: string): string | null {
    const reservation = reservations.get(reservationId);
    if (!reservation || reservation.playerId !== playerId || reservation.expiresAt < nowMs()) {
      return null;
    }
    reservations.delete(reservationId);
    return reservation.color;
  }

  releaseColor(color: string): void {
    this.activeColors.delete(color);
  }

  expireReservations(reservations: Map<string, { color: string; playerId: string; expiresAt: number }>): void {
    const now = nowMs();
    for (const [id, res] of reservations.entries()) {
      if (res.expiresAt <= now) {
        this.activeColors.delete(res.color);
        reservations.delete(id);
      }
    }
  }

  private pickColor(excluded: Set<string>): string {
    for (const c of BASE_COLORS) {
      if (!this.activeColors.has(c) && !excluded.has(c)) return c;
    }

    for (let i = 0; i < 360; i += 17) {
      const candidate = `hsl(${i} 100% 55%)`;
      if (!this.activeColors.has(candidate) && !excluded.has(candidate)) return candidate;
    }

    const startHue = Math.floor(Math.random() * 360);
    for (let offset = 0; offset < 360; offset += 1) {
      const hue = (startHue + offset) % 360;
      const candidate = `hsl(${hue} 100% 55%)`;
      if (!this.activeColors.has(candidate) && !excluded.has(candidate)) return candidate;
    }

    // Defensive fallback: include lightness variation if every hue is exhausted.
    let lightness = 40;
    while (lightness <= 70) {
      for (let hue = 0; hue < 360; hue += 1) {
        const candidate = `hsl(${hue} 100% ${lightness}%)`;
        if (!this.activeColors.has(candidate) && !excluded.has(candidate)) return candidate;
      }
      lightness += 5;
    }

    return `hsl(${Date.now() % 360} 100% 50%)`;
  }
}
