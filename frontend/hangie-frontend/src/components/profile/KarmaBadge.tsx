import React from "react";
const P = {
  primary: "#2463eb",
  primaryLight: "#eff4ff",
  primaryMid: "#dbeafe",
  bg1: "#ffffff",
  bg2: "#f8fafc",
  bg3: "#e2e8f0",
  t1: "#0f172a",
  t2: "#64748b",
  t3: "#94a3b8",
};
const LEVELS = [
  { min: 0, max: 100, name: "Nuovo", icon: "🌱", color: P.t3, bg: P.bg2 },
  { min: 101, max: 300, name: "Curioso", icon: "👀", color: P.t2, bg: P.bg3 },
  {
    min: 301,
    max: 600,
    name: "Presenza",
    icon: "⚡",
    color: P.primary,
    bg: "#eff4ff",
  },
  {
    min: 601,
    max: 1200,
    name: "Leggenda",
    icon: "🔥",
    color: "#b45309",
    bg: "#fffbeb",
  },
  {
    min: 1201,
    max: 9999,
    name: "Icona",
    icon: "👑",
    color: "#1d4ed8",
    bg: "#dbeafe",
  },
];

const KarmaBadge = ({ points = 82 }) => {
  const getLevel = (pts) => {
    const current = LEVELS.findLast((l) => pts >= l.min) || LEVELS[0];
    const next = LEVELS[LEVELS.indexOf(current) + 1];
    const progress = next
      ? Math.floor(((pts - current.min) / (next.min - current.min)) * 100)
      : 100;
    return {
      ...current,
      progress: Math.min(Math.max(progress, 0), 100),
      nextName: next?.name ?? null,
    };
  };
  const { icon, name, color, bg, progress } = getLevel(points);

  return (
    <div
      className="flex flex-col items-center gap-2 px-4 py-3 rounded-[24px] min-w-[130px] transition-all"
      style={{
        background: bg,
        border: `1.5px solid ${color}30`,
        boxShadow: `0 4px 12px ${color}10`,
      }}
    >
      {/* 1. STATUS: Icona e Label */}
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none drop-shadow-sm">{icon}</span>
        <span
          className="text-[10px] font-black uppercase tracking-[0.12em] leading-none"
          style={{ color }}
        >
          {name}
        </span>
      </div>

      {/* 2. PUNTI: Ben visibili al centro */}
      <div className="flex items-baseline gap-0.5 leading-none">
        <span
          className="text-xl font-black tracking-tighter leading-none"
          style={{ color: P.t1 }}
        >
          {points}
        </span>
        <span
          className="text-[10px] font-bold opacity-40 uppercase"
          style={{ color: P.t1 }}
        >
          pt
        </span>
      </div>

      {/* 3. PROGRESSO: La barra sottile che crea "dipendenza" */}
      <div className="w-full ">
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: `${color}20` }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progress}%`,
              background: "#2463eb",
            }}
          />
        </div>
        <div className="flex justify-end mt-1 px-0.5">
          <span
            className="text-[7px] font-black uppercase opacity-30"
            style={{ color: P.t1 }}
          >
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default KarmaBadge;
