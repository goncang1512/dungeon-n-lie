import { authClient } from "@/src/lib/auth/client";
import { Corners, PlayerCard } from "./player-card";
import { useChatStore } from "@/src/store/chat.store";
import { matchStore } from "@/src/store/room.store";
import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";

export default function PlayerGrid({ match_id }: { match_id: string }) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const { outMatch, loading } = matchStore(
    useShallow((state) => ({
      outMatch: state.outMatch,
      loading: state.loading,
    })),
  );

  const { messages, setValue, isReady, players } = useChatStore(
    useShallow((state) => ({
      setValue: state.setValue,
      messages: state.messages,
      isReady: state.isReady,
      players: state.players,
    })),
  );

  const toggleReady = () => {
    setValue("isReady", !isReady);
    setValue("messages", [
      ...messages,
      {
        sender: "SYSTEM",
        text: `You are now ${!isReady ? "READY" : "STANDING DOWN"}.`,
        isSystem: true,
      },
    ]);
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
        {Array.from({ length: 6 }).map((_, i) => (
          <PlayerCard key={i} player={players[i] ?? null} />
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={toggleReady}
          className="relative flex-2 font-cinzel text-[9px] tracking-[2.5px] py-3 rounded-sm transition-all duration-300"
          style={{
            background: isReady ? "rgba(64,204,96,0.1)" : "rgba(80,50,10,0.2)",
            border: isReady
              ? "1px solid rgba(64,204,96,0.6)"
              : "1px solid #5a3f1c",
            color: isReady ? "#40cc60" : "#e0a83a",
            boxShadow: isReady
              ? "0 0 20px rgba(64,204,96,0.15)"
              : "0 0 20px rgba(224,168,58,0.08)",
          }}
        >
          <Corners
            color={isReady ? "rgba(64,204,96,0.5)" : "#5a3f1c"}
            size="w-2 h-2"
          />
          {isReady ? "✦ BOUND TO THE VOID" : "⚔ SWEAR THE OATH"}
        </button>
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
          FLEE
        </button>
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
