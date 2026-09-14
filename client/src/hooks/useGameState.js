import { useMemo } from 'react';
import { useGameContext } from '../contexts/GameContext';
export const useGameState = () => {
    const ctx = useGameContext();
    return useMemo(() => ({
        player: ctx.player,
        state: ctx.state,
        freeCells: ctx.freeCells,
        reservation: ctx.reservation,
        errorMessage: ctx.errorMessage,
        activityLog: ctx.activityLog,
        isDead: ctx.isDead,
        victory: ctx.victory,
        prepare: ctx.prepare,
        join: ctx.join,
        respawn: ctx.respawn,
        sendMove: ctx.sendMove
    }), [ctx]);
};
