import { useEffect } from 'react';
const MAP = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right'
};
export const useKeyboardControls = (onMove) => {
    useEffect(() => {
        const handler = (ev) => {
            const dir = MAP[ev.key];
            if (!dir)
                return;
            ev.preventDefault();
            onMove(dir);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onMove]);
};
