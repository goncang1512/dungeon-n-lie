import {
  conditionStage,
  eliminatedTarget,
  infiltratorKill,
  infiltratorSkip,
  nextTurn,
  voteTargetHandle,
} from "@/src/actions/game-match.action";
import {
  Activity,
  JSX,
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getNextAliveTurn, getNextStage, STORY_LINE } from "./story-line";
import { EngineType, useEngine } from "@/src/store/game.store";
import { resolveEndGame } from "./end-game-handle";
import { getMostVoted, useVoteElimination } from "./useVote";
import {
  handleVoteTarget,
  pusherClientMatch,
} from "@/src/lib/pusher/match.pusher";
import { getClassById, Stats } from "@/src/types/classes";
import { useShallow } from "zustand/shallow";
import { authClient } from "@/src/lib/auth/client";
import { useParams } from "next/navigation";
import { MatchPlayer } from "../game-wrapper";
import { EndGameOverlay } from "./end-game-overlay";
import { VoteEliminatedDialog } from "./elemited-vote";
import DiceRoll from "./dice-roll";

// ── Sub-components ─────────────────────────────────────────

function NightInfiltratorPanel({
  matchPlayers,
  sessionGame,
  params,
}: {
  matchPlayers: MatchPlayer[];
  sessionGame: { userId: string } | null;
  params: { id: string };
}) {
  const { setValue } = useEngine(
    useShallow((state) => ({ setValue: state.setValue })),
  );
  return (
    <>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#ef4444",
          letterSpacing: "0.15em",
          marginBottom: 4,
        }}
      >
        PILIH TARGET ELIMINASI
      </div>
      {matchPlayers
        .filter(
          (p) => p.status !== "killed" && p.userId !== sessionGame?.userId,
        )
        .map((player) => (
          <button
            key={player.userId}
            onClick={() =>
              startTransition(async () => {
                setValue("killedId", player.userId);
                await infiltratorKill(player.userId, String(params.id));
              })
            }
            className="flex items-center justify-between px-3 py-2 rounded-md border border-transparent hover:border-red-500 hover:bg-red-900/20 transition-all"
          >
            <div className="flex flex-col items-start">
              <span className="text-stone-200">{player.displayName}</span>
              <span className="text-xs text-stone-500">{player.classId}</span>
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#ef4444",
                letterSpacing: "0.1em",
              }}
            >
              ELIMINATE
            </div>
          </button>
        ))}
    </>
  );
}

function NightWaitingPanel() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "#292524",
          letterSpacing: "0.2em",
        }}
      >
        MENUNGGU...
      </span>
    </div>
  );
}

function NightRightInfiltratorPanel({ params }: { params: { id: string } }) {
  return (
    <div className="text-center flex flex-col gap-3">
      <div
        style={{
          fontFamily: "monospace",
          color: "#ef4444",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.15em",
        }}
      >
        NIGHT PHASE
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "#78716c",
        }}
      >
        Pilih siapa yang akan dieliminasi malam ini.
      </div>
      <button
        onClick={() =>
          startTransition(async () => {
            await infiltratorSkip(String(params.id));
          })
        }
        className="px-4 py-2 rounded-md border border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300 text-xs"
        style={{ fontFamily: "monospace" }}
      >
        SKIP / TIDAK MEMBUNUH
      </button>
    </div>
  );
}

function NightRightWaitingPanel() {
  return (
    <div className="text-center flex flex-col gap-3 items-center">
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#ef4444",
          boxShadow: "0 0 12px rgba(239,68,68,0.8)",
        }}
      />
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 700,
          color: "#57534e",
          letterSpacing: "0.15em",
        }}
      >
        NIGHT PHASE
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#292524",
          letterSpacing: "0.1em",
        }}
      >
        INFILTRATOR SEDANG BERAKSI
      </div>
    </div>
  );
}

export function SystemLogPanel(): JSX.Element {
  // ... semua hooks tetap sama ...
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
    killedId,
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
      killedId: state.killedId,
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
            killedId,
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
      const { matchPlayer: currentPlayers, sessionGame: currentSession } =
        useEngine.getState();

      setValue("voteResult", data);

      setValue(
        "matchPlayer",
        currentPlayers.map((p) =>
          p.userId === data.userId ? { ...p, status: "killed" } : p,
        ),
      );

      if (data.userId === currentSession?.userId) {
        setValue("sessionGame", {
          ...currentSession,
          status: "killed",
        });
      }

      muteParticipant(data.userId);
      setShowEliminatedDialog(data.userId === currentSession?.userId);
    };

    channel.bind("vote-game", onVoteTarget);
    channel.bind("eliminated-vote", onEliminatedPlayer);

    return () => {
      channel.unbind("vote-game", onVoteTarget);
      channel.unbind("eliminated-vote", onEliminatedPlayer);
      pusherClientMatch.unsubscribe(channelName);
    };
  }, [params.id]);

  useEffect(() => {
    const alivePlayers = matchPlayers.filter((p) => p.status !== "killed");

    const aliveVotes = voteTarget.filter((v) =>
      alivePlayers.some((p) => p.userId === v.voter),
    );

    if (aliveVotes.length !== alivePlayers.length) return;

    const mostVotedId = getMostVoted(aliveVotes);
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
        // ← baca fresh dari store, bukan closure
        const { winner: currentWinner } = useEngine.getState();

        if (!endGame && !currentWinner) {
          const nextStage = getNextStage(stage as string);

          const playersAfterElimination = matchPlayers.filter(
            (p) => p.userId !== eliminatedPlayer?.userId,
          );

          const { turn: freshTurn, lastTurn } = useEngine.getState();
          const anchorTurn = freshTurn || lastTurn;

          const isCurrentDiscuss = (stage as string)?.startsWith("discuss");

          const newTurnUserId = isCurrentDiscuss
            ? anchorTurn
            : (getNextAliveTurn(anchorTurn, playersAfterElimination)?.userId ??
              anchorTurn);

          console.log(
            `[TURN CLIENT] "${stage}" → "${nextStage}" | ${isCurrentDiscuss ? "FREEZE" : "rotasi"}: ${anchorTurn} → ${newTurnUserId}`,
          );

          await nextTurn(nextStage, String(newTurnUserId), String(params.id));
        }

        setValue("voteTarget", []);
      }, 3000);
    });
  }, [voteTarget]);

  const isNightStage = useMemo(() => {
    return typeof stage === "string" && stage.startsWith("night");
  }, [stage]);

  const isInfiltrator = sessionGame?.role === "infiltrator";

  type PanelType = "night_infiltrator" | "night_waiting" | "discuss" | "dice";

  const activePanel = useMemo((): PanelType => {
    if (isNightStage)
      return isInfiltrator ? "night_infiltrator" : "night_waiting";
    if (isDiscussStage) return "discuss";
    return "dice";
  }, [isNightStage, isDiscussStage, isInfiltrator]);

  if (sessionGame?.status === "killed") {
    return (
      <>
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
          <Activity
            mode={activePanel === "night_infiltrator" ? "visible" : "hidden"}
          >
            <NightInfiltratorPanel
              matchPlayers={matchPlayers}
              sessionGame={sessionGame}
              params={params as { id: string }}
            />
          </Activity>

          <Activity
            mode={activePanel === "night_waiting" ? "visible" : "hidden"}
          >
            <NightWaitingPanel />
          </Activity>

          <Activity mode={activePanel === "discuss" ? "visible" : "hidden"}>
            <div className="flex flex-col gap-2">
              {matchPlayers.map((player) => {
                if (player.status === "killed") return null;
                return (
                  <button
                    key={player.userId}
                    onClick={() => {
                      const voter = String(data?.user?.id);
                      const filteredVotes = voteTarget.filter(
                        (v) => v.voter !== voter,
                      );
                      const newVotes = [
                        ...filteredVotes,
                        { voter, target: player.userId },
                      ];
                      setValue("voteTarget", newVotes);
                      startTransition(async () => {
                        await voteTargetHandle(String(params.id), newVotes);
                      });
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md border ${
                      voteTarget.find((item) => item.voter === data?.user?.id)
                        ?.target === player.userId
                        ? "bg-red-900/30 border-red-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-stone-200">
                          {player.displayName}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({
                            length: voteTarget.filter(
                              (item) => item.target === player.userId,
                            ).length,
                          }).map((_, index) => (
                            <div
                              className="size-2 rounded-full bg-red-500"
                              key={index}
                            />
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
              })}
            </div>
          </Activity>

          <Activity mode={activePanel === "dice" ? "visible" : "hidden"}>
            <div className="flex flex-col gap-2">
              {currentChoices.map((row) => {
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
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all cursor-pointer border hover:bg-amber-600/15 ${
                      pickCondition === row.id
                        ? "bg-amber-600/20 border-amber-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#22c55e" }}
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
          </Activity>
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
          <Activity
            mode={activePanel === "night_infiltrator" ? "visible" : "hidden"}
          >
            <NightRightInfiltratorPanel params={params as { id: string }} />
          </Activity>

          <Activity
            mode={activePanel === "night_waiting" ? "visible" : "hidden"}
          >
            <NightRightWaitingPanel />
          </Activity>

          <Activity mode={activePanel === "discuss" ? "visible" : "hidden"}>
            <div className="text-center flex flex-col gap-4 items-center">
              <div style={{ color: "#fbbf24", fontFamily: "monospace" }}>
                <div className="text-2xl font-bold">DISCUSSION</div>
                <div style={{ fontSize: 12, color: "#a8a29e", marginTop: 8 }}>
                  Semua pemain berdiskusi sebelum melanjutkan perjalanan.
                </div>
              </div>
              <button
                onClick={() => {
                  const voter = String(data?.user?.id);
                  const filteredVotes = voteTarget.filter(
                    (v) => v.voter !== voter,
                  );
                  const newVotes = [...filteredVotes, { voter, target: "not" }];
                  setValue("voteTarget", newVotes);
                  startTransition(async () => {
                    await voteTargetHandle(String(params.id), newVotes);
                  });
                }}
                className="px-6 py-3 rounded-md bg-green-600 hover:bg-green-500 text-white font-bold"
              >
                NEXT STAGE
              </button>
              <div className="flex items-center gap-1">
                {Array.from({
                  length: voteTarget.filter((item) => item.target === "not")
                    .length,
                }).map((_, index) => (
                  <div className="size-2 rounded-full bg-red-500" key={index} />
                ))}
              </div>
            </div>
          </Activity>

          <Activity mode={activePanel === "dice" ? "visible" : "hidden"}>
            <DiceRoll
              data={data}
              diceValue={diceValue}
              handleRoll={handleRoll}
              rolling={rolling}
              selectedChoice={selectedChoice}
              selectedNeed={selectedNeed}
              selectedStat={selectedStat}
              success={success}
              turn={turn}
            />
          </Activity>
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
