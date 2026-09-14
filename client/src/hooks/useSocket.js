import { useMemo } from 'react';
import { getSocket } from '../services/socketClient';
export const useSocket = () => {
    return useMemo(() => getSocket(), []);
};
