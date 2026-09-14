import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
const SESSION_STORAGE_KEY = 'znk.sessionId';
const ensureSessionId = () => {
    const current = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (current && current.trim().length > 0)
        return current;
    const next = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(SESSION_STORAGE_KEY, next);
    return next;
};
const GameContext = createContext(null);
export const GameProvider = ({ children }) => {
    const socket = useSocket();
    const [sessionId] = useState(() => ensureSessionId());
    const [player, setPlayer] = useState(null);
    const [nameDraft, setNameDraft] = useState('');
    const [state, setState] = useState(null);
    const [freeCells, setFreeCells] = useState(0);
    const [reservation, setReservation] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [victory, setVictory] = useState(null);
    useEffect(() => {
        socket.on('player:colorAssigned', (payload) => {
            setReservation(payload);
            setErrorMessage(null);
        });
        socket.on('player:joined', (payload) => {
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
        socket.on('game:state', (payload) => {
            setState(payload.state);
            setFreeCells(payload.freeCells);
            setPlayer((prev) => {
                if (!prev)
                    return prev;
                const updated = payload.state.players.find((p) => p.id === prev.id) ?? null;
                return updated ?? prev;
            });
        });
        socket.on('game:victory', (payload) => setVictory(payload));
        socket.on('server:error', (payload) => {
            if (payload.code === 'PREPARE_FAILED') {
                setErrorMessage('This color is unavailable. Choose another one.');
            }
            else {
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
    const prepare = (name, preferredColor) => {
        setNameDraft(name);
        socket.emit('player:prepare', { name, sessionId, preferredColor });
    };
    const join = (name) => {
        if (!reservation)
            return;
        socket.emit('player:join', { name, reservationId: reservation.reservationId, sessionId });
    };
    const respawn = () => {
        socket.emit('player:respawn', { sessionId });
    };
    const sendMove = (direction) => {
        socket.emit('player:move', { direction, sessionId });
    };
    const value = useMemo(() => ({
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
    return _jsx(GameContext.Provider, { value: value, children: children });
};
export const useGameContext = () => {
    const ctx = useContext(GameContext);
    if (!ctx)
        throw new Error('useGameContext must be used inside GameProvider');
    return ctx;
};
