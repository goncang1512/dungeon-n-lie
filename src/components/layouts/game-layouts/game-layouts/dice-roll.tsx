import { SessionType } from "@/src/lib/auth/types";
import React from "react";
import { dungeonSound } from "./dungeon-sound";

interface DiceRollProps {
  diceValue: number | null;
  selectedNeed: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedChoice: any;
  selectedStat: number;
  success: boolean;
  data: SessionType | null;
  rolling: boolean;
  handleRoll: () => void;
  turn: string;
}

export default function DiceRoll({
  data,
  diceValue,
  rolling,
  selectedChoice,
  selectedNeed,
  selectedStat,
  success,
  handleRoll,
  turn,
}: DiceRollProps) {
  const handleRollWithSound = () => {
    dungeonSound.diceRoll(); // ← sound mulai bersamaan dengan rolling
    handleRoll();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Dice + Info: side by side */}
      <div className="flex flex-row items-center gap-4 w-full">
        {/* Dice box */}
        <div
          className={`w-20 h-20 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-150 ${rolling ? "scale-110 rotate-6" : ""}`}
          style={{
            borderColor: "#f59e0b",
            background: "rgba(0,0,0,.45)",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#fbbf24",
              fontFamily: "monospace",
            }}
          >
            {diceValue ?? "D20"}
          </span>
        </div>

        {/* Info kolom kanan dice */}
        <div className="flex flex-col gap-1 min-w-0">
          {/* NEED */}
          <div
            style={{
              color: "#f59e0b",
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "monospace",
              lineHeight: 1,
            }}
          >
            NEED {selectedNeed}+
          </div>

          {/* Stat info */}
          {selectedChoice && (
            <div
              style={{
                color: "#78716c",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              {selectedChoice.required_stat} {selectedStat}
            </div>
          )}

          {/* Status */}
          <div
            style={{
              color:
                diceValue == null ? "#f5f5f4" : success ? "#22c55e" : "#ef4444",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            {diceValue == null ? "READY" : success ? "SUCCESS" : "FAILED"}
          </div>
        </div>
      </div>

      {/* Action label */}
      <div
        className="w-full text-center truncate"
        style={{
          color: "#a8a29e",
          fontSize: 10,
          letterSpacing: "0.1em",
          fontFamily: "monospace",
        }}
      >
        {selectedChoice?.label ?? "SELECT ACTION"}
      </div>

      {/* Roll button */}
      <button
        onClick={handleRollWithSound}
        disabled={rolling || !selectedChoice || data?.user.id !== turn}
        className="w-full py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {rolling ? "ROLLING..." : "ROLL D20"}
      </button>
    </div>
  );
}
