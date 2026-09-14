import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ColorPreview = ({ color }) => {
    return (_jsxs("div", { className: "color-preview", children: [_jsx("div", { className: "swatch", style: { background: color } }), _jsx("p", { children: "Your color is reserved." })] }));
};
