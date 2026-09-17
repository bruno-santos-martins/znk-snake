import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
const SESSION_STORAGE_KEY = 'znk.sessionId';
const RESPAWN_COOLDOWN_MS = 10000;
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
    const [activityLog, setActivityLog] = useState([]);
    const [victory, setVictory] = useState(null);
    const [respawnCooldownUntil, setRespawnCooldownUntil] = useState(0);
    const [nowTs, setNowTs] = useState(() => Date.now());
    const nameByPlayerIdRef = useRef(new Map());
    const previousStatusRef = useRef(null);
    const pushLog = (entry) => {
        setActivityLog((prev) => [entry, ...prev].slice(0, 10));
    };
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
            for (const p of payload.state.players) {
                nameByPlayerIdRef.current.set(p.id, p.name);
            }
            setState(payload.state);
            setFreeCells(payload.freeCells);
            setPlayer((prev) => {
                if (!prev)
                    return prev;
                const updated = payload.state.players.find((p) => p.id === prev.id) ?? null;
                return updated ?? prev;
            });
        });
        socket.on('player:died', (payload) => {
            const victim = nameByPlayerIdRef.current.get(payload.playerId) ?? payload.playerId;
            const killerId = payload.killerPlayerId;
            const killer = killerId ? (nameByPlayerIdRef.current.get(killerId) ?? killerId) : null;
            if (killer) {
                pushLog(`${killer} killed ${victim}`);
            }
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
            socket.off('player:died');
            socket.off('game:victory');
            socket.off('server:error');
        };
    }, [socket]);
    useEffect(() => {
        const timer = window.setInterval(() => setNowTs(Date.now()), 250);
        return () => window.clearInterval(timer);
    }, []);
    useEffect(() => {
        const previousStatus = previousStatusRef.current;
        const currentStatus = player?.status ?? null;
        if (previousStatus === 'dead' && currentStatus === 'alive') {
            setRespawnCooldownUntil(Date.now() + RESPAWN_COOLDOWN_MS);
        }
        previousStatusRef.current = currentStatus;
    }, [player?.status]);
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
    const respawnCooldownRemainingMs = Math.max(0, respawnCooldownUntil - nowTs);
    const value = useMemo(() => ({
        player,
        state,
        freeCells,
        reservation,
        errorMessage,
        activityLog,
        victory,
        isDead: !!player && player.status !== 'alive',
        respawnCooldownRemainingMs,
        prepare,
        join,
        respawn,
        sendMove
    }), [player, state, freeCells, reservation, errorMessage, activityLog, victory, respawnCooldownRemainingMs]);
    return _jsx(GameContext.Provider, { value: value, children: children });
};
export const useGameContext = () => {
    const ctx = useContext(GameContext);
    if (!ctx)
        throw new Error('useGameContext must be used inside GameProvider');
    return ctx;
};
