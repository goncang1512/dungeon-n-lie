import RolePageClient from "@/src/components/layouts/roll-page/roll-page-client";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";
import { pusher } from "@/src/lib/pusher/pusher";

interface Props {
  params: Promise<{ id: string }>;
}

const ROLE_POOL: UserRole[] = [
  "survivor",
  "survivor",
  "observer",
  "guardian",
  "analyst",
  "infiltrator",
  "catalyst",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Hanya jalankan distribute jika roleAssigned masih false.
 * Pakai updateMany dengan WHERE roleAssigned=false sebagai atomic check-and-set
 * supaya hanya SATU request yang berhasil distribute — sisanya skip otomatis.
 */
async function distributeRoles(
  matchId: string,
  userId: string,
): Promise<{ role: UserRole }> {
  // ── Cek cepat: sudah assigned? Return langsung tanpa transaksi ──────────
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { roleAssigned: true },
  });

  if (!match) throw new Error("Match not found");

  if (match.roleAssigned) {
    // Sudah pernah di-distribute — ambil role user ini
    const mu = await prisma.matchUser.findUnique({
      where: { userId_matchId: { userId, matchId } },
      select: { role: true },
    });
    return { role: mu!.role };
  }

  // ── Coba jadi "distributor" dengan atomic update ────────────────────────
  // updateMany hanya update jika roleAssigned masih false.
  // Kalau ada 6 request bersamaan, hanya 1 yang berhasil (count = 1),
  // sisanya dapat count = 0 dan langsung masuk jalur "tunggu".
  const claim = await prisma.match.updateMany({
    where: {
      id: matchId,
      roleAssigned: false, // ← atomic check: hanya update kalau masih false
    },
    data: {
      roleAssigned: true, // ← langsung set true sebelum assign role
    },
  });

  if (claim.count === 0) {
    // Request lain sudah lebih dulu claim → tunggu sampai role tersedia
    // Polling max 10 detik (20x × 500ms)
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 500));

      const mu = await prisma.matchUser.findUnique({
        where: { userId_matchId: { userId, matchId } },
        select: { role: true },
      });

      // Role sudah di-assign oleh distributor → return
      // Kita cek dengan cara sederhana: role != survivor default
      // Tapi lebih aman cek match.roleAssigned lagi
      const m = await prisma.match.findUnique({
        where: { id: matchId },
        select: { roleAssigned: true },
      });

      if (m?.roleAssigned && mu) {
        return { role: mu.role };
      }
    }

    // Timeout — fallback ambil role apapun yang ada
    const mu = await prisma.matchUser.findUnique({
      where: { userId_matchId: { userId, matchId } },
      select: { role: true },
    });
    return { role: mu?.role ?? "survivor" };
  }

  // ── Kita adalah distributor — assign semua role sekaligus ───────────────
  const matchUsers = await prisma.matchUser.findMany({
    where: { matchId },
    orderBy: { created_at: "asc" },
    select: { id: true, userId: true },
  });

  // Sesuaikan pool dengan jumlah player
  const playerCount = matchUsers.length;
  const pool = [...ROLE_POOL];

  if (playerCount < pool.length) {
    while (pool.length > playerCount) {
      const idx = [...pool].reverse().findIndex((r) => r !== "infiltrator");
      if (idx === -1) break;
      pool.splice(pool.length - 1 - idx, 1);
    }
  } else {
    while (pool.length < playerCount) pool.push("survivor");
  }

  const shuffled = shuffle(pool);

  // Update semua MatchUser — pakai Promise.all supaya paralel & cepat
  let myRole: UserRole = "survivor";
  await Promise.all(
    matchUsers.map((mu, i) => {
      if (mu.userId === userId) myRole = shuffled[i];
      return prisma.matchUser.update({
        where: { userId_matchId: { userId: mu.userId, matchId } },
        data: { role: shuffled[i] },
      });
    }),
  );

  await pusher.trigger(`match-${matchId}`, "roles-assigned", {
    roomId: matchId,
  });

  return { role: myRole };
}

export default async function RoleServerPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.result?.user;
  if (!user) redirect("/login");

  const matchUser = await prisma.matchUser.findFirst({
    where: {
      userId: user.id,
      match: { room_id: id },
    },
    include: {
      user: true,
      match: { select: { id: true, roleAssigned: true } },
    },
  });

  if (!matchUser) redirect("/");

  const { role } = await distributeRoles(matchUser.matchId, user.id);

  return (
    <RolePageClient
      matchId={id}
      userId={user.id}
      characterClass={matchUser.user.character ?? "barbarian"}
      initialRole={role}
    />
  );
}
