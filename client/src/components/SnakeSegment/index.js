import { jsx as _jsx } from "react/jsx-runtime";
export const SnakeSegment = ({ x, y, isHead, color }) => {
    return (_jsx("div", { className: isHead ? 'snake head' : 'snake', style: {
            left: x * 10,
            top: y * 10,
            background: color,
            filter: isHead ? 'brightness(1.15)' : undefined
        } }));
};
