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
const StatBlock = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-black" style={{ color: P.t1 }}>
        {value}
      </span>
      <span
        className="text-[9px] font-semibold uppercase tracking-widest"
        style={{ color: P.t3 }}
      >
        {label}
      </span>
    </div>
  );
};

export default StatBlock;
