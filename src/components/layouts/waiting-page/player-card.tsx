import { PlayerMatch, status_player } from "@/src/store/chat.store";

export function PlayerCard({ player }: { player: PlayerMatch | null }) {
  if (!player) {
    return (
      <div
        className="relative rounded-sm flex flex-col items-center justify-center min-h-30"
        style={{ background: "rgba(10,7,3,0.6)", border: "1px dashed #2a1c08" }}
      >
        <div
          className="w-8 h-8 rounded-full border border-dashed mb-2"
          style={{ borderColor: "#2a1c08" }}
        />
        <p
          className="font-cinzel text-[8px] tracking-[2px]"
          style={{ color: "#2a1c08" }}
        >
          AWAITING SOUL
        </p>
      </div>
    );
  }
  const colors: Record<status_player, string> = {
    ready: "#40cc60",
    waiting: "#a07828",
    host: "#c8882a",
  };
  const labels: Record<status_player, string> = {
    ready: "READY",
    waiting: "WAITING",
    host: "HOST",
  };
  const initials = player.user.username.slice(0, 2).toUpperCase();
  return (
    <div
      className="relative rounded-sm flex flex-col items-center justify-center gap-2 min-h-30 p-4 transition-all duration-300"
      style={{
        background: player.isYou ? "rgba(28,20,6,0.95)" : "rgba(16,11,4,0.88)",
        border: player.isYou ? "1px solid #c8882a" : "1px solid #3a2810",
        boxShadow: player.isYou
          ? "0 0 20px rgba(200,136,42,0.12), inset 0 0 16px rgba(200,136,42,0.05)"
          : "none",
      }}
    >
      <Corners color={player.isYou ? "#c8882a" : "#3a2810"} size="w-2 h-2" />
      {player.status === "host" && (
        <div
          className="absolute -top-px left-4 w-10 h-0.5"
          style={{
            background: "#c8882a",
            boxShadow: "0 0 6px rgba(200,136,42,0.5)",
          }}
        />
      )}
      <div
        className="relative w-12 h-12 rounded-full flex items-center justify-center font-cinzel font-bold text-[14px]"
        style={{
          background: `${colors[player.status]}18`,
          border: `1px solid ${colors[player.status]}`,
          color: colors[player.status],
          boxShadow: `0 0 10px ${colors[player.status]}44`,
        }}
      >
        {initials}
        {player.status === "ready" && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ border: `1px solid ${colors.ready}`, opacity: 0.35 }}
          />
        )}
      </div>
      <p
        className="font-cinzel text-[9px] tracking-[1.5px] text-center truncate w-full"
        style={{ color: player.isYou ? "#e0a83a" : "#9a7030" }}
      >
        {player.user.username}
        {player.isYou && (
          <span className="ml-1" style={{ color: "#5a3d18" }}>
            (YOU)
          </span>
        )}
      </p>
      <div
        className="px-2 py-0.5 rounded-sm"
        style={{
          background: `${colors[player.status]}15`,
          border: `1px solid ${colors[player.status]}55`,
        }}
      >
        <p
          className="font-cinzel text-[7px] tracking-[2px]"
          style={{ color: colors[player.status] }}
        >
          {labels[player.status]}
        </p>
      </div>
    </div>
  );
}

// ─── Corner ornament ────────────────────────────────────────────────────────
export function Corners({
  color = "#e0a83a",
  size = "w-2.5 h-2.5",
}: {
  color?: string;
  size?: string;
}) {
  const s: React.CSSProperties = { borderColor: color };
  return (
    <>
      <span
        className={`absolute top-0.75 left-0.75 ${size} border-t border-l pointer-events-none`}
        style={s}
      />
      <span
        className={`absolute top-0.75 right-0.75 ${size} border-t border-r pointer-events-none`}
        style={s}
      />
      <span
        className={`absolute bottom-0.75 left-0.75 ${size} border-b border-l pointer-events-none`}
        style={s}
      />
      <span
        className={`absolute bottom-0.75 right-0.75 ${size} border-b border-r pointer-events-none`}
        style={s}
      />
    </>
  );
}
