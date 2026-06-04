"use client";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  type Call,
  type User,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { useState, useEffect, useRef, JSX } from "react";
import { GamePageProps } from "@/app/(root)/game/[id]/page";
import { GameUI } from "./game-ui";

export const NARRATIVE =
  '"The torches dim. Somewhere in the corridor, a door was left open that should have been sealed. Someone moved when the lights went out."';

export const ACTIONS = ["INVESTIGATE", "PROTECT", "ACCUSE", "WAIT"] as const;
export type Action = (typeof ACTIONS)[number];
export type UserRole = GamePageProps["role"];

export const ROLE_META: Record<
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
        // FIX: Set state dulu agar komponen mount, baru enable devices.
        // Sebelumnya camera.enable() dipanggil sebelum setCall() — ini bisa
        // menyebabkan race condition karena React belum mount StreamCall.
        setClient(myClient);
        setCall(myCall);

        // Enable devices setelah state update cycle selesai
        Promise.resolve().then(() => {
          myCall.camera.enable().catch(console.error);
          myCall.microphone.enable().catch(console.error);
        });
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
