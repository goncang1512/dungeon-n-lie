import { Player } from "@/src/types/in-game.types";
import { JSX, useState } from "react";

export const PLAYERS: Player[] = [
  {
    id: 1,
    name: "ALISTAIR",
    role: "INVESTIGATOR",
    position: "top-left",
    suspicious: false,
    status: "active",
  },
  {
    id: 2,
    name: "ELARA",
    role: "ARCHIVIST",
    position: "mid-left",
    suspicious: false,
    status: "active",
  },
  {
    id: 3,
    name: "MORGANE",
    role: "WARDEN",
    position: "bot-left",
    suspicious: false,
    status: "active",
  },
  {
    id: 4,
    name: "YOU (SHALIN)",
    role: "UNKNOWN",
    position: "top-right",
    suspicious: false,
    status: "active",
    isYou: true,
  },
  {
    id: 5,
    name: "CEDRIC",
    role: "SCOUT",
    position: "mid-right",
    suspicious: false,
    status: "active",
  },
  {
    id: 6,
    name: "LUNA",
    role: "MEDIC",
    position: "bot-right",
    suspicious: false,
    status: "active",
  },
];

export function PlayerCard({ player }: { player: Player }): JSX.Element {
  const [suspicious, setSuspicious] = useState<boolean>(false);
  const border = player.isYou
    ? "border-amber-400"
    : suspicious
      ? "border-red-500"
      : "border-stone-600";
  const label = player.isYou
    ? "bg-amber-500 text-black"
    : "bg-stone-900/90 text-stone-300";

  return (
    <div
      className={`relative cursor-pointer select-none transition-all duration-300 ${player.isYou ? "ring-1 ring-amber-500/40" : ""}`}
      onClick={() => !player.isYou && setSuspicious((s) => !s)}
    >
      <div
        className={`relative w-full aspect-video border ${border} overflow-hidden`}
        style={{
          background:
            "linear-gradient(135deg,#100d0a 0%,#1e1510 50%,#100d0a 100%)",
          boxShadow: player.isYou
            ? "0 0 16px rgba(245,158,11,0.35),inset 0 0 18px rgba(0,0,0,0.55)"
            : suspicious
              ? "0 0 12px rgba(239,68,68,0.45)"
              : "inset 0 0 18px rgba(0,0,0,0.55)",
        }}
      >
        {/* scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.25) 2px,rgba(0,0,0,0.25) 4px)",
          }}
        />
        {/* silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 60 80" className="w-10 h-14 opacity-50">
            <ellipse cx="30" cy="15" rx="10" ry="12" fill="#2a1a0e" />
            <path d="M10 80 Q15 45 30 40 Q45 45 50 80Z" fill="#2a1a0e" />
            <path d="M10 50 Q5 40 8 30 Q12 25 15 35" fill="#2a1a0e" />
            <path d="M50 50 Q55 40 52 30 Q48 25 45 35" fill="#2a1a0e" />
          </svg>
        </div>
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.65) 100%)",
          }}
        />
        <div className="absolute top-1 right-1 text-[9px] font-mono text-stone-500 opacity-70">
          #{String(player.id).padStart(2, "0")}
        </div>
        <div
          className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
          style={{
            background: player.status === "active" ? "#22c55e" : "#ef4444",
            boxShadow:
              player.status === "active"
                ? "0 0 4px #22c55e"
                : "0 0 4px #ef4444",
          }}
        />
        {suspicious && !player.isYou && (
          <div className="absolute inset-0 bg-red-900/20 border border-red-500/30 flex items-center justify-center">
            <span className="font-mono text-red-400 text-xs tracking-widest font-bold">
              MARKED
            </span>
          </div>
        )}
      </div>
      <div
        className={`px-1.5 py-0.5 text-xs font-mono tracking-wider flex items-center justify-between ${label} border-t ${border}`}
      >
        <span className="truncate">{player.name}</span>
        {player.isYou && (
          <span className="text-amber-400 text-[10px] ml-1">YOU</span>
        )}
      </div>
    </div>
  );
}
