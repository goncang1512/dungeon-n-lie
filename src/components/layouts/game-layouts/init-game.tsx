"use client";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  useCallStateHooks,
  ParticipantView,
  type Call,
  type User,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { DungeonBackground } from "@/src/components/layouts/game-layouts/background-game";
import { ClueRow, CLUES } from "@/src/components/layouts/game-layouts/clue-row";
import { useState, useEffect, useRef, JSX } from "react";
import { GamePageProps } from "@/app/(root)/game/[id]/page";

const NARRATIVE =
  '"The torches dim. Somewhere in the corridor, a door was left open that should have been sealed. Someone moved when the lights went out."';

const ACTIONS = ["INVESTIGATE", "PROTECT", "ACCUSE", "WAIT"] as const;
type Action = (typeof ACTIONS)[number];
type UserRole = GamePageProps["role"];

const ROLE_META: Record<
  UserRole,
  { label: string; color: string; glow: string }
> = {
  survivor: {
    label: "SURVIVOR",
    color: "#78716c",
    glow: "rgba(120,113,108,0.6)",
  },
  observer: {
    label: "OBSERVER",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.6)",
  },
  guardian: {
    label: "GUARDIAN",
    color: "#34d399",
    glow: "rgba(52,211,153,0.6)",
  },
  analyst: {
    label: "ANALYST",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.6)",
  },
  infiltrator: {
    label: "INFILTRATOR",
    color: "#f87171",
    glow: "rgba(248,113,113,0.6)",
  },
  catalyst: {
    label: "CATALYST",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.6)",
  },
};

type StreamParticipant = ReturnType<
  ReturnType<typeof useCallStateHooks>["useParticipants"]
>[number];

function VideoTile({
  participant,
  slotIndex,
  isSelf,
  selfRole,
}: {
  participant: StreamParticipant;
  slotIndex: number;
  isSelf: boolean;
  selfRole?: UserRole;
}): JSX.Element {
  const name =
    participant.name ?? participant.userId ?? `PLAYER ${slotIndex + 1}`;
  const videoOn = !!participant.videoStream;
  const audioOn = !!participant.audioStream;
  const roleMeta = selfRole ? ROLE_META[selfRole] : null;

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        background: "#080503",
        border: isSelf
          ? "1px solid rgba(245,158,11,0.65)"
          : "1px solid rgba(41,37,36,0.55)",
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
            <div
              className="absolute inset-0 w-full h-full"
              style={{ filter: "brightness(0.82) contrast(1.08) sepia(0.18)" }}
            >
              <ParticipantView
                participant={participant}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.50) 100%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
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
        className="px-2 py-1 flex items-center justify-between shrink-0"
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

function CallControls(): JSX.Element {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isMute: camMuted } = useCameraState();
  const { microphone, isMute: micMuted } = useMicrophoneState();

  const btnStyle = (muted: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    cursor: "pointer",
    background: "transparent",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.15s, color 0.15s",
    border: `1px solid ${muted ? "rgba(239,68,68,0.55)" : "rgba(87,83,78,0.55)"}`,
    color: muted ? "#f87171" : "#78716c",
  });

  return (
    <div className="flex gap-2">
      <button
        style={btnStyle(micMuted)}
        title={micMuted ? "Unmute" : "Mute"}
        onClick={() => microphone.toggle()}
      >
        M
      </button>
      <button
        style={btnStyle(camMuted)}
        title={camMuted ? "Cam on" : "Cam off"}
        onClick={() => camera.toggle()}
      >
        C
      </button>
    </div>
  );
}

function GameUI({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}): JSX.Element {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const [timeLeft, setTimeLeft] = useState<number>(300);
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
    timeLeft < 60
      ? "text-red-400"
      : timeLeft < 120
        ? "text-amber-400"
        : "text-stone-300";

  const renderSlot = (idx: number) => {
    const p = participants[idx];
    if (!p) return <EmptySlot key={`e-${idx}`} slotIndex={idx} />;
    const isSelf = p.userId === userId;
    return (
      <VideoTile
        key={p.sessionId}
        participant={p}
        slotIndex={idx}
        isSelf={isSelf}
        selfRole={isSelf ? role : undefined}
      />
    );
  };

  const roleMeta = ROLE_META[role];

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-mono"
      style={{ background: "#080503" }}
    >
      <DungeonBackground />

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
          opacity: 0.03,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,1) 3px,rgba(0,0,0,1) 6px)",
        }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ zIndex: 2 }}>
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
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#57534e",
              }}
            >
              {participants.length}/6
            </span>
          </div>

          <span
            className="text-[9px] tracking-widest px-2 py-0.5 font-bold"
            style={{
              fontFamily: "monospace",
              color: roleMeta.color,
              border: `1px solid ${roleMeta.color}`,
              background: "rgba(0,0,0,0.6)",
              textShadow: `0 0 6px ${roleMeta.glow}`,
            }}
          >
            {roleMeta.label}
          </span>

          <div
            className={`text-2xl font-bold tracking-widest ${urgency} transition-opacity ${glitch ? "opacity-40" : ""}`}
            style={{
              textShadow:
                timeLeft < 60
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

        <div className="flex flex-1 gap-3 px-3 py-3 min-h-0">
          <div className="flex flex-col gap-2 w-44 shrink-0">
            {[0, 1, 2].map((i) => renderSlot(i))}
          </div>

          <div className="flex-1 flex flex-col gap-2 min-w-0">
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
            {[3, 4, 5].map((i) => renderSlot(i))}
          </div>
        </div>

        <div
          className="border-t border-stone-800/60 px-4 py-2 flex items-center gap-3"
          style={{
            background: "rgba(4,3,2,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CallControls />

          <div className="flex gap-2 flex-1 justify-center">
            {ACTIONS.map((action) => {
              const isAcc = action === "ACCUSE";
              const isAct = activeAction === action;
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

export default function GamePageInit({
  userId,
  matchId,
  username,
  role,
  streamToken,
  apiKey,
}: GamePageProps): JSX.Element {
  const [client, setClient] = useState<StreamVideoClient | undefined>();
  const [call, setCall] = useState<Call | undefined>();
  const [error, setError] = useState<string | null>(null);
  // Guard: cegah double-init di React StrictMode
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!apiKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Stream API key tidak ditemukan.");
      return;
    }

    const streamUser: User = { id: userId, name: username };

    const myClient = new StreamVideoClient({
      apiKey,
      user: streamUser,
      token: streamToken,
    });

    const myCall = myClient.call("default", matchId);

    myCall
      .join({ create: true })
      .then(() => {
        myCall.camera.enable().catch(console.error);
        myCall.microphone.enable().catch(console.error);
        // setClient dan setCall setelah join berhasil
        setClient(myClient);
        setCall(myCall);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Gagal join call.";
        setError(msg);
        myClient.disconnectUser().catch(console.error);
      });

    return () => {
      myCall.leave().catch(console.error);
      myClient.disconnectUser().catch(console.error);
    };
  }, []);

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full h-screen gap-4 font-mono"
        style={{ background: "#080503" }}
      >
        <span
          className="text-[10px] tracking-widest"
          style={{ color: "#57534e" }}
        >
          SYS ERROR ›
        </span>
        <span className="text-red-400 max-w-md text-center leading-relaxed text-sm">
          {error}
        </span>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div
        className="flex items-center justify-center w-full h-screen font-mono"
        style={{ background: "#080503" }}
      >
        <span
          className="text-[10px] tracking-widest animate-pulse"
          style={{ color: "#57534e" }}
        >
          INITIALIZING SESSION...
        </span>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <GameUI userId={userId} role={role} />
      </StreamCall>
    </StreamVideo>
  );
}
