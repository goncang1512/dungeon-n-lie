"use client";

import { EndGameWinner } from "@/src/actions/game-match.action";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dungeonSound } from "./dungeon-sound";

interface EndGameOverlayProps {
  winner: EndGameWinner | null;
  myRole: string;
}

const WINNER_CONFIG = {
  infiltrator: {
    title: "INFILTRATOR MENANG",
    icon: "☠",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.6)",
    border: "rgba(239,68,68,0.4)",
    desc: "Kegelapan mengambil alih dungeon. Tidak ada yang selamat.",
  },
  innocent: {
    title: "INNOCENT MENANG",
    icon: "⚔",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.6)",
    border: "rgba(34,197,94,0.4)",
    desc: "Pengkhianat telah disingkap. Dungeon kembali aman.",
  },
};

const PERSONAL_MSG = {
  win: {
    label: "KAMU MENANG",
    color: "#22c55e",
    sub: "Perjuanganmu tidak sia-sia.",
  },
  lose: {
    label: "KAMU KALAH",
    color: "#ef4444",
    sub: "Takdir tidak berpihak padamu kali ini.",
  },
};

export function EndGameOverlay({
  winner,
  myRole,
}: EndGameOverlayProps): JSX.Element | null {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const isInfiltrator = myRole === "infiltrator";
  const playerWins =
    (winner === "infiltrator" && isInfiltrator) ||
    (winner === "innocent" && !isInfiltrator);

  // ✅ Satu useEffect, sebelum early return
  useEffect(() => {
    if (!winner) return;
    const t = setTimeout(() => {
      setVisible(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      playerWins ? dungeonSound.win() : dungeonSound.lose();
    }, 800);
    return () => clearTimeout(t);
  }, [winner, playerWins]);

  // Early return boleh di sini, setelah semua hooks
  if (!winner || !visible) return null;

  const config = WINNER_CONFIG[winner];
  const personal = playerWins ? PERSONAL_MSG.win : PERSONAL_MSG.lose;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.92)",
        animation: "fadeIn 0.6s ease forwards",
      }}
    >
      {/* Scanline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,1) 2px,rgba(0,0,0,1) 4px)",
        }}
      />

      <div
        className="relative flex flex-col items-center gap-6 px-10 py-10 max-w-md w-full mx-4"
        style={{
          background: "rgba(8,5,3,0.98)",
          border: `1px solid ${config.border}`,
          boxShadow: `0 0 80px ${config.glow}, 0 0 160px rgba(0,0,0,0.8)`,
          animation: "scaleIn 0.5s ease forwards",
        }}
      >
        {/* Corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <div
            key={pos}
            className="absolute w-5 h-5"
            style={{
              top: pos.startsWith("t") ? 0 : "auto",
              bottom: pos.startsWith("b") ? 0 : "auto",
              left: pos.endsWith("l") ? 0 : "auto",
              right: pos.endsWith("r") ? 0 : "auto",
              borderTop: pos.startsWith("t")
                ? `2px solid ${config.color}`
                : "none",
              borderBottom: pos.startsWith("b")
                ? `2px solid ${config.color}`
                : "none",
              borderLeft: pos.endsWith("l")
                ? `2px solid ${config.color}`
                : "none",
              borderRight: pos.endsWith("r")
                ? `2px solid ${config.color}`
                : "none",
              opacity: 0.7,
            }}
          />
        ))}

        {/* System label */}
        <span
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "monospace", color: "rgba(214,211,209,0.35)" }}
        >
          ◈ SISTEM · PERMAINAN BERAKHIR
        </span>

        {/* Icon */}
        <div
          className="text-6xl"
          style={{
            filter: `drop-shadow(0 0 16px ${config.glow})`,
            animation: "pulse 2s ease infinite",
          }}
        >
          {config.icon}
        </div>

        {/* Winner title */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p
            className="text-2xl font-bold tracking-[0.2em] uppercase"
            style={{
              fontFamily: "monospace",
              color: config.color,
              textShadow: `0 0 24px ${config.glow}`,
            }}
          >
            {config.title}
          </p>
          <p
            className="text-[11px] tracking-wider"
            style={{ fontFamily: "monospace", color: "rgba(214,211,209,0.5)" }}
          >
            {config.desc}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: config.border }} />

        {/* Personal result */}
        <div
          className="flex flex-col items-center gap-1 px-6 py-3 w-full"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${personal.color}22`,
          }}
        >
          <p
            className="text-lg font-bold tracking-[0.25em]"
            style={{
              fontFamily: "monospace",
              color: personal.color,
              textShadow: `0 0 12px ${personal.color}88`,
            }}
          >
            {personal.label}
          </p>
          <p
            className="text-[10px] tracking-widest"
            style={{ fontFamily: "monospace", color: "rgba(214,211,209,0.4)" }}
          >
            {personal.sub}
          </p>
        </div>

        {/* Role reveal */}
        <p
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "monospace", color: "rgba(214,211,209,0.3)" }}
        >
          Role kamu:{" "}
          <span style={{ color: config.color }}>{myRole.toUpperCase()}</span>
        </p>

        {/* Home button */}
        <button
          onClick={() => router.push("/")}
          className="w-full py-2.5 tracking-[0.25em] text-[11px] uppercase font-bold transition-all duration-200"
          style={{
            fontFamily: "monospace",
            background: "rgba(0,0,0,0)",
            border: `1px solid ${config.color}55`,
            color: `${config.color}99`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${config.color}15`;
            e.currentTarget.style.color = config.color;
            e.currentTarget.style.borderColor = config.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0)";
            e.currentTarget.style.color = `${config.color}99`;
            e.currentTarget.style.borderColor = `${config.color}55`;
          }}
        >
          ↩ KEMBALI KE BERANDA
        </button>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </div>
  );
}
