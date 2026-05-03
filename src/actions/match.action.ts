"use server";

import { prisma } from "../lib/prisma";
import { pusher } from "../lib/pusher/pusher";
import { PlayerMatch } from "../store/chat.store";

export async function generateRoomId(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export const createMatch = async (user_id: string) => {
  const result = await prisma.match.create({
    data: {
      room_id: await generateRoomId(),
      user_id,
      matchUsers: {
        create: {
          user: {
            connect: {
              id: user_id,
            },
          },
        },
      },
    },
  });

  return result;
};

export const joinMatch = async (room_id: string, user_id: string) => {
  const match = await prisma.match.findFirst({
    where: {
      room_id,
    },
    select: {
      id: true,
      room_id: true,
    },
  });

  const user = await prisma.matchUser.create({
    data: {
      matchId: match?.id as string,
      userId: user_id as string,
    },
    select: {
      id: true,
      userId: true,
      matchId: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  await pusher.trigger(`match-${room_id}`, "user-joined", {
    isYou: false,
    status: "waiting",
    id: user.id,
    user: {
      username: user.user.username,
    },
    ready: false,
    userId: user.userId,
    matchId: user.matchId,
  } as PlayerMatch);

  return match;
};

export const outMatch = async (match_id: string, user_id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({
      where: { id: match_id },
    });

    if (!match) throw new Error("Match not found");

    const isHost = match.user_id === user_id;

    // 1. Hapus user
    await tx.matchUser.delete({
      where: {
        userId_matchId: {
          userId: user_id,
          matchId: match_id,
        },
      },
    });

    // 2. Cek apakah masih ada player
    const remainingPlayer = await tx.matchUser.findFirst({
      where: { matchId: match_id },
      orderBy: { created_at: "asc" },
    });

    let newHostId: string | null = null;
    let deletedMatch = false;

    // ❗ Kalau tidak ada player sama sekali → hapus match
    if (!remainingPlayer) {
      await tx.match.delete({
        where: { id: match_id },
      });

      deletedMatch = true;
    }
    // ❗ Kalau masih ada player DAN yang keluar adalah host → pindah host
    else if (isHost) {
      await tx.match.update({
        where: { id: match_id },
        data: {
          user_id: remainingPlayer.userId,
        },
      });

      newHostId = remainingPlayer.userId;
    }

    return {
      userId: user_id,
      isHost,
      newHostId,
      deletedMatch,
      matchRoomId: match.room_id,
    };
  });

  // 🔥 Emit event
  await pusher.trigger(`match-${result.matchRoomId}`, "user-out", {
    userId: result.userId,
  });

  if (result.newHostId) {
    await pusher.trigger(`match-${result.matchRoomId}`, "host-changed", {
      user_id: result.newHostId,
    });
  }

  return result;
};
