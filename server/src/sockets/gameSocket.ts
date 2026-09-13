import type { Server } from 'socket.io';
import type { Direction, GameVictoryPayload, PlayerDiedPayload, PlayerJoinPayload, PlayerMovePayload, PlayerPreparePayload, PlayerRespawnPayload } from '@znk/shared';
import { GameController } from '../controllers/GameController';

export const registerGameSocket = (io: Server, controller: GameController, tickFn: () => void): void => {
  io.on('connection', (socket) => {
    const resolvePlayerId = (sessionId?: string): string => {
      const normalized = typeof sessionId === 'string' ? sessionId.trim() : '';
      const playerId = normalized.length > 0 ? normalized : socket.id;
      socket.data.playerId = playerId;
      return playerId;
    };

    const emitState = () => {
      const state = controller.state();
      const snakeCells = state.board.snakes.reduce((acc, s) => acc + s.segments.length, 0);
      const freeCells = state.board.totalCells - snakeCells - state.board.food.length;
      io.emit('game:state', { state, freeCells });
    };

    socket.on('player:prepare', (payload: PlayerPreparePayload) => {
      try {
        const playerId = resolvePlayerId(payload.sessionId);
        const result = controller.prepare(playerId, payload.name);
        socket.emit('player:colorAssigned', result);
      } catch (err) {
        socket.emit('server:error', { code: 'PREPARE_FAILED', message: String(err) });
      }
    });

    socket.on('player:join', (payload: PlayerJoinPayload) => {
      try {
        const playerId = resolvePlayerId(payload.sessionId);
        const player = controller.join(playerId, payload.name, payload.reservationId);
        socket.emit('player:joined', {
          playerId: player.id,
          name: player.name,
          color: player.color,
          cycleId: controller.state().cycleId
        });
        emitState();
      } catch (err) {
        socket.emit('server:error', { code: 'JOIN_FAILED', message: String(err) });
      }
    });

    socket.on('player:respawn', (payload: PlayerRespawnPayload) => {
      try {
        const playerId = resolvePlayerId(payload.sessionId ?? socket.data.playerId);
        const player = controller.respawn(playerId);
        socket.emit('player:joined', {
          playerId: player.id,
          name: player.name,
          color: player.color,
          cycleId: controller.state().cycleId
        });
        emitState();
      } catch (err) {
        socket.emit('server:error', { code: 'RESPAWN_FAILED', message: String(err) });
      }
    });

    socket.on('player:move', (payload: PlayerMovePayload) => {
      const playerId = resolvePlayerId(payload.sessionId ?? socket.data.playerId);
      controller.move(playerId, payload.direction as Direction);
    });

    socket.on('disconnect', () => {
      const playerId = String(socket.data.playerId ?? socket.id);
      const died = controller.disconnect(playerId);
      if (died.died) {
        const ev: PlayerDiedPayload = { playerId, cause: 'disconnect' };
        io.emit('player:died', ev);
      }
      emitState();
    });

    emitState();

    const ticker = setInterval(() => {
      tickFn();
      emitState();
    }, 150);

    socket.on('disconnect', () => clearInterval(ticker));
  });
};

export const emitTickEvents = (
  io: Server,
  deaths: PlayerDiedPayload[],
  victory: GameVictoryPayload | null,
  cycleId: number
): void => {
  for (const death of deaths) io.emit('player:died', death);
  if (victory) {
    io.emit('game:victory', victory);
    io.emit('rank:update', { masters: [victory] });
    io.emit('game:reset', { cycleId });
  }
};
