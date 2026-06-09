"use client";

import { useRef, useEffect } from "react";
import { useDungeonScene } from "@/src/hooks/useDungeonScene";
import DialogJoinRoom from "@/src/components/layouts/home-page/dialog-join-room";
import MenuItems from "@/src/components/layouts/home-page/menu-items";
import { matchStore } from "@/src/store/room.store";
import { useShallow } from "zustand/shallow";
import { authClient } from "@/src/lib/auth/client";
import { useRouter } from "next/navigation";
import CharacterSelect from "@/src/components/layouts/home-page/character-select";

// ─── Main Component ────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { data } = authClient.useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDungeonScene(canvasRef);
  const {
    createRoom,
    creating,
    handleOpenJoin,
    code,
    codeError,
    joinOpen,
    handleJoin,
    joining,
    hoveredBtn,
    audioReady,
    setValue,
    audio,
  } = matchStore(
    useShallow((state) => ({
      createRoom: state.createRoom,
      creating: state.creating,
      handleOpenJoin: state.handleOpenJoin,
      code: state.code,
      codeError: state.codeError,
      joinOpen: state.joinOpen,
      handleJoin: state.handleJoin,
      joining: state.joining,
      hoveredBtn: state.hoveredBtn,
      audioReady: state.audioReady,
      setValue: state.setValue,
      audio: state.audio,
    })),
  );

  // ── Auto-start audio pada interaksi pertama apapun ──────────────────────
  useEffect(() => {
    audio.listenForFirstInteraction(() => {
      setValue("audioReady", true);
      audio.playAmbient();
    });
  }, []);

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden select-none"
      style={{ background: "#0c0804" }}
    >
      {/* Three.js canvas */}
      {process.env.NEXT_PUBLIC_NODE_ENV === "production" && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          background:
            "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 15%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Top vignette bar */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none z-1"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-1"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
        }}
      />

      {/* UI */}
      <div className="relative z-10 flex flex-col min-h-screen px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          {/* Title block */}
          <div>
            <div
              className="font-cinzel font-bold tracking-[8px] leading-none"
              style={{
                fontSize: "clamp(36px, 7vw, 88px)",
                color: "#c8882a",
                textShadow:
                  "0 0 60px rgba(200,136,42,0.5), 0 0 120px rgba(200,136,42,0.2), 2px 2px 0 rgba(0,0,0,0.8)",
              }}
            >
              DUNGEON
            </div>
            <div className="flex items-center gap-4 -mt-1">
              <div
                className="h-px flex-1"
                style={{
                  background: "linear-gradient(to right, #a07828, transparent)",
                  maxWidth: 220,
                }}
              />
              <span
                className="font-cinzel text-[15px] tracking-[6px]"
                style={{ color: "#c8882a" }}
              >
                N
              </span>
              <div
                className="h-px flex-1"
                style={{
                  background: "linear-gradient(to left, #a07828, transparent)",
                  maxWidth: 220,
                }}
              />
            </div>
            <div
              className="font-cinzel font-bold tracking-[8px] leading-none"
              style={{
                fontSize: "clamp(36px, 7vw, 88px)",
                color: "#c8882a",
                textShadow:
                  "0 0 60px rgba(200,136,42,0.5), 0 0 120px rgba(200,136,42,0.2), 2px 2px 0 rgba(0,0,0,0.8)",
              }}
            >
              LIE
            </div>
            <p
              className="font-cinzel text-[9px] tracking-[5px] mt-3"
              style={{ color: "rgba(160,100,30,0.7)" }}
            >
              DECEPTION IN THE DEPTHS
            </p>
          </div>

          {/* Top right runes */}
          <div className="text-right block">
            <p
              className="font-cinzel text-[14px] tracking-[4px] font-bold"
              style={{ color: "rgba(120,80,20,1)" }}
            >
              {data?.user.username}
            </p>
            <div
              className="mt-2 h-px w-48 ml-auto"
              style={{
                background: "linear-gradient(to left, #5a3810, transparent)",
              }}
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Menu */}
        <MenuItems
          creating={creating}
          handleCreateRoom={() => createRoom(data?.user.id ?? "", router)}
          handleOpenJoin={handleOpenJoin}
          hoveredBtn={hoveredBtn}
          audio={audio}
        />

        {/* Bottom info */}
        <div className="flex items-end justify-between mt-6">
          <p
            className="font-cinzel text-[8px] tracking-[3px]"
            style={{ color: "rgba(80,55,20,1)" }}
          >
            v0.1.0 · EARLY ACCESS
          </p>
          <p
            className="font-cinzel text-[8px] tracking-[3px]"
            style={{ color: "rgba(80,55,20,0.5)" }}
          >
            {audioReady ? "♪ SOUND ON" : "CLICK TO ENABLE SOUND"}
          </p>
        </div>

        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20">
          <div className="w-125 h-screen">
            <CharacterSelect
              selectedClass={data?.user.character ?? "barbarian"}
            />
          </div>
        </div>
      </div>

      {/* ── Join Room Dialog ── */}
      <DialogJoinRoom
        audio={audio}
        code={code}
        codeError={codeError}
        handleJoin={() => handleJoin(data?.user.id ?? "", router)}
        joinOpen={joinOpen}
        joining={joining}
      />
    </div>
  );
}
