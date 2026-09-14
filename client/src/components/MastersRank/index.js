import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const MastersRank = ({ masters }) => {
    return (_jsxs("section", { className: "rank", children: [_jsx("h3", { children: "Masters" }), _jsx("ul", { children: masters.map((m, i) => (_jsxs("li", { children: [_jsx("span", { style: { color: m.color }, children: m.name }), " size ", m.size, " score ", m.score, " kills ", m.kills] }, `${m.name}-${m.date}-${i}`))) })] }));
};
