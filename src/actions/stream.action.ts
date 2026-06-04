"use server";

import { StreamClient } from "@stream-io/node-sdk";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

const API_KEY = process.env.NEXT_PUBLIC_KEY_STREAM ?? "";
const API_SECRET = process.env.NEXT_PUBLIC_SECRET_STREAM ?? "";

interface RedirectToGameInput {
  matchId: string;
  userId: string;
}

export async function redirectToGame({
  matchId,
  userId,
}: RedirectToGameInput): Promise<void> {
  if (!API_KEY || !API_SECRET) {
    throw new Error("Stream credentials not configured in .env.local");
  }

  // ── 1. Ambil MatchUser dari Prisma ──────────────────────────
  //    Ini adalah row utama yang kita butuhkan:
  //    id, userId, matchId, role, user.username
  const matchUser = await prisma.matchUser.findUnique({
    where: {
      userId_matchId: { userId, matchId },
    },
    select: {
      id: true, // MatchUser.id
      userId: true, // → Stream user.id
      matchId: true, // → Stream callId
      role: true, // → ditampilkan di VideoTile (hanya self)
      user: {
        select: {
          username: true, // → Stream user.name
        },
      },
    },
  });

  if (!matchUser) {
    throw new Error(
      `MatchUser tidak ditemukan: userId=${userId} matchId=${matchId}`,
    );
  }

  // ── 2. Generate Stream token ─────────────────────────────────
  //    user_id = MatchUser.userId (bukan MatchUser.id)
  const streamClient = new StreamClient(API_KEY, API_SECRET);
  const token = streamClient.generateUserToken({ user_id: matchUser.userId });

  // ── 3. Redirect ke /game dengan semua params ─────────────────
  //    callId = matchUser.matchId (match unik = room unik)
  const params = new URLSearchParams({
    matchUserId: matchUser.id,
    userId: matchUser.userId,
    matchId: matchUser.matchId,
    userName: matchUser.user.username,
    role: matchUser.role,
    token,
  });

  redirect(`/game?${params.toString()}`);
}

// ── Standalone token generator (jika dibutuhkan terpisah) ────
export async function generateStreamToken(
  userId: string,
): Promise<{ token: string } | { error: string }> {
  if (!API_KEY || !API_SECRET) {
    return { error: "Stream credentials not configured." };
  }
  try {
    const client = new StreamClient(API_KEY, API_SECRET);
    return { token: client.generateUserToken({ user_id: userId }) };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Token generation failed.",
    };
  }
}
