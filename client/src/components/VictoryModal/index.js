import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const VictoryModal = ({ victory }) => {
    if (!victory)
        return null;
    return (_jsx("div", { className: "overlay victory", children: _jsxs("div", { className: "panel", children: [_jsx("h2", { children: "You are the Master!" }), _jsx("p", { style: { color: victory.color }, children: victory.name }), _jsxs("p", { children: ["Size: ", victory.size, " Score: ", victory.score, " Kills: ", victory.kills] })] }) }));
};
