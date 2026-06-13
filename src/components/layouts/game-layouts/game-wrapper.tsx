"use client";

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
import { EndGamePayload } from "@/src/actions/game-match.action";
import { handleEndGameEvent } from "./game-layouts/end-game-handle";

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
  hp: number;
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
    const onConditionGame = (data: TurnConditionType) => {
      handleTurnCondition(data, setValue);
    };
    const onEndGame = (data: EndGamePayload) => {
      handleEndGameEvent(data, setValue);
    };
    const onHpUpdate = (data: { userId: string; newHp: number }[]) => {
      const { matchPlayer: current, sessionGame } = useEngine.getState();

      setValue(
        "matchPlayer",
        current.map((p) => {
          const updated = data.find((d) => d.userId === p.userId);
          return updated ? { ...p, hp: updated.newHp } : p;
        }),
      );

      if (sessionGame) {
        const myUpdate = data.find((d) => d.userId === sessionGame.userId);
        if (myUpdate) {
          setValue("sessionGame", {
            ...sessionGame,
            hp: myUpdate.newHp,
          });
        }
      }
    };

    channel.bind("match-game", onTurnGame);
    channel.bind("condition-game", onConditionGame);
    channel.bind("end-game", onEndGame);
    channel.bind("hp-update", onHpUpdate);

    return () => {
      channel.unbind("match-game", onTurnGame);
      channel.unbind("condition-game", onConditionGame);
      channel.unbind("end-game", onEndGame);
      channel.unbind("hp-update", onHpUpdate);
      pusherClientMatch.unsubscribe(channelName);
    };
  }, [params.id]);

  return (
    <GameProvider initialState={initialState}>
      <GameUI userId={userId} role={role} />
    </GameProvider>
  );
}
