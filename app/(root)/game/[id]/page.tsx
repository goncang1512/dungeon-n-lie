import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StreamClient } from "@stream-io/node-sdk";

import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { JSX } from "react";
import GamePageInit from "@/src/components/layouts/game-layouts/init-game";

export interface GamePageProps {
  matchUserId: string;
  userId: string;
  matchId: string;
  username: string;
  role:
    | "survivor"
    | "observer"
    | "guardian"
    | "analyst"
    | "infiltrator"
    | "catalyst";
  streamToken: string;
  apiKey: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

// Ambil waktu UTC real dari Stream API.
// Endpoint ini adalah bagian dari Stream Dashboard — selalu tersedia.
// Jika gagal (timeout/network), fallback ke offset besar agar token tetap valid.
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

  // Fallback: mundurkan 5 menit dari jam lokal agar selalu valid
  // meski jam Windows drift hingga 4 menit
  return Math.floor(Date.now() / 1000) - 300;
}

export default async function GamePageServer({
  params,
}: Props): Promise<JSX.Element> {
  const id = (await params).id;

  const { result } = await auth.api.getSession({
    headers: await headers(),
  });

  const user = result?.user;
  if (!user) redirect("/sign-in");

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
      user: { select: { username: true } },
    },
  });

  if (!matchUser) redirect("/");

  const apiKey = process.env.NEXT_PUBLIC_KEY_STREAM;
  const apiSecret = process.env.NEXT_PUBLIC_SECRET_STREAM;

  if (!apiKey || !apiSecret) {
    throw new Error(
      `Stream env missing — NEXT_PUBLIC_KEY_STREAM: ${!!apiKey}, SECRET_STREAM: ${!!apiSecret}`,
    );
  }

  // iat dari waktu UTC nyata, bukan jam lokal Windows yang bisa drift
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
    role: matchUser.role as GamePageProps["role"],
    streamToken,
    apiKey,
  };

  return <GamePageInit {...props} />;
}
