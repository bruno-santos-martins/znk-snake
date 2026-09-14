import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PlayerHUD = ({ name, color, score, kills, freeCells }) => {
    return (_jsxs("aside", { className: "hud", children: [_jsx("h3", { children: name }), _jsx("div", { className: "dot", style: { background: color } }), _jsxs("p", { children: ["Score: ", score] }), _jsxs("p", { children: ["Kills: ", kills] }), _jsxs("p", { children: ["Free cells: ", freeCells] })] }));
};
