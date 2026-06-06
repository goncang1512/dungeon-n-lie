"use client";

import { JSX, startTransition, useEffect, useMemo, useState } from "react";
import { EngineType, useEngine } from "@/src/store/game.store";
import { useShallow } from "zustand/shallow";
import { getNextAliveTurn, getNextStage, STORY_LINE } from "./story-line";
import { authClient } from "@/src/lib/auth/client";
import { getClassById, Stats } from "@/src/types/classes";
import {
  conditionStage,
  eliminatedTarget,
  EndGamePayload,
  nextTurn,
  voteTargetHandle,
} from "@/src/actions/game-match.action";
import { useParams } from "next/navigation";
import {
  handleVoteTarget,
  pusherClientMatch,
} from "@/src/lib/pusher/match.pusher";
import { getMostVoted, useVoteElimination } from "./useVote";
import { VoteEliminatedDialog } from "./elemited-vote";
import { EndGameOverlay } from "./end-game-overlay";
import {
  handleEndGameEvent,
  resolveEndGame,
  resolveEndGameAfterRoll,
} from "./end-game-handle";

export function SystemLogPanel(): JSX.Element {
  const { data } = authClient.useSession();
  const params = useParams();

  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);

  const { muteParticipant } = useVoteElimination();

  const [showEliminatedDialog, setShowEliminatedDialog] = useState(false);

  const {
    stage,
    setValue,
    pickCondition,
    turn,
    matchPlayers,
    voteTarget,
    winner,
    sessionGame,
  } = useEngine(
    useShallow((state) => ({
      stage: state.stage,
      setValue: state.setValue,
      pickCondition: state.pickCondition,
      turn: state.turn,
      matchPlayers: state.matchPlayer,
      voteTarget: state.voteTarget,
      sessionGame: state.sessionGame,
      winner: state.winner,
    })),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerClass = getClassById(data?.user?.character as any);

  const currentChoices =
    STORY_LINE.stages.find((item) => item.id === stage)?.choices ?? [];

  const selectedChoice = currentChoices.find((c) => c.id === pickCondition);

  const getNeedRoll = (stat: number, difficulty: number) => {
    const need = difficulty - stat;

    return Math.max(1, Math.min(20, need));
  };

  const selectedStat =
    selectedChoice && playerClass
      ? playerClass.baseStats[selectedChoice.required_stat as keyof Stats]
      : 0;

  const selectedNeed =
    selectedChoice && playerClass
      ? getNeedRoll(selectedStat, selectedChoice.dc)
      : 20;

  const success = diceValue !== null && diceValue >= selectedNeed;

  const handleRoll = () => {
    if (!selectedChoice) return;

    setRolling(true);

    let count = 0;

    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 20) + 1);

      count++;

      if (count >= 12) {
        clearInterval(interval);

        const finalRoll = Math.floor(Math.random() * 20) + 1;

        const finalSuccess = finalRoll >= selectedNeed;

        setDiceValue(finalRoll);
        setRolling(false);

        startTransition(async () => {
          await conditionStage(
            stage,
            finalSuccess,
            String(params.id),
            String(pickCondition),
          );

          await resolveEndGameAfterRoll(
            matchPlayers,
            String(stage),
            String(params.id),
          );
        });
      }
    }, 80);
  };

  const isDiscussStage = useMemo(() => {
    return typeof stage === "string" && stage.startsWith("discuss");
  }, [stage]);

  useEffect(() => {
    if (!params.id) return;

    const channelName = `match-${params.id}`;
    const channel = pusherClientMatch.subscribe(channelName);

    const onVoteTarget = (data: EngineType["voteTarget"]) => {
      handleVoteTarget(data, setValue);
    };

    const onEliminatedPlayer = (data: EngineType["voteResult"]) => {
      setValue("voteResult", data);
      setValue(
        "matchPlayer",
        matchPlayers.map((p) =>
          p.userId === data.userId ? { ...p, status: "killed" } : p,
        ),
      );
      muteParticipant(data.userId);
      setShowEliminatedDialog(data.userId === sessionGame?.userId);
    };

    const onEndGame = (data: EndGamePayload) => {
      handleEndGameEvent(data, setValue);
    };

    channel.bind("vote-game", onVoteTarget);
    channel.bind("eliminated-vote", onEliminatedPlayer);
    channel.bind("end-game", onEndGame); // ← tambah

    return () => {
      channel.unbind("vote-game", onVoteTarget);
      channel.unbind("eliminated-vote", onEliminatedPlayer);
      channel.unbind("end-game", onEndGame); // ← tambah
      pusherClientMatch.unsubscribe(channelName);
    };
  }, [params.id]);

  useEffect(() => {
    const alivePlayers = matchPlayers.filter((p) => p.status !== "killed");

    if (voteTarget.length !== alivePlayers.length) return;

    const mostVotedId = getMostVoted(voteTarget);
    const eliminatedPlayer = matchPlayers.find((p) => p.userId === mostVotedId);

    startTransition(async () => {
      if (eliminatedPlayer) {
        await eliminatedTarget(
          {
            userId: eliminatedPlayer.userId,
            character: eliminatedPlayer.classId,
            role: eliminatedPlayer.role,
            name: eliminatedPlayer.displayName,
          },
          String(params.id),
        );
      }

      const endGame = await resolveEndGame(
        matchPlayers,
        eliminatedPlayer?.userId ?? null,
        String(stage),
        String(params.id),
      );

      setTimeout(async () => {
        if (!endGame) {
          const nextStage = getNextStage(stage as string);

          const playersAfterElimination = matchPlayers.filter(
            (p) => p.userId !== eliminatedPlayer?.userId,
          );

          const { turn: freshTurn, lastTurn } = useEngine.getState();
          const anchorTurn = freshTurn || lastTurn;
          const newTurn = getNextAliveTurn(anchorTurn, playersAfterElimination);

          await nextTurn(nextStage, String(newTurn?.userId), String(params.id));
        }

        setValue("voteTarget", []);
      }, 3000);
    });
  }, [voteTarget]);

  return (
    <>
      <div
        className="border-t shrink-0 flex justify-between gap-6"
        style={{
          background: "rgba(4,3,2,0.88)",
          borderTopColor: "rgba(41,37,36,0.5)",
          padding: "12px 14px",
        }}
      >
        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col gap-2">
          {isDiscussStage
            ? matchPlayers.map((player) => {
                if (player.status === "killed") return null;
                return (
                  <button
                    key={player.userId}
                    onClick={() => {
                      const voter = String(data?.user?.id);

                      const filteredVotes = voteTarget.filter(
                        (vote) => vote.voter !== voter,
                      );

                      const newVotes = [
                        ...filteredVotes,
                        {
                          voter,
                          target: player.userId,
                        },
                      ];

                      setValue("voteTarget", newVotes);

                      startTransition(async () => {
                        await voteTargetHandle(String(params.id), newVotes);
                      });
                    }}
                    className={`
          flex items-center justify-between
          px-3 py-2 rounded-md border
          ${
            voteTarget.find((item) => item.voter === data?.user?.id)?.target ===
            player.userId
              ? "bg-red-900/30 border-red-500"
              : "border-transparent"
          }
        `}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-stone-200">
                          {player.displayName}
                        </span>

                        <div className="flex items-center gap-1 ">
                          {Array.from({
                            length: voteTarget.filter(
                              (item) => item.target === player.userId,
                            ).length,
                          }).map((_, index) => (
                            <div
                              className="size-2 rounded-full bg-red-500"
                              key={index}
                            ></div>
                          ))}
                        </div>
                      </div>

                      <span className="text-xs text-stone-500">
                        {player.classId}
                      </span>
                    </div>

                    <div className="text-red-400 font-bold">VOTE</div>
                  </button>
                );
              })
            : currentChoices.map((row) => {
                const stat =
                  playerClass?.baseStats[
                    row.required_stat as keyof typeof playerClass.baseStats
                  ] ?? 0;

                const need = getNeedRoll(stat, row.dc);

                return (
                  <button
                    disabled={data?.user.id !== turn}
                    key={row.id}
                    onClick={() => setValue("pickCondition", row.id)}
                    className={`
                flex items-center justify-between
                px-3 py-2 rounded-md
                transition-all
                cursor-pointer
                border
                hover:bg-amber-600/15
                ${
                  pickCondition === row.id
                    ? "bg-amber-600/20 border-amber-500"
                    : "border-transparent"
                }
              `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: "#22c55e",
                        }}
                      />

                      <div className="flex flex-col items-start">
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 15,
                            color: "#e7e5e4",
                          }}
                        >
                          {row.label}
                        </span>

                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#78716c",
                          }}
                        >
                          {row.required_stat}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#f59e0b",
                        }}
                      >
                        {need}+
                      </div>

                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 10,
                          color: "#78716c",
                        }}
                      >
                        NEED
                      </div>
                    </div>
                  </button>
                );
              })}
        </div>

        {/* RIGHT SIDE */}
        <div
          className="w-60 rounded-lg border flex flex-col items-center justify-center gap-4 p-4"
          style={{
            borderColor: "#78350f",
            background:
              "linear-gradient(180deg, rgba(120,53,15,.25), rgba(0,0,0,.3))",
          }}
        >
          {isDiscussStage ? (
            <>
              <div
                className="text-center"
                style={{
                  color: "#fbbf24",
                  fontFamily: "monospace",
                }}
              >
                <div className="text-2xl font-bold">DISCUSSION</div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#a8a29e",
                    marginTop: 8,
                  }}
                >
                  Semua pemain berdiskusi sebelum melanjutkan perjalanan.
                </div>
              </div>

              <button
                onClick={() => {
                  const voter = String(data?.user?.id);

                  const filteredVotes = voteTarget.filter(
                    (vote) => vote.voter !== voter,
                  );

                  const newVotes = [
                    ...filteredVotes,
                    {
                      voter,
                      target: "not",
                    },
                  ];

                  setValue("voteTarget", newVotes);

                  startTransition(async () => {
                    await voteTargetHandle(String(params.id), newVotes);
                  });
                }}
                className="
          px-6 py-3 rounded-md
          bg-green-600 hover:bg-green-500
          text-white font-bold
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
              >
                NEXT STAGE
              </button>
              <div className="flex items-center gap-1 ">
                {Array.from({
                  length: voteTarget.filter((item) => item.target === "not")
                    .length,
                }).map((_, index) => (
                  <div
                    className="size-2 rounded-full bg-red-500"
                    key={index}
                  ></div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div
                className={`
            w-24 h-24 rounded-xl border
            flex items-center justify-center
            transition-all duration-150
            ${rolling ? "scale-110 rotate-6" : ""}
          `}
                style={{
                  borderColor: "#f59e0b",
                  background: "rgba(0,0,0,.45)",
                }}
              >
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#fbbf24",
                    fontFamily: "monospace",
                  }}
                >
                  {diceValue ?? "D20"}
                </span>
              </div>

              <div className="text-center space-y-1">
                <div
                  style={{
                    color: "#a8a29e",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedChoice?.label ?? "SELECT ACTION"}
                </div>

                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  NEED {selectedNeed}+
                </div>

                {selectedChoice && (
                  <div
                    style={{
                      color: "#78716c",
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedChoice.required_stat} {selectedStat}
                  </div>
                )}

                <div
                  style={{
                    color:
                      diceValue == null
                        ? "#f5f5f4"
                        : success
                          ? "#22c55e"
                          : "#ef4444",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {diceValue == null ? "READY" : success ? "SUCCESS" : "FAILED"}
                </div>
              </div>

              <button
                onClick={handleRoll}
                disabled={rolling || !selectedChoice || data?.user.id !== turn}
                className="
            px-4 py-2 rounded-md
            bg-amber-600 hover:bg-amber-500
            text-white font-semibold
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
              >
                {rolling ? "ROLLING..." : "ROLL D20"}
              </button>
            </>
          )}
        </div>
      </div>

      <EndGameOverlay
        winner={winner ?? null}
        myRole={sessionGame?.role ?? ""}
      />

      <VoteEliminatedDialog
        isVisible={showEliminatedDialog}
        onClose={() => setShowEliminatedDialog(false)}
      />
    </>
  );
}
