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

// Role opsional — urutan prioritas dari kiri ke kanan
const OPTIONAL_ROLES: UserRole[] = [
  "survivor",
  "observer",
  "guardian",
  "analyst",
  "catalyst",
  "survivor", // survivor kedua untuk game 7 player
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
 * Bangun pool role dengan jaminan:
 * - Selalu ada tepat 1 infiltrator
 * - Tidak ada duplikasi kecuali survivor
 * - Jumlah role = playerCount
 */
function buildRolePool(playerCount: number): UserRole[] {
  // Wajib: 1 infiltrator
  const pool: UserRole[] = ["infiltrator"];

  // Sisa slot diisi dari optional secara berurutan
  const remaining = playerCount - 1;
  const fillers = OPTIONAL_ROLES.slice(0, remaining);

  // Kalau player lebih dari slot optional, tambah survivor
  while (fillers.length < remaining) {
    fillers.push("survivor");
  }

  return shuffle([...pool, ...fillers]);
}

/**
 * Distribute roles atomically.
 * Hanya 1 client yang jadi distributor via atomic updateMany WHERE roleAssigned=false.
 * Client lain polling sampai role tersedia.
 */
async function distributeRoles(
  matchId: string,
  userId: string,
): Promise<{ role: UserRole }> {
  // Cek cepat apakah sudah pernah di-assign
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { roleAssigned: true },
  });

  if (!match) throw new Error("Match not found");

  if (match.roleAssigned) {
    // Sudah di-assign sebelumnya — ambil role user ini langsung
    const mu = await prisma.matchUser.findUnique({
      where: { userId_matchId: { userId, matchId } },
      select: { role: true },
    });
    return { role: mu?.role ?? "survivor" };
  }

  // Coba jadi distributor dengan atomic update
  // Hanya 1 dari N concurrent request yang berhasil (count = 1)
  const claim = await prisma.match.updateMany({
    where: {
      id: matchId,
      roleAssigned: false, // atomic guard
    },
    data: {
      roleAssigned: true,
    },
  });

  if (claim.count === 0) {
    // Request lain sudah claim duluan — polling sampai role tersedia
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 500));

      const [mu, m] = await Promise.all([
        prisma.matchUser.findUnique({
          where: { userId_matchId: { userId, matchId } },
          select: { role: true },
        }),
        prisma.match.findUnique({
          where: { id: matchId },
          select: { roleAssigned: true },
        }),
      ]);

      if (m?.roleAssigned && mu?.role) {
        return { role: mu.role };
      }
    }

    // Timeout fallback
    const mu = await prisma.matchUser.findUnique({
      where: { userId_matchId: { userId, matchId } },
      select: { role: true },
    });
    return { role: mu?.role ?? "survivor" };
  }

  // ── Kita adalah distributor ────────────────────────────────────────────
  const matchUsers = await prisma.matchUser.findMany({
    where: { matchId },
    orderBy: { created_at: "asc" },
    select: { id: true, userId: true },
  });

  const playerCount = matchUsers.length;
  const shuffled = buildRolePool(playerCount);

  console.log(
    `[ROLES] distributing ${playerCount} roles:`,
    shuffled.join(", "),
  );

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
