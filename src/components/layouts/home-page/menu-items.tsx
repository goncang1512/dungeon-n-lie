import { authClient } from "@/src/lib/auth/client";
import { DungeonAudio } from "./dungeon-audio";
import { matchStore } from "@/src/store/room.store";
import { useShallow } from "zustand/shallow";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MenuItemsProps {
  handleCreateRoom: () => void;
  creating: boolean;
  handleOpenJoin: () => void;
  hoveredBtn: string | null;
  audio: DungeonAudio;
}

export default function MenuItems({
  creating,
  handleCreateRoom,
  handleOpenJoin,
  hoveredBtn,
  audio,
}: MenuItemsProps) {
  const router = useRouter();
  const [loadingSign, setLoadingSign] = useState(false);
  const { setValue } = matchStore(
    useShallow((state) => ({ setValue: state.setValue })),
  );

  const menuItems = [
    {
      id: "create",
      label: "ENTER THE VOID",
      sub: "CREATE MATCHMAKING · OPEN LOBBY",
      action: handleCreateRoom,
      loading: creating,
    },
    {
      id: "join",
      label: "BREACH THE GATE",
      sub: "JOIN WITH CIPHER · ENTER ROOM CODE",
      action: handleOpenJoin,
      loading: false,
    },
    {
      id: "records",
      label: "THE ARCHIVES",
      sub: "CHRONICLES · PAST BATTLES · LEADERBOARD",
      action: () => {
        audio.resume();
        audio.playClick();
      },
      loading: false,
    },
    {
      id: "settings",
      label: "CHARACTER",
      sub: "PROFILE · RELICS",
      action: () => {
        router.push("/character");
      },
      loading: false,
    },
    {
      id: "signout",
      label: "SIGN OUT",
      sub: "",
      action: async () => {
        await authClient.signOut({
          onRequest: () => {
            setLoadingSign(true);
          },
          onError: () => {
            setLoadingSign(false);
          },
          onSuccess: () => {
            router.push("/sign");
            setLoadingSign(false);
          },
        });
      },
      loading: loadingSign,
    },
  ];

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      {menuItems.map((item) => {
        const isHovered = hoveredBtn === item.id;
        return (
          <button
            key={item.id}
            onClick={item.action}
            disabled={item.loading}
            onMouseEnter={() => setValue("hoveredBtn", item.id)}
            onMouseLeave={() => setValue("hoveredBtn", null)}
            className="relative text-left transition-all duration-300 overflow-hidden"
            style={{
              background: isHovered
                ? "rgba(32,22,8,0.96)"
                : "rgba(18,12,5,0.88)",
              border: isHovered ? "1px solid #e0a83a" : "1px solid #3a2810",
              padding: "14px 20px",
              borderRadius: "2px",
              backdropFilter: "blur(8px)",
              boxShadow: isHovered
                ? "0 0 30px rgba(224,168,58,0.15), inset 0 0 20px rgba(224,168,58,0.04)"
                : "0 4px 20px rgba(0,0,0,0.5)",
              cursor: item.loading ? "not-allowed" : "pointer",
              opacity: item.loading ? 0.7 : 1,
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300"
              style={{
                background: isHovered
                  ? "linear-gradient(to bottom, transparent, #e0a83a, transparent)"
                  : "linear-gradient(to bottom, transparent, #5a3810, transparent)",
                boxShadow: isHovered ? "0 0 8px rgba(224,168,58,0.4)" : "none",
              }}
            />
            <span
              className="absolute top-0.75 left-1 w-2 h-2"
              style={{
                borderTop: `1px solid ${isHovered ? "#e0a83a" : "#3a2810"}`,
                borderLeft: `1px solid ${isHovered ? "#e0a83a" : "#3a2810"}`,
              }}
            />
            <span
              className="absolute top-0.75 right-1 w-2 h-2"
              style={{
                borderTop: `1px solid ${isHovered ? "#e0a83a" : "#3a2810"}`,
                borderRight: `1px solid ${isHovered ? "#e0a83a" : "#3a2810"}`,
              }}
            />
            <div className="pl-2">
              <div
                className="font-cinzel font-semibold tracking-[3px] text-[13px] transition-all duration-300"
                style={{ color: isHovered ? "#e0a83a" : "#9a7030" }}
              >
                {item.loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 border border-current rounded-full animate-spin"
                      style={{ borderTopColor: "transparent" }}
                    />
                    {item.id === "create" ? "FORGING REALM..." : "BREACHING..."}
                  </span>
                ) : (
                  item.label
                )}
              </div>
              <div
                className="font-cinzel text-[8px] tracking-[2px] mt-1 transition-all duration-300"
                style={{
                  color: isHovered
                    ? "rgba(160,120,40,0.7)"
                    : "rgba(80,55,20,0.6)",
                }}
              >
                {item.sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
