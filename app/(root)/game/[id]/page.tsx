// app/(root)/game/[id]/page.tsx
// Server Component — fetch SEMUA data di sini, termasuk
// daftar semua pemain match. Tidak ada fetch di client.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StreamClient } from "@stream-io/node-sdk";
import { JSX } from "react";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import GamePage from "@/src/components/layouts/game-layouts/gampe-page";
import { MatchPlayer } from "@/src/components/layouts/game-layouts/game-wrapper";

// ── Props dikirim ke client ───────────────────────────────

export interface GamePageProps {
  matchUserId: string;
  userId: string;
  matchId: string;
  username: string;
  character: string; // User.character (CharUser enum)
  role:
    | "survivor"
    | "observer"
    | "guardian"
    | "analyst"
    | "infiltrator"
    | "catalyst";
  players: MatchPlayer[]; // ← semua pemain di match
  streamToken: string;
  apiKey: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

async function getRealUtcSeconds(): Promise<number> {
  const endpoints = [
    "https://hint.stream-io-api.com/time",
    "https://dashboard.getstream.io/time",
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) continue;
      const body = (await res.json()) as Record<string, unknown>;
      const epoch = body.epoch ?? body.unixtime ?? body.now ?? body.timestamp;
      if (typeof epoch === "number") return Math.floor(epoch);
    } catch {
      continue;
    }
  }
  return Math.floor(Date.now() / 1000) - 300;
}

export default async function GamePageServer({
  params,
}: Props): Promise<JSX.Element> {
  const id = (await params).id;

  const { result } = await auth.api.getSession({ headers: await headers() });
  const user = result?.user;
  if (!user) redirect("/sign-in");

  // ── 1. Fetch pemain lokal (untuk auth + role check) ───
  const matchUser = await prisma.matchUser.findFirst({
    where: {
      userId: user.id,
      match: { room_id: id },
    },
    select: {
      id: true,
      userId: true,
      matchId: true,
      role: true,
      user: {
        select: {
          username: true,
          character: true,
        },
      },
    },
  });

  if (!matchUser) redirect("/");

  // ── 2. Fetch SEMUA pemain di match (untuk GameState) ──
  const allMatchUsers = await prisma.matchUser.findMany({
    where: { matchId: matchUser.matchId },
    select: {
      userId: true,
      role: true,
      user: {
        select: {
          username: true,
          character: true,
        },
      },
    },
    orderBy: { created_at: "asc" },
  });

  const players: MatchPlayer[] = allMatchUsers.map((mu) => ({
    userId: mu.userId,
    displayName: mu.user.username,
    role: mu.role as MatchPlayer["role"],
    classId: mu.user.character as MatchPlayer["classId"],
  }));

  // ── 3. Generate Stream token ──────────────────────────
  const apiKey = process.env.NEXT_PUBLIC_KEY_STREAM;
  const apiSecret = process.env.NEXT_PUBLIC_SECRET_STREAM;

  if (!apiKey || !apiSecret) {
    throw new Error(
      `Stream env missing — KEY: ${!!apiKey}, SECRET: ${!!apiSecret}`,
    );
  }

  const utcNow = await getRealUtcSeconds();
  const streamClient = new StreamClient(apiKey, apiSecret);
  const streamToken = streamClient.generateUserToken({
    user_id: matchUser.userId,
    iat: utcNow - 10,
    validity_in_seconds: 3600,
  });

  const props: GamePageProps = {
    matchUserId: matchUser.id,
    userId: matchUser.userId,
    matchId: matchUser.matchId,
    username: matchUser.user.username,
    character: matchUser.user.character,
    role: matchUser.role as GamePageProps["role"],
    players, // ← semua pemain
    streamToken,
    apiKey,
  };

  return <GamePage {...props} />;
}
