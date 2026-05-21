"use client";
import { useScene } from "@/src/hooks/scene-waiting";
import { useEffect, useRef } from "react";
import Vignettes from "./vignettes";
import TopBarWaiting from "./top-bar-waiting";
import PlayerGrid from "./player-grid";
import ChatSection from "./chat-section";
import { PlayerMatch, useChatStore } from "@/src/store/chat.store";
import { useShallow } from "zustand/shallow";
import {
  handleHostChanged,
  handleUserJoined,
  handleUserOut,
  handleUserReady,
  pusherClientMatch,
} from "@/src/lib/pusher/match.pusher";

export default function MainComponentWaiting({
  players,
  roomId,
  match_id,
}: {
  players: PlayerMatch[];
  roomId: string;
  match_id: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useScene(canvasRef);

  const { setValue, players: onPlayers } = useChatStore(
    useShallow((state) => ({
      setValue: state.setValue,
      players: state.players,
    })),
  );

  const readyCount = onPlayers.filter((p) => p?.status === "ready").length;
  const totalFilled = onPlayers.filter(Boolean).length;

  useEffect(() => {
    setValue("players", players);
  }, [players]);

  useEffect(() => {
    if (!roomId) return;

    const channelName = `match-${roomId}`;
    const channel = pusherClientMatch.subscribe(channelName);

    // Simpan reference dalam variable agar bind & unbind pakai function yang sama
    const onUserJoined = (data: PlayerMatch) =>
      handleUserJoined(data, setValue);
    const onUserOut = (data: { userId: string }) =>
      handleUserOut(data, setValue);
    const onHostChanged = (data: { user_id: string }) =>
      handleHostChanged(data, setValue);
    const onUserReady = (data: { userId: string; ready: boolean }) =>
      handleUserReady(data, setValue);

    channel.bind("user-joined", onUserJoined);
    channel.bind("user-out", onUserOut);
    channel.bind("host-changed", onHostChanged);
    channel.bind("user-ready", onUserReady);

    return () => {
      channel.unbind("user-joined", onUserJoined);
      channel.unbind("user-out", onUserOut);
      channel.unbind("host-changed", onHostChanged);
      channel.unbind("user-ready", onUserReady);
      pusherClientMatch.unsubscribe(channelName);
    };
  }, [roomId]);

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden select-none"
      style={{ background: "#0c0804" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Vignettes — edges darker so UI pops */}
      <Vignettes />
      {/* UI */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 md:p-6 gap-4">
        {/* Top bar */}
        <TopBarWaiting readyCount={readyCount} totalFilled={totalFilled} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to right,transparent,#3a2810,transparent)",
            }}
          />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{
              background: "#5a3810",
              boxShadow: "0 0 4px rgba(90,56,16,0.5)",
            }}
          />
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to right,transparent,#3a2810,transparent)",
            }}
          />
        </div>

        {/* Main */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          {/* Player grid 3×2 */}
          <PlayerGrid match_id={match_id} />

          {/* Right panel */}
          <div className="w-full lg:w-72 flex flex-col gap-3">
            {/* Chat */}
            <ChatSection roomId={roomId} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to right,transparent,#1a1006,transparent)",
            }}
          />
          <p
            className="font-cinzel text-[9px] tracking-[6px]"
            style={{ color: "rgba(60,40,10,0.35)" }}
          >
            ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ
          </p>
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to right,transparent,#1a1006,transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
