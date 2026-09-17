import type { DeathCause, Direction, Food, GameState, Player, Position, Snake, VictoryResult } from '@znk/shared';
import { env } from '../config/env';
import { GameStateStore } from '../state/GameState';
import { ColorService } from './ColorService';
import { FoodService } from './FoodService';
import { PlayerService } from './PlayerService';
import { RankingService } from './RankingService';
import { SnakeService } from './SnakeService';
import { keyOf, samePos } from '../utils/position';

export class GameService {
  private nextSpawnedFoodAt = 0;
  private respawnCooldownUntilByPlayerId = new Map<string, number>();

  constructor(
    private store: GameStateStore,
    private colorService: ColorService,
    private playerService: PlayerService,
    private snakeService: SnakeService,
    private foodService: FoodService,
    private rankingService: RankingService
  ) {}

  getState(): GameState {
    this.store.state.masters = this.rankingService.all();
    return this.store.state;
  }

  prepare(playerId: string, name: string, preferredColor?: string): { reservationId: string; color: string; expiresAt: number } {
    const p = this.playerService.ensurePlayer(this.store.state.players, playerId, name);
    const reservation = this.colorService.reserveColor(this.store.colorReservations, playerId, env.RESERVATION_TTL_MS, {
      preferredColor
    });
    p.reservationId = reservation.reservationId;
    p.reservedAt = Date.now();
    p.status = 'prepared';
    return reservation;
  }

  join(playerId: string, name: string, reservationId: string): Player {
    const player = this.playerService.ensurePlayer(this.store.state.players, playerId, name);
    const color = this.playerService.claimOrReserveColor(this.store.colorReservations, playerId, reservationId);
    if (!color) throw new Error('Invalid or expired reservation');
    player.color = color;
    player.status = 'alive';
    this.spawnOrRespawn(player);
    return player;
  }

  respawn(playerId: string): Player {
    const player = this.store.getPlayer(playerId);
    if (!player) throw new Error('Player not found');
    const now = Date.now();
    const cooldownUntil = this.respawnCooldownUntilByPlayerId.get(playerId) ?? 0;
    if (now < cooldownUntil) {
      const waitMs = cooldownUntil - now;
      throw new Error(`Respawn cooldown active for ${waitMs}ms`);
    }
    // Preserve the original chosen color between deaths within the same cycle.
    player.status = 'alive';
    this.spawnOrRespawn(player);
    this.respawnCooldownUntilByPlayerId.set(playerId, now + env.RESPAWN_COOLDOWN_MS);
    return player;
  }

  move(playerId: string, direction: Direction): void {
    const snake = this.findSnakeByPlayerId(playerId);
    if (!snake || !snake.alive) return;
    this.snakeService.queueDirection(snake, direction);
  }

  disconnect(playerId: string): { died: boolean } {
    const player = this.store.getPlayer(playerId);
    if (!player) return { died: false };
    const snake = this.findSnakeByPlayerId(playerId);
    if (snake && snake.alive) {
      this.killSnake(snake, 'disconnect');
      player.status = 'disconnected';
      this.playerService.releaseColor(player.color);
      this.store.state.players = this.store.state.players.filter((p) => p.id !== playerId);
      return { died: true };
    }
    this.store.state.players = this.store.state.players.filter((p) => p.id !== playerId);
    return { died: false };
  }

  tick(): { deaths: { playerId: string; cause: DeathCause; killerPlayerId?: string }[]; victory: VictoryResult | null; reset: boolean } {
    this.colorService.expireReservations(this.store.colorReservations);
    const state = this.store.state;
    const aliveSnakes = state.board.snakes.filter((s) => s.alive);
    const snapshotHeads = new Map<string, Position>();
    for (const snake of aliveSnakes) snapshotHeads.set(snake.id, this.snakeService.nextHead(snake));

    const deaths: { playerId: string; cause: DeathCause; killerPlayerId?: string }[] = [];
    const killed = new Set<string>();

    for (const snake of aliveSnakes) {
      const next = snapshotHeads.get(snake.id)!;
      if (!this.snakeService.validateInsideBoard(next, state.board.width, state.board.height)) {
        killed.add(snake.id);
        deaths.push({ playerId: snake.playerId, cause: 'wall' });
      } else if (this.snakeService.isSelfCollision(snake, next)) {
        killed.add(snake.id);
        deaths.push({ playerId: snake.playerId, cause: 'self' });
      }
    }

    // Body collision check against snapshot bodies.
    for (const snake of aliveSnakes) {
      if (killed.has(snake.id)) continue;
      const next = snapshotHeads.get(snake.id)!;
      const others = aliveSnakes.filter((s) => s.id !== snake.id);
      const killer = others.find((s) => s.segments.some((seg) => samePos(seg, next)));
      if (killer) {
        killed.add(snake.id);
        deaths.push({ playerId: snake.playerId, cause: 'enemy-body', killerPlayerId: killer.playerId });
      }
    }

    // Head-to-head simultaneous collisions.
    for (let i = 0; i < aliveSnakes.length; i += 1) {
      for (let j = i + 1; j < aliveSnakes.length; j += 1) {
        const a = aliveSnakes[i];
        const b = aliveSnakes[j];
        if (killed.has(a.id) || killed.has(b.id)) continue;
        const na = snapshotHeads.get(a.id)!;
        const nb = snapshotHeads.get(b.id)!;
        if (samePos(na, nb)) {
          const aSize = a.segments.length;
          const bSize = b.segments.length;

          if (aSize === bSize) {
            deaths.push({ playerId: a.playerId, cause: 'head-to-head' });
            deaths.push({ playerId: b.playerId, cause: 'head-to-head' });
            killed.add(a.id);
            killed.add(b.id);
            continue;
          }

          const loser = aSize > bSize ? b : a;
          const winner = aSize > bSize ? a : b;
          deaths.push({ playerId: loser.playerId, cause: 'head-to-head', killerPlayerId: winner.playerId });
          killed.add(loser.id);
        }
      }
    }

    for (const death of deaths) {
      if (!death.killerPlayerId) continue;
      const killer = this.store.getPlayer(death.killerPlayerId);
      if (killer) killer.kills += 1;
    }

    const foodMap = new Map(state.board.food.map((f) => [keyOf(f.position), f]));

    for (const snake of aliveSnakes) {
      if (killed.has(snake.id)) continue;
      const next = snapshotHeads.get(snake.id)!;
      const food = foodMap.get(keyOf(next));
      if (food) {
        this.snakeService.move(snake, next, food.value);
        snake.score += food.value;
        const player = this.store.getPlayer(snake.playerId);
        if (player) player.score += food.value;
        state.board.food = state.board.food.filter((f) => f.id !== food.id);
        if (food.origin === 'spawned') {
          this.nextSpawnedFoodAt = Date.now() + env.FOOD_RESPAWN_MS;
        }
      } else {
        this.snakeService.move(snake, next, 0);
      }
    }

    for (const snake of aliveSnakes) {
      if (!killed.has(snake.id)) continue;
      this.killSnake(snake, 'enemy-body');
    }

    state.lastTickAt = Date.now();
    const victory = this.evaluateVictory();
    let reset = false;
    if (victory) {
      this.registerVictory(victory);
      this.resetCycle();
      reset = true;
    }

    return { deaths, victory, reset };
  }

  spawnTick(): void {
    const now = Date.now();
    const hasSpawnedFoodOnBoard = this.store.state.board.food.some((f) => f.origin === 'spawned');
    if (hasSpawnedFoodOnBoard || now < this.nextSpawnedFoodAt) return;

    const free = this.freeCellsCount();
    if (free <= 10) return;
    const occupied = this.currentOccupied();
    const freePos = this.playerService.freeCells(this.store.state.board.width, this.store.state.board.height, occupied);
    const food = this.foodService.spawnFood(freePos, 'spawned', 1);
    if (food) this.store.state.board.food.push(food);
  }

  freeCellsCount(): number {
    const snakeCells = this.store.state.board.snakes.reduce((acc, s) => acc + s.segments.length, 0);
    const foodCells = this.store.state.board.food.length;
    return this.store.state.board.totalCells - snakeCells - foodCells;
  }

  evaluateVictory(): VictoryResult | null {
    const alive = this.store.state.board.snakes.filter((s) => s.alive);
    if (alive.length !== 1) return null;
    const freeCells = this.freeCellsCount();
    if (freeCells < 6 || freeCells > 10) return null;
    const winner = alive[0];
    const player = this.store.getPlayer(winner.playerId);
    return {
      winnerPlayerId: winner.playerId,
      freeCells,
      snakeSize: winner.segments.length,
      score: player?.score ?? winner.score,
      kills: player?.kills ?? 0
    };
  }

  private registerVictory(v: VictoryResult): void {
    const p = this.store.getPlayer(v.winnerPlayerId);
    if (!p) return;
    this.rankingService.append({
      name: p.name,
      color: p.color,
      size: v.snakeSize,
      score: v.score,
      kills: v.kills,
      date: Date.now(),
      cycleId: this.store.state.cycleId
    });
  }

  private resetCycle(): void {
    this.store.state.board.snakes = [];
    this.store.state.board.food = [];
    this.store.state.cycleId += 1;
    for (const p of this.store.state.players) {
      p.status = 'dead';
      this.playerService.releaseColor(p.color);
    }
  }

  private spawnOrRespawn(player: Player): void {
    this.store.state.board.snakes = this.store.state.board.snakes.filter((s) => s.playerId !== player.id);

    const required = 3;
    let occupied = this.currentOccupied();
    let freeCells = this.playerService.freeCells(this.store.state.board.width, this.store.state.board.height, occupied);

    if (freeCells.length < required) {
      const snakeKeys = this.snakeService.occupiedKeys(this.store.state.board.snakes);
      this.store.state.board.food = this.foodService.removeOldestFoodsForSpace(this.store.state.board.food, snakeKeys, required - freeCells.length);
      occupied = this.currentOccupied();
      freeCells = this.playerService.freeCells(this.store.state.board.width, this.store.state.board.height, occupied);
    }

    if (freeCells.length < required) throw new Error('Unable to spawn snake immediately');

    const spawn = this.findSpawnLine(occupied);
    if (!spawn) throw new Error('Unable to find contiguous spawn line');

    const snake = this.snakeService.spawnSnake(player.id, spawn.segments, spawn.direction);
    this.store.state.board.snakes.push(snake);
  }

  private findSpawnLine(occupied: Set<string>): { segments: Position[]; direction: Direction } | null {
    const width = this.store.state.board.width;
    const height = this.store.state.board.height;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    const isFree = (x: number, y: number): boolean => !occupied.has(`${x}:${y}`);
    const candidates: { segments: Position[]; direction: Direction }[] = [];

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        // Move right: body must be on the left of head.
        if (x >= 2 && isFree(x, y) && isFree(x - 1, y) && isFree(x - 2, y)) {
          candidates.push({
            segments: [
              { x, y },
              { x: x - 1, y },
              { x: x - 2, y }
            ],
            direction: 'right'
          });
        }

        // Move left: body must be on the right of head.
        if (x <= width - 3 && isFree(x, y) && isFree(x + 1, y) && isFree(x + 2, y)) {
          candidates.push({
            segments: [
              { x, y },
              { x: x + 1, y },
              { x: x + 2, y }
            ],
            direction: 'left'
          });
        }

        // Move down: body must be above head.
        if (y >= 2 && isFree(x, y) && isFree(x, y - 1) && isFree(x, y - 2)) {
          candidates.push({
            segments: [
              { x, y },
              { x, y: y - 1 },
              { x, y: y - 2 }
            ],
            direction: 'down'
          });
        }

        // Move up: body must be below head.
        if (y <= height - 3 && isFree(x, y) && isFree(x, y + 1) && isFree(x, y + 2)) {
          candidates.push({
            segments: [
              { x, y },
              { x, y: y + 1 },
              { x, y: y + 2 }
            ],
            direction: 'up'
          });
        }
      }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
      const ah = a.segments[0];
      const bh = b.segments[0];
      const da = Math.abs(ah.x - centerX) + Math.abs(ah.y - centerY);
      const db = Math.abs(bh.x - centerX) + Math.abs(bh.y - centerY);
      return da - db;
    });

    const safest = candidates.find((candidate) => this.isSpawnAreaSafe(candidate.segments, occupied, width, height));
    if (safest) return safest;

    return candidates[0];
  }

  private isSpawnAreaSafe(segments: Position[], occupied: Set<string>, width: number, height: number): boolean {
    const own = new Set(segments.map((p) => keyOf(p)));

    for (const segment of segments) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = segment.x + dx;
          const ny = segment.y + dy;

          // Keep one-cell breathing room from borders and existing obstacles.
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return false;

          const k = `${nx}:${ny}`;
          if (occupied.has(k) && !own.has(k)) return false;
        }
      }
    }

    return true;
  }

  private currentOccupied(): Set<string> {
    const occupied = new Set<string>();
    for (const snake of this.store.state.board.snakes) {
      for (const seg of snake.segments) occupied.add(keyOf(seg));
    }
    for (const f of this.store.state.board.food) occupied.add(keyOf(f.position));
    return occupied;
  }

  private findSnakeByPlayerId(playerId: string): Snake | undefined {
    return this.store.state.board.snakes.find((s) => s.playerId === playerId);
  }

  private killSnake(snake: Snake, _cause: DeathCause): void {
    snake.alive = false;
    const foods = this.foodService.convertSnakeToFood(snake);
    this.store.state.board.food.push(...foods);
    const player = this.store.getPlayer(snake.playerId);
    if (player) {
      player.status = 'dead';
    }
    this.store.state.board.snakes = this.store.state.board.snakes.filter((s) => s.id !== snake.id);
  }
}
