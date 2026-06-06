"use client";

import { useCall } from "@stream-io/video-react-sdk";
import { useCallback } from "react";

type VoteEntry = { voter: string; target: string };

export function getMostVoted(voteTarget: VoteEntry[]): string | null {
  if (!voteTarget.length) return null;

  const tally: Record<string, number> = {};
  for (const { target } of voteTarget) {
    tally[target] = (tally[target] ?? 0) + 1;
  }

  const maxCount = Math.max(...Object.values(tally));
  const winners = Object.entries(tally)
    .filter(([, count]) => count === maxCount)
    .map(([id]) => id);

  // Jika seri, tidak ada yang dieliminasi (return null)
  return winners.length === 1 ? winners[0] : null;
}

/**
 * Hook untuk mute mic + video participant tertentu (by userId) via Stream SDK.
 * Hanya berhasil jika kita punya izin moderator, atau jika targetnya adalah diri sendiri.
 */
export function useVoteElimination() {
  const call = useCall();

  const muteParticipant = useCallback(
    async (targetUserId: string) => {
      if (!call) return;

      try {
        // Stream SDK: mute audio & video participant via server-side muting
        // Ini akan mute mereka untuk semua participant lain juga
        await call.muteUser(targetUserId, "audio");
        await call.muteUser(targetUserId, "video");
      } catch (err) {
        if (err instanceof Error) {
          console.error(
            "[VoteElimination] Gagal mute participant:",
            err.message,
          );
        }
      }
    },
    [call],
  );

  return { muteParticipant };
}
