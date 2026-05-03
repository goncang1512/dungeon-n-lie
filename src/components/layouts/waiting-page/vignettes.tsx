import React from "react";

export default function Vignettes() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          background:
            "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 15%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        className="absolute top-0 inset-x-0 h-36 pointer-events-none z-1"
        style={{
          background: "linear-gradient(to bottom,rgba(0,0,0,0.75),transparent)",
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-36 pointer-events-none z-1"
        style={{
          background: "linear-gradient(to top,rgba(0,0,0,0.75),transparent)",
        }}
      />
      <div
        className="absolute left-0 inset-y-0 w-20 pointer-events-none z-1"
        style={{
          background: "linear-gradient(to right,rgba(0,0,0,0.55),transparent)",
        }}
      />
      <div
        className="absolute right-0 inset-y-0 w-20 pointer-events-none z-1"
        style={{
          background: "linear-gradient(to left,rgba(0,0,0,0.55),transparent)",
        }}
      />
    </>
  );
}
