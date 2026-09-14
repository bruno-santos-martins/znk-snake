import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FoodDot } from '../FoodDot';
import { SnakeSegment } from '../SnakeSegment';
export const Board = ({ snakes, players, food }) => {
    const playerColors = new Map(players.map((player) => [player.id, player.color]));
    return (_jsxs("div", { className: "board", style: { width: 800, height: 600 }, children: [food.map((f) => (_jsx(FoodDot, { x: f.position.x, y: f.position.y }, f.id))), snakes.map((snake) => snake.segments.map((seg, i) => (_jsx(SnakeSegment, { x: seg.x, y: seg.y, isHead: i === 0, color: playerColors.get(snake.playerId) ?? '#39ff14' }, `${snake.id}-${i}`))))] }));
};
