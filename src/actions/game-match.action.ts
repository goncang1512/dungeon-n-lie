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
  stage: string | number | null,
  userId: string,
  room_id: string,
) => {
  await pusher.trigger(`match-${room_id}`, "match-game", {
    room_id: room_id,
    data: {
      stage,
      turn: userId,
    },
  });
};

export const conditionStage = async (
  stage: string | number | null,
  success: boolean,
  room_id: string,
) => {
  await pusher.trigger(`match-${room_id}`, "condition-game", {
    room_id: room_id,
    data: {
      stage,
      success,
    },
  });
};
