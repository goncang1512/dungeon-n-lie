import { useEngine } from "@/src/store/game.store";
import React from "react";
import { useShallow } from "zustand/shallow";
import { getBaseHp } from "../game-layouts/utils-game";

export default function HpPlayer() {
  const sessionGame = useEngine(useShallow((state) => state.sessionGame));
  const isKilled = sessionGame?.status === "killed";

  const currentHp = sessionGame?.hp ?? 0;
  const maxHp = sessionGame?.classId ? getBaseHp(sessionGame.classId) : 20;
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const hpColor =
    hpPercent > 60 ? "#22c55e" : hpPercent > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="flex flex-col items-center gap-1.5"
      style={{ minWidth: 200 }}
    >
      {/* Label + angka */}
      <div className="flex items-center justify-between w-full">
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#57534e",
            letterSpacing: "0.2em",
          }}
        >
          HP
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 700,
            color: hpColor,
            letterSpacing: "0.1em",
            textShadow: `0 0 8px ${hpColor}88`,
          }}
        >
          {isKilled ? "DEAD" : `${currentHp} / ${maxHp}`}
        </span>
      </div>

      {/* Bar track */}
      <div
        className="w-full rounded-sm overflow-hidden"
        style={{
          height: 8,
          background: "rgba(41,37,36,0.8)",
          border: "1px solid rgba(41,37,36,0.6)",
        }}
      >
        <div
          style={{
            width: `${hpPercent}%`,
            height: "100%",
            background: hpColor,
            boxShadow: `0 0 10px ${hpColor}99`,
            transition: "width 0.4s ease, background 0.4s ease",
          }}
        />
      </div>

      {/* Segmen HP visual */}
      <div className="flex gap-px w-full">
        {Array.from({ length: maxHp }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              background: i < currentHp ? hpColor : "rgba(41,37,36,0.5)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
