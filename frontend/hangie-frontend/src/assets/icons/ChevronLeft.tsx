import React from "react";

const ChevronLeft = ({ color }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
      width={"30px"}
      height={"30px"}
    >
      <g id="SVGRepo_iconCarrier">
        {" "}
        <title></title>{" "}
        <g id="Complete">
          {" "}
          <g id="F-Chevron">
            {" "}
            <polyline
              fill="none"
              id="Left"
              points="15.5 5 8.5 12 15.5 19"
              stroke={color ? color : "#2463eb"}
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></polyline>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  );
};

export default ChevronLeft;
