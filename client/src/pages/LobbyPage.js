import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ColorPreview } from '../components/ColorPreview';
import { useGameState } from '../hooks/useGameState';
const COLOR_OPTIONS = [
    '#39ff14', '#ff3131', '#00e5ff', '#ffd60a', '#ff00ff', '#7df9ff', '#ff6ec7',
    '#00ff85', '#ff9f1c', '#b8ff00', '#ff4d6d', '#00bbf9'
];
export const LobbyPage = ({ onStart }) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
    const { reservation, errorMessage, prepare, join } = useGameState();
    return (_jsxs("main", { className: "lobby", children: [_jsx("h1", { children: "ZNK Snake Multiplayer" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Your name" }), _jsx("div", { className: "color-picker", role: "radiogroup", "aria-label": "Choose color", children: COLOR_OPTIONS.map((color) => (_jsx("button", { type: "button", className: `color-option${selectedColor === color ? ' selected' : ''}`, style: { background: color }, onClick: () => setSelectedColor(color), "aria-label": `Choose color ${color}` }, color))) }), !reservation ? (_jsx("button", { onClick: () => prepare(name, selectedColor), disabled: !name.trim(), children: "Reserve color" })) : (_jsxs(_Fragment, { children: [_jsx(ColorPreview, { color: reservation.color }), _jsx("button", { onClick: () => { join(name); onStart(); }, children: "Join game" })] })), errorMessage ? _jsx("p", { className: "error-text", children: errorMessage }) : null] }));
};
