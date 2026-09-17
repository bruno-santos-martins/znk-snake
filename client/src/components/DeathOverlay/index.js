import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const DeathOverlay = ({ show, onRespawn, cooldownMs }) => {
    if (!show)
        return null;
    const cooldownSeconds = Math.ceil(cooldownMs / 1000);
    const canRespawn = cooldownMs <= 0;
    return (_jsx("div", { className: "overlay overlay-death", children: _jsxs("div", { className: "panel death-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "death-title", children: [_jsx("p", { className: "death-badge", children: "Snake Down" }), _jsx("h2", { id: "death-title", children: "You died" }), _jsx("p", { className: "death-subtitle", children: "Prepare-se para voltar mais forte." }), _jsx("button", { type: "button", onClick: onRespawn, disabled: !canRespawn, className: "death-respawn-btn", children: canRespawn ? 'Reviver agora' : `Reviver em ${cooldownSeconds}s` }), !canRespawn ? _jsx("p", { className: "death-helper", children: "Cooldown ativo para novo respawn." }) : null] }) }));
};
