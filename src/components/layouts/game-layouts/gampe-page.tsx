"use client";

// gampe-page.tsx — Stream setup, teruskan semua props ke GameWrapper.

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
import { GameWrapper } from "./game-wrapper";
import { useEngine } from "@/src/store/game.store";
import { useShallow } from "zustand/shallow";

export default function GamePage({
  userId,
  matchId,
  username,
  character,
  role,
  players,
  streamToken,
  apiKey,
}: GamePageProps): JSX.Element {
  const { setValue } = useEngine(
    useShallow((state) => ({ setValue: state.setValue })),
  );
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
        setClient(myClient);
        setCall(myCall);
        Promise.resolve().then(() => {
          myCall.camera.enable().catch(console.error);
          myCall.microphone.enable().catch(console.error);
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Gagal join call.");
        myClient.disconnectUser().catch(console.error);
      });

    return () => {
      myCall.leave().catch(console.error);
      myClient.disconnectUser().catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (players) {
      setValue("matchPlayer", players);
    }
  }, [players]);

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
        <GameWrapper
          userId={userId}
          role={role}
          classId={character}
          players={players}
        />
      </StreamCall>
    </StreamVideo>
  );
}
