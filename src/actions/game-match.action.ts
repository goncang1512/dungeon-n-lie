"use server";

// ─────────────────────────────────────────────────────────
// match.action.ts
// Server action — fetch semua pemain di satu match.
// Dipanggil dari GameWrapper (client) setelah Stream ready.
//
// Query: MatchUser.findMany + include User
//   → map ke MatchPlayer[]
// ─────────────────────────────────────────────────────────

import { prisma } from "@/src/lib/prisma";
import { MatchPlayer } from "../components/layouts/game-layouts/game-wrapper";
import { pusher } from "../lib/pusher/pusher";
import { EngineType } from "../store/game.store";
import { getNextStage } from "../components/layouts/game-layouts/game-layouts/story-line";

// ── Return type ───────────────────────────────────────────

export type GetMatchPlayersResult =
  | { ok: true; players: MatchPlayer[] }
  | { ok: false; error: string };

// ── Server Action ──────────────────────────────────────────

export async function getMatchPlayers(
  matchId: string,
): Promise<GetMatchPlayersResult> {
  try {
    const matchUsers = await prisma.matchUser.findMany({
      where: { matchId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            character: true, // CharUser enum → classId
          },
        },
      },
      orderBy: {
        created_at: "asc", // urutan konsisten untuk slot video kiri/kanan
      },
    });

    if (matchUsers.length === 0) {
      return {
        ok: false,
        error: "Match tidak ditemukan atau belum ada pemain.",
      };
    }

    // Map Prisma row → MatchPlayer
    // CharUser dan DndClassId punya nilai string yang identik
    // sehingga tidak perlu konversi manual.
    const players: MatchPlayer[] = matchUsers.map((mu) => ({
      userId: mu.userId,
      status: mu.status,
      displayName: mu.user.username,
      role: mu.role as MatchPlayer["role"],
      classId: mu.user.character as MatchPlayer["classId"],
    }));

    return { ok: true, players };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[getMatchPlayers]", message);
    return { ok: false, error: message };
  }
}

export const nextTurn = async (
  stage: string | null,
  userId: string,
  room_id: string,
) => {
  await prisma.match.update({
    where: {
      room_id,
    },
    data: {
      stage: String(stage),
      turn: userId,
    },
  });

  await pusher.trigger(`match-${room_id}`, "match-game", {
    room_id: room_id,
    data: {
      stage,
      turn: userId,
    },
  });
};

// game-match.action.ts
export const conditionStage = async (
  stage: string | null,
  success: boolean,
  room_id: string,
  choice: string,
) => {
  // 1. Broadcast hasil roll ke semua client
  await pusher.trigger(`match-${room_id}`, "condition-game", {
    room_id,
    data: { stage, success, choice },
  });

  // 2. Hitung next turn di server — satu sumber kebenaran, tidak race condition
  const match = await prisma.match.findFirst({
    where: { room_id },
    select: {
      turn: true,
      matchUsers: {
        where: { status: "life" }, // hanya yang masih hidup
        select: { userId: true },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!match) return;

  const alivePlayers = match.matchUsers;
  if (!alivePlayers.length) return;

  const currentIndex = alivePlayers.findIndex((p) => p.userId === match.turn);
  const nextIndex =
    (currentIndex === -1 ? 0 : currentIndex + 1) % alivePlayers.length;
  const nextUserId = alivePlayers[nextIndex].userId;
  const nextStage = getNextStage(String(stage));

  // 3. Tunggu 5 detik (sesuai delay di client), lalu advance
  await new Promise((r) => setTimeout(r, 5000));

  await nextTurn(nextStage, nextUserId, room_id);
};

export const voteTargetHandle = async (
  room_id: string,
  voteTarget: EngineType["voteTarget"],
) => {
  await pusher.trigger(`match-${room_id}`, "vote-game", voteTarget);
};

export const eliminatedTarget = async (
  voteResult: EngineType["voteResult"],
  room_id: string,
) => {
  await prisma.matchUser.updateMany({
    where: {
      userId: voteResult.userId,
      match: {
        room_id,
      },
    },
    data: {
      status: "killed",
    },
  });
  await pusher.trigger(`match-${room_id}`, "eliminated-vote", voteResult);
};

export type EndGameWinner = "infiltrator" | "innocent";

export type EndGamePayload = {
  winner: EndGameWinner;
  reason: "vote" | "last_man" | "last_stage";
};

export const triggerEndGame = async (
  payload: EndGamePayload,
  room_id: string,
) => {
  const data = await prisma.match.update({
    where: {
      room_id,
    },
    data: {
      status: "finish",
      stage: null,
      turn: "",
    },
    select: {
      id: true,
    },
  });

  await prisma.matchUser.deleteMany({
    where: {
      matchId: data.id,
    },
  });

  await pusher.trigger(`match-${room_id}`, "end-game", payload);
};
