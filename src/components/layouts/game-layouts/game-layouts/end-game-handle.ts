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

export function checkEndGame(
  alivePlayers: Player[],
  isLastStage: boolean,
): EndGamePayload | null {
  const infiltratorAlive = alivePlayers.some((p) => p.role === "infiltrator");

  // Infiltrator sudah dieliminasi → innocent menang
  if (!infiltratorAlive) {
    return { winner: "innocent", reason: "vote" };
  }

  // Hanya 1 player tersisa dan itu infiltrator → infiltrator menang
  if (alivePlayers.length <= 1) {
    return { winner: "infiltrator", reason: "last_man" };
  }

  // Stage terakhir ("5") selesai dan infiltrator masih hidup → infiltrator menang
  if (isLastStage && infiltratorAlive) {
    return { winner: "infiltrator", reason: "last_stage" };
  }

  return null;
}

export function handleEndGameEvent(
  data: EndGamePayload,
  setValue: EngineType["setValue"],
) {
  setValue("winner", data.winner);
}

export async function resolveEndGame(
  matchPlayers: Player[],
  eliminatedUserId: string | null,
  currentStage: string,
  room_id: string,
): Promise<EndGamePayload | null> {
  const LAST_STAGE = "5";
  const isLastStage = currentStage === LAST_STAGE;

  // Hitung sisa player hidup setelah eliminasi ini
  const alivePlayers = matchPlayers.filter(
    (p) => p.status !== "killed" && p.userId !== eliminatedUserId,
  );

  const endGamePayload = checkEndGame(alivePlayers, isLastStage);

  if (endGamePayload) {
    await triggerEndGame(endGamePayload, room_id);
  }

  return endGamePayload;
}
