/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useState,
  useEffect,
  JSX,
  startTransition,
  useMemo,
  useRef,
} from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

import { DungeonBackground } from "@/src/components/layouts/game-layouts/background-game";
import { VideoTile } from "./stream/vidio-tile";
import { CallControls } from "./stream/call-controls";

import {
  UserRole,
  ROLE_META,
  PHASE_LABELS,
  PHASE_COLORS,
} from "./game-layouts/init-game";
import { useEngine } from "@/src/store/game.store";
import { useShallow } from "zustand/shallow";
import { STORY_LINE } from "./game-layouts/story-line";
import { useParams } from "next/navigation";
import { nextTurn } from "@/src/actions/game-match.action";
import { SystemLogPanel } from "./game-layouts/log-game";
import { useGame } from "./game-layouts/game-state";

function fmt(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function EmptySlot({ slotIndex }: { slotIndex: number }): JSX.Element {
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        background: "rgba(8,5,3,0.4)",
        border: "1px solid rgba(41,37,36,0.35)",
      }}
    >
      <div
        className="w-full flex items-center justify-center"
        style={{ aspectRatio: "4/3" }}
      >
        <span
          className="text-[9px] tracking-widest"
          style={{ fontFamily: "monospace", color: "rgba(87,83,78,0.38)" }}
        >
          AWAITING
        </span>
      </div>
      <div className="px-2 py-1" style={{ background: "rgba(4,3,2,0.88)" }}>
        <span
          className="text-[10px] tracking-widest"
          style={{ fontFamily: "monospace", color: "rgba(87,83,78,0.3)" }}
        >
          #{String(slotIndex + 1).padStart(2, "0")} — EMPTY
        </span>
      </div>
    </div>
  );
}

function TopBar(): JSX.Element {
  const { state, myPlayer } = useGame();
  const roleMeta = ROLE_META[myPlayer?.role ?? "survivor"];
  const urgency =
    state.timeLeft < 60
      ? "#f87171"
      : state.timeLeft < 120
        ? "#fbbf24"
        : "#e7e5e4";
  const phaseColor = PHASE_COLORS[state.phase];

  const { discuss } = useEngine(
    useShallow((state) => ({ discuss: state.discuss })),
  );

  return (
    <div
      className="flex items-center justify-between px-4 py-5 border-b border-stone-800/60 shrink-0"
      style={{
        background: "rgba(4,3,2,0.90)",
        backdropFilter: "blur(12px)",
        zIndex: 10,
      }}
    >
      {/* Left: session indicator */}
      <div className="flex items-center gap-2.5" style={{ minWidth: 180 }}>
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: "#f59e0b",
            boxShadow: "0 0 6px rgba(245,158,11,0.9)",
          }}
        />
        <span
          className="text-amber-500 text-xs tracking-widest uppercase"
          style={{ fontFamily: "monospace" }}
        >
          Session Active
        </span>
        <span
          style={{ fontFamily: "monospace", fontSize: 10, color: "#44403c" }}
        >
          {state.players.filter((p) => !p.isEliminated).length}/6
        </span>
      </div>

      {/* Center-left: role badge */}
      <div className="flex-1 flex justify-center">
        <span
          className="text-[9px] tracking-widest px-3 py-0.5 font-bold border"
          style={{
            fontFamily: "monospace",
            color: roleMeta.color,
            borderColor: roleMeta.color,
            background: "rgba(0,0,0,0.6)",
          }}
        >
          {roleMeta.label}
        </span>
      </div>

      {/* Center: timer */}
      {discuss && (
        <div className="flex-1 flex justify-center">
          <span
            className="text-[28px] font-bold tracking-widest"
            style={{ fontFamily: "monospace", color: urgency }}
          >
            {fmt(state.timeLeft)}
          </span>
        </div>
      )}

      {/* Right: round + phase */}
      <div className="flex-1 flex justify-end items-center gap-2">
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#57534e",
            letterSpacing: "0.1em",
          }}
        >
          ROUND {state.round} OF {state.maxRounds}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: state.maxRounds }, (_, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 3,
                background: i < state.round ? "#d97706" : "#292524",
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            letterSpacing: "0.1em",
            color: phaseColor,
            marginLeft: 4,
          }}
        >
          {PHASE_LABELS[state.phase]}
        </span>
      </div>
    </div>
  );
}

function NarrativePanel({ glitch }: { glitch: boolean }): JSX.Element {
  const params = useParams();
  const { stage, matchPlayer, condition, winner } = useEngine(
    useShallow((state) => ({
      stage: state.stage,
      matchPlayer: state.matchPlayer,
      condition: state.condition,
      winner: state.winner,
    })),
  );

  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Game sudah selesai — jangan trigger apapun
    if (winner) return;

    // Stage sudah ada — ini bukan intro, skip
    if (stage !== null) return;

    // matchPlayer belum ter-hydrate dari server
    if (!matchPlayer.length) return;

    // Sudah pernah trigger — jangan double call
    if (hasTriggeredRef.current) return;

    // Ambil sessionGame fresh dari store
    const { sessionGame } = useEngine.getState();

    // Hanya matchPlayer[0] yang trigger nextTurn
    // matchPlayer diurutkan by created_at ASC dari server — konsisten di semua client
    if (sessionGame?.userId !== matchPlayer[0].userId) return;

    hasTriggeredRef.current = true;

    setTimeout(() => {
      startTransition(async () => {
        await nextTurn("1", matchPlayer[0].userId, String(params.id));
      });
    }, 10000);
  }, [stage, matchPlayer, winner]);

  const storyCondition = useMemo(() => {
    const res = STORY_LINE.stages
      .find((item) => item.id === condition.stage)
      ?.choices?.find((choice) => choice.id === condition.choice);

    return condition.success ? res?.success.story : res?.failure.story;
  }, [condition]);

  return (
    <div
      className="relative flex-1 flex flex-col items-center justify-center px-8"
      style={{ background: "transparent" }}
    >
      {/* Corner brackets */}
      {[
        { top: 0, left: 0, bt: 1, br: 0, bb: 0, bl: 1 },
        { top: 0, right: 0, bt: 1, br: 1, bb: 0, bl: 0 },
        { bottom: 0, left: 0, bt: 0, br: 0, bb: 1, bl: 1 },
        { bottom: 0, right: 0, bt: 0, br: 1, bb: 1, bl: 0 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute w-5 h-5"
          style={{
            top: (c as any).top !== undefined ? (c as any).top : "auto",
            left: (c as any).left !== undefined ? (c as any).left : "auto",
            right: (c as any).right !== undefined ? (c as any).right : "auto",
            bottom:
              (c as any).bottom !== undefined ? (c as any).bottom : "auto",
            borderTop: c.bt ? "1px solid rgba(217,119,6,0.5)" : "none",
            borderRight: c.br ? "1px solid rgba(217,119,6,0.5)" : "none",
            borderBottom: c.bb ? "1px solid rgba(217,119,6,0.5)" : "none",
            borderLeft: c.bl ? "1px solid rgba(217,119,6,0.5)" : "none",
          }}
        />
      ))}

      {/* Narrative text */}
      {condition.stage !== null ? (
        <div>
          <p
            className="text-center leading-relaxed italic max-w-md"
            style={{
              fontFamily: "monospace",
              fontSize: 30,
              color: "#e7e5e4",
              textShadow: "0 1px 12px rgba(0,0,0,1)",
            }}
          >
            {condition.success ? "SUCCESS" : "FAILED"}
          </p>
          <p
            className="text-center leading-relaxed italic max-w-md"
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              color: "#e7e5e4",
              textShadow: "0 1px 12px rgba(0,0,0,1)",
            }}
          >
            {storyCondition}
          </p>
        </div>
      ) : (
        <p
          className="text-center leading-relaxed italic max-w-md"
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            color: "#e7e5e4",
            textShadow: "0 1px 12px rgba(0,0,0,1)",
          }}
        >
          &quot;
          {stage !== null
            ? STORY_LINE.stages.find((item) => item.id === stage)?.story
            : STORY_LINE.setting.story}
          &quot;
        </p>
      )}

      {/* Glitch artifact */}
      {glitch && (
        <div
          className="absolute bottom-6 left-0 right-0 h-px"
          style={{ background: "rgba(217,119,6,0.4)" }}
        />
      )}
    </div>
  );
}

function CenterPanel({ glitch }: { glitch: boolean }): JSX.Element {
  return (
    <div
      className="flex-1 relative flex flex-col min-w-0"
      style={{
        margin: "6px 3px",
        border: "1px solid rgba(41,37,36,0.5)",
        background: "rgba(4,3,2,0.35)",
        overflow: "hidden",
      }}
    >
      <NarrativePanel glitch={glitch} />
      <SystemLogPanel />
    </div>
  );
}

function EndgameOverlay(): JSX.Element {
  const { state } = useEngine(useShallow((state) => ({ state: state.state })));
  const heroWin = state === "hero";
  const color = heroWin ? "#4ade80" : "#f87171";

  return (
    <>
      <style>{`@keyframes endreveal{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        className="fixed inset-0 flex items-center justify-center flex-col gap-5 text-center"
        style={{ background: "rgba(0,0,0,0.94)", zIndex: 100 }}
      >
        <div
          style={{
            animation: "endreveal .6s ease-out forwards",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 56, color }}>{heroWin ? "✓" : "✗"}</div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              fontWeight: "bold",
              letterSpacing: "0.2em",
              color,
            }}
          >
            {heroWin ? "ANCAMAN DINETRALISIR" : "SEMUA SISTEM DIKOMPROMIKAN"}
          </div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#57534e",
              maxWidth: 320,
              lineHeight: 1.7,
            }}
          >
            {heroWin
              ? "Infiltrator berhasil diidentifikasi. Tim selamat dari Ravenwood Station."
              : "Infiltrator berhasil menggagalkan misi. Tidak ada yang keluar dari fasilitas ini."}
          </p>
        </div>
      </div>
    </>
  );
}

export function GameUI({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}): JSX.Element {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const { state } = useEngine(useShallow((state) => ({ state: state.state })));

  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 350);
    }, 9_000);
    return () => clearInterval(id);
  }, []);

  if (state === "blockout") {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#000", zIndex: 999 }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#1c1917",
            letterSpacing: "0.4em",
          }}
        >
          BLACKOUT AKTIF
        </span>
      </div>
    );
  }

  const renderSlots = (startIdx: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
      const slotIdx = startIdx + i;
      const p = participants[slotIdx];
      if (!p) return <EmptySlot key={`e-${slotIdx}`} slotIndex={slotIdx} />;
      const isSelf = p.userId === userId;
      return (
        <VideoTile
          key={p.sessionId}
          userId={p.userId}
          participant={p}
          slotIndex={slotIdx}
          isSelf={isSelf}
          selfRole={isSelf ? role : undefined}
        />
      );
    });

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-mono"
      style={{ background: "#080503" }}
    >
      {process.env.NEXT_PUBLIC_NODE_ENV === "production" && (
        <DungeonBackground />
      )}

      {/* Visual overlay layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.80) 100%)",
        }}
      />
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: 0.025,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,1) 3px,rgba(0,0,0,1) 6px)",
        }}
      />
      {glitch && (
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            zIndex: 3,
            // eslint-disable-next-line react-hooks/purity
            top: `${35 + Math.random() * 30}%`,
            height: 1,
            background: "rgba(217,119,6,0.35)",
          }}
        />
      )}

      {/* Endgame */}
      {state === "endgame" && <EndgameOverlay />}

      {/* ── MAIN LAYOUT ── */}
      <div className="absolute inset-0 flex flex-col" style={{ zIndex: 2 }}>
        {/* 1. Top bar */}
        <TopBar />

        {/* 2. Body */}
        <div className="flex flex-1 min-h-0 gap-0">
          {/* Left video column */}
          <div
            className="flex flex-col shrink-0"
            style={{ width: 176, gap: 2, padding: "6px 3px 6px 6px" }}
          >
            {renderSlots(0, 3)}
          </div>

          {/* Center */}
          <CenterPanel glitch={glitch} />

          {/* Right video column */}
          <div
            className="flex flex-col shrink-0"
            style={{ width: 176, gap: 2, padding: "6px 6px 6px 3px" }}
          >
            {renderSlots(3, 3)}
          </div>
        </div>

        {/* 3. Bottom action bar */}
        <div
          className="flex items-center justify-between gap-3 border-t shrink-0"
          style={{
            background: "rgba(4,3,2,0.94)",
            backdropFilter: "blur(12px)",
            borderTopColor: "rgba(41,37,36,0.6)",
            padding: "7px 12px",
          }}
        >
          <CallControls />
          <div className="flex gap-1.5">
            {["»", "«"].map((s, i) => (
              <button
                key={i}
                className="w-7 h-7 border flex items-center justify-center text-stone-600 text-xs"
                style={{
                  borderColor: "rgba(87,83,78,0.4)",
                  background: "transparent",
                  fontFamily: "monospace",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
