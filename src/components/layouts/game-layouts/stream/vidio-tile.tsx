"use client";

import {
  useCallStateHooks,
  ParticipantView,
  SfuModels,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { JSX, useMemo } from "react";
import { ROLE_META, UserRole } from "../game-layouts/init-game";
import { useEngine } from "@/src/store/game.store";
import { useShallow } from "zustand/shallow";

type StreamParticipant = ReturnType<
  ReturnType<typeof useCallStateHooks>["useParticipants"]
>[number];

export function VideoTile({
  participant,
  slotIndex,
  isSelf,
  selfRole,
  userId,
}: {
  participant: StreamParticipant;
  slotIndex: number;
  isSelf: boolean;
  selfRole?: UserRole;
  userId: string;
}): JSX.Element {
  const name =
    participant.name ?? participant.userId ?? `PLAYER ${slotIndex + 1}`;
  const { turn, stage } = useEngine(
    useShallow((state) => ({ turn: state.turn, stage: state.stage })),
  );

  // FIX: Gunakan publishedTracks bukan videoStream/audioStream langsung.
  // videoStream bisa null walau kamera aktif karena belum di-subscribe.
  // publishedTracks adalah sumber kebenaran apakah participant sedang publish video/audio.
  const videoOn = participant.publishedTracks.includes(
    SfuModels.TrackType.VIDEO,
  );
  const audioOn = participant.publishedTracks.includes(
    SfuModels.TrackType.AUDIO,
  );

  const roleMeta = selfRole ? ROLE_META[selfRole] : null;

  const borderStyle = useMemo(() => {
    if (stage?.startsWith("discuss")) {
      return "1px solid rgba(41,37,36,0.55)";
    }

    if (turn === userId) {
      return "3px solid rgba(34,197,94,0.8)";
    }

    if (isSelf) {
      return "1px solid rgba(245,158,11,0.65)";
    }

    return "1px solid rgba(41,37,36,0.55)";
  }, [turn, userId, isSelf, stage]);

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        background: "#080503",
        border: borderStyle,
        boxShadow: isSelf ? "0 0 14px rgba(245,158,11,0.15)" : "none",
      }}
    >
      <span
        className="absolute top-1 right-1 z-20 text-[9px] px-1 tracking-widest"
        style={{
          fontFamily: "monospace",
          background: "rgba(0,0,0,0.72)",
          color: "#57534e",
        }}
      >
        #{String(slotIndex + 1).padStart(2, "0")}
      </span>

      <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
        {videoOn ? (
          <>
            <ParticipantView
              participant={participant}
              ParticipantViewUI={null}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: 5,
                background: "rgba(20, 10, 5, 0.18)", // subtle warm tint
                mixBlendMode: "multiply",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: 5,
                background:
                  "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.50) 100%)",
              }}
            />
            {/* Scanline effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: 5,
                opacity: 0.04,
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,1) 2px,rgba(0,0,0,1) 4px)",
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(8,5,3,0.97)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(87,83,78,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 17H3a2 2 0 01-2-2V7a2 2 0 012-2h2" />
              <path d="M22 15l-5-3 5-3v6z" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </div>
        )}

        {participant.isSpeaking && (
          <div
            className="absolute bottom-1.5 right-1.5 z-20 w-2 h-2 rounded-full"
            style={{
              background: "#22c55e",
              boxShadow: "0 0 5px rgba(34,197,94,0.9)",
            }}
          />
        )}

        {!audioOn && (
          <span
            className="absolute bottom-1 left-1 z-20 px-1 text-[8px] tracking-widest"
            style={{
              fontFamily: "monospace",
              background: "rgba(0,0,0,0.72)",
              color: "#78716c",
            }}
          >
            MUTED
          </span>
        )}

        {isSelf && roleMeta && (
          <span
            className="absolute top-1 left-1 z-20 px-1.5 py-0.5 text-[8px] tracking-widest font-bold"
            style={{
              fontFamily: "monospace",
              background: "rgba(0,0,0,0.82)",
              color: roleMeta.color,
              border: `1px solid ${roleMeta.color}`,
              textShadow: `0 0 6px ${roleMeta.glow}`,
            }}
          >
            {roleMeta.label}
          </span>
        )}
      </div>

      <div
        className="px-2 py-2 flex items-center justify-between shrink-0"
        style={{ background: "rgba(4,3,2,0.94)" }}
      >
        <span
          className="text-[10px] tracking-widest uppercase truncate leading-none"
          style={{
            fontFamily: "monospace",
            color: isSelf ? "#f59e0b" : "rgba(214,211,209,0.82)",
            maxWidth: "85%",
          }}
        >
          {isSelf ? `YOU (${name})` : name}
        </span>
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            background: videoOn ? "#d97706" : "#292524",
            boxShadow: videoOn ? "0 0 4px rgba(217,119,6,0.7)" : "none",
          }}
        />
      </div>
    </div>
  );
}
