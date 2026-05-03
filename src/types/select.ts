import { Prisma } from "@/generated/prisma/client";

export const match_user_select = {
  id: true,
  userId: true,
  matchId: true,
  ready: true,
  user: {
    select: {
      username: true,
    },
  },
} satisfies Prisma.MatchUserSelect;
