import { Clue } from "@/src/types/in-game.types";
import { JSX } from "react";

export const CLUES: Clue[] = [
  {
    id: 1,
    type: "MOTION",
    text: "Heavy footsteps recorded near the East Annex.",
    severity: "high",
  },
  {
    id: 2,
    type: "ANOMALY",
    text: "Alistair's vitals spiked for 6 seconds.",
    severity: "medium",
  },
  {
    id: 3,
    type: "SYSTEM",
    text: "Sensor grid disrupted in the Chapel.",
    severity: "low",
  },
];

export function ClueRow({ clue }: { clue: Clue }): JSX.Element {
  const C: Record<
    Clue["severity"],
    { dot: string; glow: string; text: string }
  > = {
    high: { dot: "#ef4444", glow: "rgba(239,68,68,0.5)", text: "text-red-400" },
    medium: {
      dot: "#f59e0b",
      glow: "rgba(245,158,11,0.5)",
      text: "text-amber-400",
    },
    low: {
      dot: "#6b7280",
      glow: "rgba(107,114,128,0.4)",
      text: "text-stone-400",
    },
  };
  const c = C[clue.severity];
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-stone-800/50 last:border-0">
      <div
        className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: c.dot, boxShadow: `0 0 5px ${c.glow}` }}
      />
      <span
        className={`text-[10px] font-mono ${c.text} shrink-0 tracking-wider`}
      >
        {clue.type}
      </span>
      <span className="text-xs text-stone-400 font-mono leading-snug">
        {clue.text}
      </span>
    </div>
  );
}
