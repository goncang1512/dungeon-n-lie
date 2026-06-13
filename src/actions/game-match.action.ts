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

export const conditionStage = async (
  stage: string | null,
  success: boolean,
  room_id: string,
  choice: string,
  eliminatedUserId?: string, // ← tambah ini
) => {
  await pusher.trigger(`match-${room_id}`, "condition-game", {
    room_id,
    data: { stage, success, choice },
  });

  const match = await prisma.match.findFirst({
    where: { room_id },
    select: {
      turn: true,
      matchUsers: {
        where: { status: "life" },
        select: { userId: true, role: true },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!match) return;

  const alivePlayers = match.matchUsers;

  if (!alivePlayers.length) return;

  const nextStage = getNextStage(String(stage));

  if (nextStage === null) {
    const infiltratorAlive = alivePlayers.some((p) => p.role === "infiltrator");
    await triggerEndGame(
      {
        winner: infiltratorAlive ? "infiltrator" : "innocent",
        reason: "last_stage",
      },
      room_id,
    );
    return;
  }

  const isCurrentDiscuss = String(stage).startsWith("discuss");
  const isCurrentNight = String(stage).startsWith("night");

  let nextUserId: string;

  // Tentukan current turn — kalau yang sedang turn adalah yang dieliminasi,
  // anggap currentTurn tidak ada (fallback ke index 0)
  const effectiveTurn =
    eliminatedUserId && match.turn === eliminatedUserId ? null : match.turn;

  if (isCurrentDiscuss || isCurrentNight) {
    nextUserId =
      effectiveTurn && effectiveTurn.length > 0
        ? effectiveTurn
        : alivePlayers[0].userId;
  } else {
    const currentIndex = alivePlayers.findIndex(
      (p) => p.userId === effectiveTurn,
    );
    const nextIndex =
      (currentIndex === -1 ? 0 : currentIndex + 1) % alivePlayers.length;
    nextUserId = alivePlayers[nextIndex].userId;
  }

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

// game-match.action.ts
export const infiltratorKill = async (
  targetUserId: string | null,
  room_id: string,
) => {
  if (targetUserId) {
    await prisma.matchUser.updateMany({
      where: { userId: targetUserId, match: { room_id } },
      data: { status: "killed" },
    });

    const target = await prisma.matchUser.findFirst({
      where: { userId: targetUserId, match: { room_id } },
      select: {
        role: true,
        user: { select: { username: true, character: true } },
      },
    });

    await pusher.trigger(`match-${room_id}`, "eliminated-vote", {
      userId: targetUserId,
      role: target?.role ?? "",
      name: target?.user.username ?? "",
      character: target?.user.character ?? "",
    });
  }

  await pusher.trigger(`match-${room_id}`, "infiltrator-kill", {
    userId: targetUserId,
  });

  // Cek end game langsung di sini — jangan tunggu client
  const match = await prisma.match.findFirst({
    where: { room_id },
    select: {
      stage: true,
      turn: true,
      matchUsers: {
        select: { userId: true, status: true, role: true },
      },
    },
  });

  if (!match) return;

  const alivePlayers = match.matchUsers.filter((p) => p.status === "life");
  const aliveInnocents = alivePlayers.filter((p) => p.role !== "infiltrator");
  const aliveInfiltrator = alivePlayers.find((p) => p.role === "infiltrator");

  // Infiltrator menang jika tidak ada innocent yang tersisa
  if (aliveInnocents.length === 0 && aliveInfiltrator) {
    console.log(`[END GAME] infiltrator menang — last_man`);
    await triggerEndGame(
      { winner: "infiltrator", reason: "last_man" },
      room_id,
    );
    return;
  }

  // Infiltrator kalah jika tidak ada lagi
  if (!aliveInfiltrator) {
    console.log(`[END GAME] innocent menang — infiltrator mati`);
    await triggerEndGame({ winner: "innocent", reason: "last_man" }, room_id);
    return;
  }

  // Belum end game — lanjut ke stage berikutnya
  const nextStage = getNextStage(String(match.stage));

  console.log(
    `[NIGHT] infiltrator kill: ${targetUserId ?? "skip"} | ${match.stage} → ${nextStage}`,
  );

  await nextTurn(nextStage, match.turn ?? "", room_id);
};

// infiltratorSkip cukup panggil infiltratorKill dengan null
export const infiltratorSkip = async (room_id: string) => {
  await infiltratorKill(null, room_id);
};
