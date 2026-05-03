import React from "react";
import { Corners } from "./player-card";
import { useParams } from "next/navigation";

export default function TopBarWaiting({
  readyCount,
  totalFilled,
}: {
  totalFilled: number;
  readyCount: number;
}) {
  const params = useParams();

  return (
    <div className="flex items-center justify-between">
      <div>
        <p
          className="font-cinzel text-[8px] tracking-[5px]"
          style={{ color: "rgba(120,80,20,0.55)" }}
        >
          DUNGEON N LIE
        </p>
        <h1
          className="font-cinzel font-bold text-[18px] md:text-[22px] tracking-[4px]"
          style={{
            color: "#c8882a",
            textShadow: "0 0 30px rgba(200,136,42,0.4)",
          }}
        >
          THE HOLDING CELL
        </h1>
      </div>

      {/* Room code */}
      <div
        className="relative px-4 py-2 rounded-sm cursor-pointer"
        style={{
          background: "rgba(14,10,4,0.9)",
          border: "1px solid #3a2810",
        }}
        onClick={() => {
          if (params.id) {
            navigator.clipboard.writeText(String(params.id));
          }
        }}
      >
        <Corners color="#5a3810" size="w-2 h-2" />
        <p
          className="font-cinzel text-[7px] tracking-[3px] mb-0.5"
          style={{ color: "#5a3d18" }}
        >
          ROOM CIPHER
        </p>
        <p
          className="font-cinzel font-bold text-[18px] tracking-[5px]"
          style={{
            color: "#e0a83a",
            textShadow: "0 0 12px rgba(224,168,58,0.4)",
          }}
        >
          {params.id}
        </p>
      </div>

      {/* Counter */}
      <div className="flex flex-col items-end gap-1">
        <p
          className="font-cinzel text-[8px] tracking-[3px]"
          style={{ color: "rgba(120,80,20,0.55)" }}
        >
          SOULS GATHERED
        </p>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-cinzel font-bold text-[24px]"
            style={{ color: "#e0a83a" }}
          >
            {totalFilled}
          </span>
          <span
            className="font-cinzel text-[12px]"
            style={{ color: "#5a3d18" }}
          >
            /6
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-5 h-1.5 rounded-sm transition-all duration-500"
              style={{
                background:
                  i < readyCount
                    ? "#40cc60"
                    : i < totalFilled
                      ? "rgba(160,120,40,0.5)"
                      : "rgba(30,20,8,0.5)",
                boxShadow:
                  i < readyCount ? "0 0 6px rgba(64,204,96,0.4)" : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
