import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Direction, GameState, GameVictoryPayload, Player, PlayerColorAssignedPayload } from '@znk/shared';
import { useSocket } from '../hooks/useSocket';

const SESSION_STORAGE_KEY = 'znk.sessionId';

const ensureSessionId = (): string => {
  const current = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (current && current.trim().length > 0) return current;
  const next = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
};

type Ctx = {
  player: Player | null;
  state: GameState | null;
  freeCells: number;
  reservation: PlayerColorAssignedPayload | null;
  errorMessage: string | null;
  victory: GameVictoryPayload | null;
  isDead: boolean;
  prepare: (name: string, preferredColor?: string) => void;
  join: (name: string) => void;
  respawn: () => void;
  sendMove: (direction: Direction) => void;
};

const GameContext = createContext<Ctx | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = useSocket();
  const [sessionId] = useState<string>(() => ensureSessionId());
  const [player, setPlayer] = useState<Player | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [state, setState] = useState<GameState | null>(null);
  const [freeCells, setFreeCells] = useState(0);
  const [reservation, setReservation] = useState<PlayerColorAssignedPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [victory, setVictory] = useState<GameVictoryPayload | null>(null);

  useEffect(() => {
    socket.on('player:colorAssigned', (payload: PlayerColorAssignedPayload) => {
      setReservation(payload);
      setErrorMessage(null);
    });
    socket.on('player:joined', (payload: { playerId: string; name: string; color: string }) => {
      setPlayer((prev) => ({
        id: payload.playerId,
        name: payload.name,
        color: payload.color,
        status: 'alive',
        score: prev?.score ?? 0,
        kills: prev?.kills ?? 0,
        reservationId: null,
        reservedAt: null
      }));
    });
    socket.on('game:state', (payload: { state: GameState; freeCells: number }) => {
      setState(payload.state);
      setFreeCells(payload.freeCells);
      setPlayer((prev) => {
        if (!prev) return prev;
        const updated = payload.state.players.find((p) => p.id === prev.id) ?? null;
        return updated ?? prev;
      });
    });
    socket.on('game:victory', (payload: GameVictoryPayload) => setVictory(payload));
    socket.on('server:error', (payload: { code: string; message: string }) => {
      if (payload.code === 'PREPARE_FAILED') {
        setErrorMessage('This color is unavailable. Choose another one.');
      } else {
        setErrorMessage(payload.message);
      }
    });
    return () => {
      socket.off('player:colorAssigned');
      socket.off('player:joined');
      socket.off('game:state');
      socket.off('game:victory');
      socket.off('server:error');
    };
  }, [socket]);

  const prepare = (name: string, preferredColor?: string) => {
    setNameDraft(name);
    socket.emit('player:prepare', { name, sessionId, preferredColor });
  };

  const join = (name: string) => {
    if (!reservation) return;
    socket.emit('player:join', { name, reservationId: reservation.reservationId, sessionId });
  };

  const respawn = () => {
    socket.emit('player:respawn', { sessionId });
  };

  const sendMove = (direction: Direction) => {
    socket.emit('player:move', { direction, sessionId });
  };

  const value = useMemo<Ctx>(() => ({
    player,
    state,
    freeCells,
    reservation,
    errorMessage,
    victory,
    isDead: !!player && player.status !== 'alive',
    prepare,
    join,
    respawn,
    sendMove
  }), [player, state, freeCells, reservation, errorMessage, victory]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): Ctx => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used inside GameProvider');
  return ctx;
};
