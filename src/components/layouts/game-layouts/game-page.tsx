"use client";
import { DungeonBackground } from "@/src/components/layouts/game-layouts/background-game";
import { ClueRow, CLUES } from "@/src/components/layouts/game-layouts/clue-row";
import {
  PlayerCard,
  PLAYERS,
} from "@/src/components/layouts/game-layouts/player-card";
import { useState, useEffect, JSX } from "react";

const NARRATIVE = `"The torches dim. Somewhere in the corridor, a door was left open that should have been sealed. Someone moved when the lights went out."`;
const ACTIONS = ["INVESTIGATE", "PROTECT", "ACCUSE", "WAIT"] as const;
type Action = (typeof ACTIONS)[number];

export default function GamePage(): JSX.Element {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [round] = useState<number>(2);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [systemMsg, setSystemMsg] = useState<string>(
    "Koneksi stabil. Menunggu tindakan pemain...",
  );
  const [glitch, setGlitch] = useState<boolean>(false);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const msgs = [
      "Sensor grid tidak stabil di koridor timur...",
      "Anomali terdeteksi. Memeriksa log sistem...",
      "Peringatan: Koneksi terputus sesaat.",
      "Aktivitas mencurigakan di dekat Chapel.",
      "Pembaruan: Petunjuk baru tersedia.",
    ];
    const id = setInterval(() => {
      setGlitch(true);
      setSystemMsg(msgs[Math.floor(Math.random() * msgs.length)]);
      setTimeout(() => setGlitch(false), 300);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const urgency =
    timeLeft < 120
      ? "text-red-400"
      : timeLeft < 240
        ? "text-amber-400"
        : "text-stone-300";
  const left = PLAYERS.filter((p) => p.position.endsWith("left"));
  const right = PLAYERS.filter((p) => p.position.endsWith("right"));

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-mono"
      style={{ background: "#080503" }}
    >
      {/* ① Three.js canvas — z:0 */}
      <DungeonBackground />

      {/* ② Deep vignette — heavy corners, transparent center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.80) 100%)",
        }}
      />

      {/* ③ Top & bottom gradient bars for cinematic feel */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />

      {/* ④ Very faint scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: 0.03,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,1) 3px,rgba(0,0,0,1) 6px)",
        }}
      />

      {/* ⑤ UI — explicit z:2 */}
      <div className="absolute inset-0 flex flex-col" style={{ zIndex: 2 }}>
        {/* TOP HUD */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-stone-800/60"
          style={{
            background: "rgba(4,3,2,0.88)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full bg-amber-500"
              style={{ boxShadow: "0 0 6px rgba(245,158,11,0.8)" }}
            />
            <span className="text-amber-500 text-xs tracking-widest uppercase">
              Session Active
            </span>
          </div>
          <div
            className={`text-2xl font-bold tracking-widest ${urgency} ${glitch ? "opacity-40" : ""} transition-opacity`}
            style={{
              textShadow:
                timeLeft < 120
                  ? "0 0 10px rgba(239,68,68,0.8)"
                  : "0 0 8px rgba(245,158,11,0.6)",
            }}
          >
            {fmt(timeLeft)}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 tracking-wider">
            <span>ROUND {round} OF 5</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <div
                  key={r}
                  className="w-4 h-1"
                  style={{
                    background: r <= round ? "#d97706" : "#292524",
                    boxShadow:
                      r <= round ? "0 0 4px rgba(217,119,6,0.6)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex flex-1 gap-3 px-3 py-3 min-h-0">
          <div className="flex flex-col gap-2 w-44 shrink-0">
            {left.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* Narrative */}
            <div
              className="flex-1 flex flex-col items-center justify-center px-6 py-4 border border-stone-800/50 relative overflow-hidden"
              style={{
                background: "rgba(4,3,2,0.60)",
                backdropFilter: "blur(2px)",
              }}
            >
              {[
                "top-0 left-0",
                "top-0 right-0",
                "bottom-0 left-0",
                "bottom-0 right-0",
              ].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-4 h-4 border-amber-600/60`}
                  style={{
                    borderTopWidth: i < 2 ? "1px" : "0",
                    borderBottomWidth: i >= 2 ? "1px" : "0",
                    borderLeftWidth: i % 2 === 0 ? "1px" : "0",
                    borderRightWidth: i % 2 === 1 ? "1px" : "0",
                  }}
                />
              ))}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: d <= round % 3 ? "#d97706" : "#292524",
                      boxShadow:
                        d <= round % 3 ? "0 0 5px rgba(217,119,6,0.7)" : "none",
                    }}
                  />
                ))}
              </div>
              <p
                className="text-center text-stone-200 text-sm leading-relaxed italic max-w-xs"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,1)" }}
              >
                {NARRATIVE}
              </p>
              {glitch && (
                <div className="absolute bottom-6 left-0 right-0 h-px bg-amber-500/50" />
              )}
            </div>

            {/* Clue log */}
            <div
              className="border border-stone-800/50 px-3 py-2"
              style={{
                background: "rgba(4,3,2,0.82)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div className="text-[10px] text-stone-500 tracking-widest mb-1 uppercase">
                System Log
              </div>
              {CLUES.map((c) => (
                <ClueRow key={c.id} clue={c} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-44 shrink-0">
            {right.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          className="border-t border-stone-800/60 px-4 py-2 flex items-center gap-3"
          style={{
            background: "rgba(4,3,2,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex gap-2">
            {["M", "C"].map((ic, i) => (
              <button
                key={i}
                className="w-8 h-8 border border-stone-600 flex items-center justify-center text-stone-400 hover:border-amber-600 hover:text-amber-400 transition-colors text-xs"
              >
                {ic}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-1 justify-center">
            {ACTIONS.map((action) => {
              const isAcc = action === "ACCUSE",
                isAct = activeAction === action;
              return (
                <button
                  key={action}
                  onClick={() => setActiveAction(isAct ? null : action)}
                  className={`px-5 py-1.5 text-xs tracking-widest font-bold border transition-all duration-200 ${
                    isAct
                      ? isAcc
                        ? "bg-red-900/60 border-red-500 text-red-300"
                        : "bg-amber-900/50 border-amber-500 text-amber-300"
                      : isAcc
                        ? "border-red-800/60 text-red-600 hover:border-red-500 hover:text-red-400"
                        : "border-stone-600/60 text-stone-400 hover:border-amber-600 hover:text-amber-400"
                  }`}
                  style={
                    isAct
                      ? {
                          boxShadow: isAcc
                            ? "0 0 10px rgba(239,68,68,0.3)"
                            : "0 0 10px rgba(245,158,11,0.3)",
                        }
                      : {}
                  }
                >
                  {action}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            {["»", "«"].map((s, i) => (
              <button
                key={i}
                className="w-8 h-8 border border-stone-700 flex items-center justify-center text-stone-600 hover:border-stone-500 hover:text-stone-400 transition-colors text-xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* TICKER */}
        <div
          className={`px-4 py-1 text-xs text-stone-600 tracking-wide border-t border-stone-900/60 transition-opacity duration-200 ${glitch ? "opacity-20" : ""}`}
          style={{ background: "rgba(0,0,0,0.92)" }}
        >
          <span className="text-stone-600 mr-2">SYS ›</span>
          {systemMsg}
        </div>
      </div>
    </div>
  );
}
