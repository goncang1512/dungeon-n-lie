"use server";

import { $Enums } from "@/generated/prisma/client";
import { prisma } from "../lib/prisma";

type UserRole = $Enums.UserRole;

const ROLE_POOL: UserRole[] = [
  "survivor",
  "survivor",
  "observer",
  "guardian",
  "analyst",
  "infiltrator",
  "catalyst",
];

interface AssignRoleInput {
  matchId: string;
  userId: string;
}

interface AssignRoleResult {
  role?: UserRole;
  error?: string;
}

export async function assignRole({
  matchId,
  userId,
}: AssignRoleInput): Promise<AssignRoleResult> {
  try {
    const existing = await prisma.matchUser.findUnique({
      where: { userId_matchId: { userId, matchId } },
      select: {
        role: true,
        match: { select: { roleAssigned: true } },
      },
    });

    if (!existing) {
      return { error: "Player not found in this match." };
    }

    if (existing.match.roleAssigned) {
      return { role: existing.role };
    }

    const chosen = await prisma.$transaction(
      async (tx) => {
        // 1. Lock baris Match
        const lockedMatch = await tx.$queryRaw<{ roleAssigned: boolean }[]>`
          SELECT "roleAssigned"
          FROM "Match"
          WHERE "id" = ${matchId}
          FOR UPDATE
        `;

        // 2. Double-check setelah lock
        if (lockedMatch[0]?.roleAssigned) {
          const mu = await tx.matchUser.findUnique({
            where: { userId_matchId: { userId, matchId } },
            select: { role: true },
          });
          return mu!.role;
        }

        // 3. Ambil role yang sudah terpakai
        const takenRows = await tx.$queryRaw<{ role: UserRole }[]>`
          SELECT role FROM "MatchUser"
          WHERE "matchId" = ${matchId}
          FOR SHARE
        `;

        const taken = takenRows.map((r) => r.role);

        // 4. Hitung available
        const available = [...ROLE_POOL];
        for (const t of taken) {
          const idx = available.indexOf(t);
          if (idx !== -1) available.splice(idx, 1);
        }

        if (available.length === 0) {
          throw new Error("All roles have been assigned.");
        }

        // 5. Pilih acak
        const pick = available[Math.floor(Math.random() * available.length)];

        // 6. Update role di MatchUser
        await tx.matchUser.update({
          where: { userId_matchId: { userId, matchId } },
          data: { role: pick },
        });

        // 7. Update roleAssigned di Match
        await tx.match.update({
          where: { id: matchId },
          data: { roleAssigned: true },
        });

        return pick;
      },
      {
        isolationLevel: "Serializable",
        timeout: 10_000,
      },
    );

    return { role: chosen };
  } catch (err: unknown) {
    console.error("[assignRole]", err);
    const msg = err instanceof Error ? err.message : "";

    if (msg.includes("All roles")) {
      return { error: "All roles have been assigned." };
    }
    if (msg.includes("P2034")) {
      return { error: "Dungeon is busy. Please retry." };
    }

    return { error: "System failure. The dungeon did not respond." };
  }
}
