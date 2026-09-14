import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const DeathOverlay = ({ show, onRespawn }) => {
    if (!show)
        return null;
    return (_jsx("div", { className: "overlay", children: _jsxs("div", { className: "panel", children: [_jsx("h2", { children: "You died" }), _jsx("button", { onClick: onRespawn, children: "Respawn now" })] }) }));
};
