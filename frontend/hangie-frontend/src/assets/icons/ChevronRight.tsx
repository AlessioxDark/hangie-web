import React from "react";

const ChevronRight = ({ color }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill=""
      stroke=""
    >
      <g id="F-Chevron">
        {" "}
        <polyline
          fill="none"
          id="Right"
          points="8.5 5 15.5 12 8.5 19"
          stroke={color}
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        ></polyline>{" "}
      </g>{" "}
    </svg>
  );
};

export default ChevronRight;
