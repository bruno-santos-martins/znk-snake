import { describe, expect, it, vi } from 'vitest';
import { ColorService } from '../../src/services/ColorService';

describe('player:join contract', () => {
  it('claims reserved color', () => {
    const colorService = new ColorService();
    const reservations = new Map<string, { color: string; playerId: string; expiresAt: number }>();
    const reserved = colorService.reserveColor(reservations, 'socket-1', 2000);
    const claimed = colorService.claimReservedColor(reservations, reserved.reservationId, 'socket-1');
    expect(claimed).toBe(reserved.color);
  });

  it('assigns unique colors for each logged player', () => {
    const colorService = new ColorService();
    const reservations = new Map<string, { color: string; playerId: string; expiresAt: number }>();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const colors = new Set<string>();
    for (let i = 0; i < 60; i += 1) {
      const reserved = colorService.reserveColor(reservations, `socket-${i}`, 2000);
      expect(colors.has(reserved.color)).toBe(false);
      colors.add(reserved.color);
    }

    randomSpy.mockRestore();
  });
});
