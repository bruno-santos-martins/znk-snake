import { jsx as _jsx } from "react/jsx-runtime";
export const FoodDot = ({ x, y }) => {
    return _jsx("div", { className: "food", style: { left: x * 10, top: y * 10 }, title: "ratinho" });
};
