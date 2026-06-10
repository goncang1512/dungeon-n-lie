"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CharacterSelect from "../home-page/character-select";
import { $Enums } from "@/generated/prisma/client";
import { useDungeonScene } from "@/src/hooks/useDungeonScene";
import { Phase, ROLE_META, UserRole } from "./role-data";
import { dungeonSound } from "../game-layouts/game-layouts/dungeon-sound";

const ROLE_KEYS = Object.keys(ROLE_META) as UserRole[];

interface RolePageClientProps {
  matchId: string;
  userId: string;
  characterClass: string;
  initialRole: UserRole;
}

export default function RolePageClient({
  matchId,
  characterClass,
  initialRole,
}: RolePageClientProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDungeonScene(canvasRef);

  const [phase, setPhase] = useState<Phase>("rolling");
  const [cycleIdx, setCycleIdx] = useState(0);

  // null = belum mulai, 5..1 = countdown aktif, 0 = redirect
  const [countdown, setCountdown] = useState<number | null>(null);

  // Track previous phase untuk mendeteksi transisi ke "done" tanpa setState sync
  const prevPhaseRef = useRef<Phase>("rolling");

  // ── Animasi rolling → reveal → done ─────────────────────────────────────
  useEffect(() => {
    const stopRolling = dungeonSound.rolling();

    const cycleInterval = setInterval(() => {
      setCycleIdx((p) => (p + 1) % ROLE_KEYS.length);
    }, 80);

    const revealTimer = setTimeout(() => {
      stopRolling();
      clearInterval(cycleInterval);
      setPhase("reveal");
      dungeonSound.reveal();
      setTimeout(() => setPhase("done"), 900);
    }, 2400);

    return () => {
      stopRolling();
      clearInterval(cycleInterval);
      clearTimeout(revealTimer);
    };
  }, []);

  // ── Inisialisasi countdown saat phase berubah ke "done" ──────────────────
  // Menggunakan prevPhaseRef untuk menghindari setState sync di dalam effect body
  useEffect(() => {
    if (phase === "done" && prevPhaseRef.current !== "done") {
      setCountdown(5);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // ── Tick countdown setiap detik ──────────────────────────────────────────
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Redirect saat countdown mencapai 0 ──────────────────────────────────
  useEffect(() => {
    if (countdown === 0) {
      router.push(`/game/${matchId}`);
    }
  }, [countdown, matchId, router]);

  const meta = ROLE_META[initialRole];
  const cyclingMeta = ROLE_META[ROLE_KEYS[cycleIdx]];

  return (
    <div className="relative w-full h-screen overflow-hidden dungeon-flicker">
      {/* Layer 0 — Three.js canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Layer 1 — Scanlines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* Layer 2 — UI */}
      <div className="absolute inset-0 flex flex-col" style={{ zIndex: 2 }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 shrink-0">
          <div>
            <p className="dungeon-label text-[10px] tracking-[.3em] text-yellow-700/80 mb-0.5 uppercase">
              Dungeon N Lie
            </p>
            <h1
              className="dungeon-title text-xl font-bold text-yellow-500"
              style={{
                textShadow:
                  "0 0 18px rgba(201,168,76,.6), 0 0 36px rgba(201,168,76,.22)",
              }}
            >
              THE HOLDING CELL
            </h1>
          </div>

          <div
            className="dungeon-glass px-4 py-2 border border-yellow-800/40"
            style={{
              boxShadow: "0 0 1px rgba(138,110,47,.4), 0 0 14px rgba(0,0,0,.5)",
            }}
          >
            <p className="dungeon-label text-[9px] tracking-[.25em] text-yellow-700/70 mb-1 uppercase">
              Room Cipher
            </p>
            <p
              className="dungeon-label font-bold text-lg tracking-widest text-yellow-500"
              style={{ textShadow: "0 0 12px rgba(201,168,76,.5)" }}
            >
              {matchId.slice(0, 6).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 pt-4 pb-6 px-6 gap-6">
          {/* LEFT: Role Panel */}
          <div className="flex flex-col gap-3 w-100 shrink-0">
            <div
              className="dungeon-glass relative flex flex-col items-center border border-yellow-800/35 flex-1"
              style={{
                minHeight: 320,
                boxShadow:
                  "inset 0 0 40px rgba(0,0,0,.55), 0 0 20px rgba(0,0,0,.3)",
              }}
            >
              {/* Corners */}
              <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-yellow-600/45" />
              <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-yellow-600/45" />
              <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-yellow-600/45" />
              <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-yellow-600/45" />

              {/* ROLLING */}
              {phase === "rolling" && (
                <div className="flex flex-col items-center justify-center flex-1 gap-5 p-8 w-full">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full dungeon-spin"
                      style={{
                        border: `2px solid ${cyclingMeta.color}`,
                        borderTopColor: "transparent",
                        filter: `drop-shadow(0 0 8px ${cyclingMeta.color})`,
                      }}
                    />
                    <span
                      className="dungeon-rolling text-4xl select-none"
                      style={{ color: cyclingMeta.color }}
                    >
                      {cyclingMeta.icon}
                    </span>
                  </div>
                  <p
                    className="dungeon-rolling dungeon-title text-xl tracking-[.3em] uppercase"
                    style={{
                      color: cyclingMeta.color,
                      textShadow: `0 0 18px ${cyclingMeta.color}`,
                    }}
                  >
                    {cyclingMeta.label}
                  </p>
                  <p className="dungeon-label text-[10px] tracking-[.4em] text-yellow-700 uppercase dungeon-glow-pulse">
                    Consulting the Void...
                  </p>
                </div>
              )}

              {/* REVEAL / DONE */}
              {(phase === "reveal" || phase === "done") && meta && (
                <div className="flex flex-col items-center gap-3 dungeon-role-in w-full p-6">
                  {/* Particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full dungeon-float"
                        style={{
                          width: `${(i % 3) + 2}px`,
                          height: `${(i % 3) + 2}px`,
                          background: meta.color,
                          left: `${(i * 37 + 11) % 100}%`,
                          top: `${(i * 53 + 7) % 100}%`,
                          opacity: 0.22 + (i % 4) * 0.07,
                          animationDuration: `${3 + (i % 4)}s`,
                          animationDelay: `${(i % 3) * 0.8}s`,
                        }}
                      />
                    ))}
                  </div>

                  <p className="dungeon-label text-[9px] tracking-[.4em] text-yellow-700/75 uppercase">
                    The Dungeon Decrees
                  </p>

                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl select-none shrink-0"
                    style={{
                      background: `radial-gradient(circle, ${meta.glowColor} 0%, rgba(0,0,0,0.65) 70%)`,
                      border: `2px solid ${meta.borderColor}`,
                      boxShadow: `0 0 25px ${meta.glowColor}, 0 0 50px ${meta.glowColor}`,
                    }}
                  >
                    {meta.icon}
                  </div>

                  <div className="text-center">
                    <h2
                      className="dungeon-title text-2xl font-bold tracking-widest uppercase"
                      style={{
                        color: meta.color,
                        textShadow: `0 0 16px ${meta.glowColor}, 0 0 35px ${meta.glowColor}`,
                      }}
                    >
                      {meta.label}
                    </h2>
                    <p
                      className="dungeon-body italic text-sm mt-0.5"
                      style={{ color: `${meta.color}75` }}
                    >
                      {meta.tagline}
                    </p>
                  </div>

                  <div
                    className="w-full h-px shrink-0"
                    style={{
                      background:
                        "linear-gradient(90deg,transparent,rgba(201,168,76,.3),rgba(201,168,76,.65),rgba(201,168,76,.3),transparent)",
                    }}
                  />

                  <p className="dungeon-body text-center text-base text-yellow-100/50 italic leading-relaxed px-1">
                    {meta.description}
                  </p>

                  <div
                    className="w-full p-3 dungeon-body text-xs leading-relaxed shrink-0"
                    style={{
                      background: meta.glowColor,
                      borderLeft: `2px solid ${meta.borderColor}`,
                      color: `${meta.color}a8`,
                    }}
                  >
                    <span className="dungeon-label text-[9px] tracking-widest block mb-1 opacity-50 uppercase">
                      Ability
                    </span>
                    {meta.ability}
                  </div>
                </div>
              )}
            </div>

            {/* CTA / Countdown */}
            {phase === "done" && (
              <div className="dungeon-fade-up shrink-0">
                {countdown !== null && countdown > 0 ? (
                  // ── Countdown aktif ──────────────────────────────────────
                  <div
                    className="w-full flex flex-col items-center gap-1 border border-yellow-700/50 px-8 py-3"
                    style={{
                      background: "rgba(10,7,2,0.65)",
                      backdropFilter: "blur(8px)",
                      clipPath:
                        "polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)",
                    }}
                  >
                    <p className="dungeon-label text-[9px] tracking-[.4em] text-yellow-700/60 uppercase">
                      Entering dungeon in
                    </p>
                    <p
                      className="dungeon-title text-4xl font-bold text-yellow-500 tabular-nums"
                      style={{
                        textShadow:
                          "0 0 18px rgba(201,168,76,.7), 0 0 40px rgba(201,168,76,.3)",
                      }}
                    >
                      {countdown}
                    </p>
                    {/* Progress bar */}
                    <div className="w-full h-px mt-1 overflow-hidden">
                      <div
                        className="h-full bg-yellow-600/50 transition-all duration-1000 ease-linear"
                        style={{ width: `${(countdown / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : countdown === null ? (
                  // ── Menunggu countdown dimulai ───────────────────────────
                  <div
                    className="w-full flex flex-col items-center gap-1 border border-yellow-800/35 px-8 py-3"
                    style={{
                      background: "rgba(10,7,2,0.45)",
                      backdropFilter: "blur(8px)",
                      clipPath:
                        "polygon(8px 0%,calc(100% - 8px) 0%,100% 8px,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0% calc(100% - 8px),0% 8px)",
                    }}
                  >
                    <p className="dungeon-label text-[9px] tracking-[.4em] text-yellow-700/50 uppercase dungeon-glow-pulse">
                      Entering the dungeon...
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* RIGHT: Character */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 mb-3 shrink-0">
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(201,168,76,.25),rgba(201,168,76,.55),rgba(201,168,76,.25),transparent)",
                }}
              />
              <p className="dungeon-label text-[9px] tracking-[.4em] text-yellow-700/65 uppercase">
                Your Vessel
              </p>
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(201,168,76,.25),rgba(201,168,76,.55),rgba(201,168,76,.25),transparent)",
                }}
              />
            </div>

            <div className="relative flex-1 min-h-0">
              <div className="absolute inset-0" style={{ zIndex: 2 }}>
                <div className="w-125 h-screen">
                  <CharacterSelect
                    selectedClass={characterClass as $Enums.CharUser}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 3 — Whispers */}
      <div
        className="absolute right-6 bottom-6 dungeon-glass border border-yellow-800/40 p-3 w-64"
        style={{
          zIndex: 3,
          boxShadow: "inset 0 0 18px rgba(0,0,0,.55), 0 0 12px rgba(0,0,0,.35)",
        }}
      >
        <p className="dungeon-label text-[9px] tracking-[.3em] text-yellow-700/65 mb-2 uppercase">
          Dungeon Whispers
        </p>
        <div
          className="h-px mb-2"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(201,168,76,.3),rgba(201,168,76,.6),rgba(201,168,76,.3),transparent)",
          }}
        />
        <p className="dungeon-body italic text-yellow-600/45 text-xs leading-relaxed">
          {phase === "rolling" &&
            "The dungeon shuffles the threads of destiny..."}
          {(phase === "reveal" || phase === "done") &&
            countdown === null &&
            meta &&
            `A ${meta.label.toLowerCase()} walks among us. The dungeon has spoken.`}
          {phase === "done" &&
            countdown !== null &&
            countdown > 0 &&
            "All souls have been branded. The dungeon awaits..."}
        </p>
      </div>
    </div>
  );
}
