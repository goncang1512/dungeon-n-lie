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

const getPlayerTurn = (stage: number, players: MatchPlayer[]) => {
  if (!players.length) return null;

  const index = (stage - 1) % players.length;

  return players[index];
};

// ── MatchPlayer ───────────────────────────────────────────

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
  const { setValue, matchPlayer, turn, stage } = useEngine(
    useShallow((state) => ({
      setValue: state.setValue,
      matchPlayer: state.matchPlayer,
      turn: state.turn,
      stage: state.stage,
    })),
  );
  const initialState = useMemo(
    () => createInitialState(userId, players, timeLimit),
    [],
  );

  console.log({ turn, stage });

  useEffect(() => {
    console.log({ matchPlayer, userOne: matchPlayer[1] });

    if (!params.id) return;

    const channelName = `match-${params.id}`;
    const channel = pusherClientMatch.subscribe(channelName);

    const onTurnGame = (data: HandleTurnGameType) =>
      handleTurnGame(data, setValue);
    const onConditionGame = (data: TurnConditionType) => {
      console.log({
        data,
        matchPlayer,
        turn,
        turnStage: data.data.stage,
        nextTurn: matchPlayer[Number(data.data.stage) + 1],
      });

      const nextPlayer = getPlayerTurn(
        Number(data.data.stage) + 1,
        matchPlayer,
      );

      if (!nextPlayer) return;

      handleTurnCondition(data, nextPlayer.userId, String(params.id), setValue);
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
