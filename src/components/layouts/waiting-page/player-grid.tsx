import { authClient } from "@/src/lib/auth/client";
import { Corners, PlayerCard } from "./player-card";
import { useChatStore } from "@/src/store/chat.store";
import { matchStore } from "@/src/store/room.store";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import { startTransition, useMemo } from "react";
import { readyMatch } from "@/src/actions/match.action";

export default function PlayerGrid({ match_id }: { match_id: string }) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const { outMatch, loading } = matchStore(
    useShallow((state) => ({
      outMatch: state.outMatch,
      loading: state.loading,
    })),
  );

  const { setValue, players } = useChatStore(
    useShallow((state) => ({
      setValue: state.setValue,
      players: state.players,
    })),
  );

  const isReadyMatch = useMemo(() => {
    const on_ready = players.find((item) => item.userId === data?.user.id);
    return on_ready?.ready ?? false;
  }, [players, data?.user]);

  const isHost = useMemo(() => {
    const res = players.find((item) => item.userId === data?.user.id);
    const hasil = res?.status === "host" && isReadyMatch;

    return hasil;
  }, [players, data?.user, isReadyMatch]);

  const toggleReady = () => {
    const newReady = !isReadyMatch;

    // Optimistic update langsung di array players
    const currentPlayers = useChatStore.getState().players;
    setValue(
      "players",
      currentPlayers.map((p) =>
        p.userId === data?.user.id ? { ...p, ready: newReady } : p,
      ),
    );

    startTransition(async () => {
      await readyMatch(match_id, data?.user.id ?? "", newReady);
    });
  };

  return (
    <div className="flex-1">
      <p
        className="font-cinzel text-[8px] tracking-[3px] mb-3"
        style={{ color: "rgba(120,80,20,0.45)" }}
      >
        BOUND SOULS
      </p>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => {
          const player = players[i] ?? null;
          return (
            // ✅ key pakai userId jika ada, fallback ke index
            // Dengan ini React tahu persis komponen mana yang berubah
            <PlayerCard
              key={player?.userId ?? `empty-slot-${i}`}
              player={player}
            />
          );
        })}
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={toggleReady}
          className="relative flex-2 font-cinzel text-[9px] tracking-[2.5px] py-3 rounded-sm transition-all duration-300"
          style={{
            background: isReadyMatch
              ? "rgba(64,204,96,0.1)"
              : "rgba(80,50,10,0.2)",
            border: isReadyMatch
              ? "1px solid rgba(64,204,96,0.6)"
              : "1px solid #5a3f1c",
            color: isReadyMatch ? "#40cc60" : "#e0a83a",
            boxShadow: isReadyMatch
              ? "0 0 20px rgba(64,204,96,0.15)"
              : "0 0 20px rgba(224,168,58,0.08)",
          }}
        >
          <Corners
            color={isReadyMatch ? "rgba(64,204,96,0.5)" : "#5a3f1c"}
            size="w-2 h-2"
          />
          {isReadyMatch ? "✦ BOUND TO THE VOID" : "⚔ SWEAR THE OATH"}
        </button>
        {isHost && (
          <button
            className="flex-1 font-cinzel text-[9px] tracking-[2px] py-3 rounded-sm transition-all duration-200 cursor-pointer"
            style={{
              background: "transparent",
              border: "1px solid #3a2810",
              color: "#5a3d18",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#8b2222";
              e.currentTarget.style.color = "#8b2222";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3a2810";
              e.currentTarget.style.color = "#5a3d18";
            }}
          >
            MATCH
          </button>
        )}
        <button
          onClick={() => outMatch(match_id, data?.user.id ?? "", router)}
          className="flex-1 font-cinzel text-[9px] tracking-[2px] py-3 rounded-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-3"
          style={{
            background: "transparent",
            border: "1px solid #3a2810",
            color: "#5a3d18",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#8b2222";
            e.currentTarget.style.color = "#8b2222";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#3a2810";
            e.currentTarget.style.color = "#5a3d18";
          }}
        >
          {loading && (
            <span
              className="inline-block w-3 h-3 border border-current rounded-full animate-spin"
              style={{ borderTopColor: "transparent" }}
            />
          )}
          OUT
        </button>
      </div>
    </div>
  );
}
