"use client";

// game-wrapper.tsx
// Menerima players[] langsung dari server — tidak ada fetch di sini.
// Buat initialState lalu render GameProvider + GameUI.

import { useMemo, JSX, useEffect } from "react";
import { GameProvider, createInitialState } from "./game-layouts/game-state";
import { GameUI } from "./game-ui";
import { DndClassId } from "./game-layouts/init-game";
import { useParams } from "next/navigation";
import {
  handleTurnCondition,
  handleTurnGame,
  HandleTurnGameType,
  pusherClientMatch,
  TurnConditionType,
} from "@/src/lib/pusher/match.pusher";
import { useEngine } from "@/src/store/game.store";
import { useShallow } from "zustand/shallow";
import { $Enums } from "@/generated/prisma/client";

export interface MatchPlayer {
  userId: string;
  displayName: string;
  role:
    | "survivor"
    | "observer"
    | "guardian"
    | "analyst"
    | "infiltrator"
    | "catalyst";
  classId: DndClassId;
  status: $Enums.PlayerStatus;
}

// ── Props ─────────────────────────────────────────────────

interface GameWrapperProps {
  userId: string;
  role: MatchPlayer["role"];
  classId: string;
  players: MatchPlayer[]; // ← diterima dari server, tidak di-fetch
  timeLimit?: number;
}

// ── GameWrapper ───────────────────────────────────────────

export function GameWrapper({
  userId,
  role,
  players,
  timeLimit = 300,
}: GameWrapperProps): JSX.Element {
  const params = useParams();
  const { setValue } = useEngine(
    useShallow((state) => ({
      setValue: state.setValue,
    })),
  );
  const initialState = useMemo(
    () => createInitialState(userId, players, timeLimit),
    [],
  );

  useEffect(() => {
    if (!params.id) return;

    const channelName = `match-${params.id}`;
    const channel = pusherClientMatch.subscribe(channelName);

    const onTurnGame = (data: HandleTurnGameType) =>
      handleTurnGame(data, setValue);
    // GameWrapper — onConditionGame
    const onConditionGame = (data: TurnConditionType) => {
      handleTurnCondition(data, setValue);
    };

    channel.bind("match-game", onTurnGame);
    channel.bind("condition-game", onConditionGame);

    return () => {
      channel.unbind("match-game", onTurnGame);
      channel.unbind("condition-game", onConditionGame);
      pusherClientMatch.unsubscribe(channelName);
    };
  }, [params.id]);

  return (
    <GameProvider initialState={initialState}>
      <GameUI userId={userId} role={role} />
    </GameProvider>
  );
}
