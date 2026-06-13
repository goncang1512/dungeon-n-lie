import {
  EndGamePayload,
  triggerEndGame,
} from "@/src/actions/game-match.action";
import { EngineType } from "@/src/store/game.store";

type Player = {
  userId: string;
  role: string;
  status: "life" | "killed";
};

export function checkEndGame(alivePlayers: Player[]): EndGamePayload | null {
  const infiltratorAlive = alivePlayers.some((p) => p.role === "infiltrator");
  const innocentsAlive = alivePlayers.filter((p) => p.role !== "infiltrator");

  // Infiltrator mati → innocent menang (priority tertinggi)
  if (!infiltratorAlive) {
    return { winner: "innocent", reason: "vote" };
  }

  // Tidak ada innocent tersisa → infiltrator menang
  if (innocentsAlive.length === 0) {
    return { winner: "infiltrator", reason: "last_man" };
  }

  return null;
}

export function handleEndGameEvent(
  data: EndGamePayload,
  setValue: EngineType["setValue"],
) {
  setValue("winner", data.winner);
}

// Dipanggil setelah voting selesai
// isLastStage TIDAK dicek di sini — itu urusan server (conditionStage)
export async function resolveEndGame(
  matchPlayers: Player[],
  eliminatedUserId: string | null,
  room_id: string,
): Promise<EndGamePayload | null> {
  const alivePlayers = matchPlayers.filter(
    (p) => p.status !== "killed" && p.userId !== eliminatedUserId,
  );

  const endGamePayload = checkEndGame(alivePlayers);

  if (endGamePayload) {
    await triggerEndGame(endGamePayload, room_id);
  }

  return endGamePayload;
}
