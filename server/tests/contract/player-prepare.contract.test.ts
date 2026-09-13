import { describe, expect, it } from 'vitest';
import { ColorService } from '../../src/services/ColorService';

describe('player:prepare contract', () => {
  it('returns reservationId, color, expiresAt', () => {
    const colorService = new ColorService();
    const reservations = new Map<string, { color: string; playerId: string; expiresAt: number }>();
    const result = colorService.reserveColor(reservations, 'p1', 1000);
    expect(result.reservationId).toContain('res_');
    expect(typeof result.color).toBe('string');
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });
});
