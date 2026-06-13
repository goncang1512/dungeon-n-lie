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

const LAST_STAGE = "5";

export function checkEndGame(
  alivePlayers: Player[],
  isLastStage: boolean,
): EndGamePayload | null {
  const infiltratorAlive = alivePlayers.some((p) => p.role === "infiltrator");

  if (!infiltratorAlive) {
    return { winner: "innocent", reason: "vote" };
  }

  if (alivePlayers.length <= 1) {
    return { winner: "infiltrator", reason: "last_man" };
  }

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

// Dipanggil setelah voting selesai
export async function resolveEndGame(
  matchPlayers: Player[],
  eliminatedUserId: string | null,
  currentStage: string,
  room_id: string,
): Promise<EndGamePayload | null> {
  const isLastStage = currentStage === LAST_STAGE;

  const alivePlayers = matchPlayers.filter(
    (p) => p.status !== "killed" && p.userId !== eliminatedUserId,
  );

  const endGamePayload = checkEndGame(alivePlayers, isLastStage);

  if (endGamePayload) {
    await triggerEndGame(endGamePayload, room_id);
  }

  return endGamePayload;
}
