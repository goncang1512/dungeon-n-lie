"use client";

// ─────────────────────────────────────────────────────────
// game-state.ts
// Satu-satunya sumber kebenaran untuk state game.
// Berisi: tipe state, GameAction union, reducer, context,
// GameProvider, createInitialState, useGame hook.
// ─────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  JSX,
  Dispatch,
} from "react";

// UserRole diambil dari Prisma agar konsisten dengan database.
// DndClassId dari init-game karena itu tipe lokal game (nama value identik dengan CharUser enum).
import {
  DndClassId,
  GamePhase,
  PHASE_ORDER,
  OverlayTab,
  UserRole,
} from "./init-game";

// ── Player ────────────────────────────────────────────────

export interface Player {
  userId: string;
  displayName: string;
  role: UserRole;
  classId: DndClassId;
  isEliminated: boolean;
  suspicionTokens: number;
  isProtected: boolean; // Dari Guardian ability
}

// ── Infiltrator sub-state ─────────────────────────────────

export interface InfiltratorState {
  blackoutUsed: boolean;
  usedActionIds: string[];
  cooldowns: Record<string, number>; // actionId → ronde tersisa
}

// ── System log entry ──────────────────────────────────────

export interface LogEntry {
  id: string;
  type: string;
  color: string;
  text: string;
}

// ── Quest progress ────────────────────────────────────────

export type QuestProgress = Record<
  string,
  "locked" | "active" | "success" | "failed"
>;

// ── Full Game State ───────────────────────────────────────

export interface GameState {
  // Core
  phase: GamePhase;
  round: number;
  maxRounds: number;
  timeLeft: number; // detik
  myUserId: string;

  // Players
  players: Player[];

  // Voting
  voteMap: Record<string, string[]>; // targetId → voterIds[]
  myVoteTarget: string | null;
  eliminatedThisRound: string[];

  // Trial
  trialTargetId: string | null;
  trialRollResult: number | null;

  // Infiltrator
  infiltrator: InfiltratorState;
  catalystAllyCount: number; // Berapa kali catalyst bertindak bersama infiltrator
  blackoutActive: boolean;

  // Quest
  questProgress: QuestProgress;

  // UI
  activeTab: OverlayTab;
  systemLog: LogEntry[];
  glitchActive: boolean;

  // Win
  winner: "hero" | "infiltrator" | null;
}

// ── Actions ───────────────────────────────────────────────

export type GameAction =
  | { type: "SET_PHASE"; phase: GamePhase }
  | { type: "NEXT_ROUND" }
  | { type: "TICK" }
  | { type: "SET_ACTIVE_TAB"; tab: OverlayTab }
  | { type: "CAST_VOTE"; voterId: string; targetId: string }
  | { type: "SET_TRIAL_TARGET"; targetId: string }
  | { type: "SET_TRIAL_ROLL"; result: number }
  | { type: "ELIMINATE_PLAYER"; targetId: string }
  | { type: "PROTECT_PLAYER"; targetId: string }
  | { type: "ADD_SUSPICION"; targetId: string }
  | {
      type: "EXEC_INFIL_ACTION";
      actionId: string;
      cooldown: number;
      isOnce: boolean;
    }
  | { type: "INCREMENT_CATALYST" }
  | { type: "SET_BLACKOUT"; active: boolean }
  | { type: "SET_QUEST"; questId: string; status: "success" | "failed" }
  | { type: "PUSH_LOG"; entry: Omit<LogEntry, "id"> }
  | { type: "SET_GLITCH"; active: boolean }
  | { type: "SET_WINNER"; winner: "hero" | "infiltrator" };

// ── Reducer ───────────────────────────────────────────────

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };

    case "NEXT_ROUND": {
      const next = state.round + 1;
      // Kurangi semua cooldown infiltrator sebesar 1
      const cooldowns: Record<string, number> = {};
      for (const [id, cd] of Object.entries(state.infiltrator.cooldowns)) {
        if (cd - 1 > 0) cooldowns[id] = cd - 1;
      }
      return {
        ...state,
        round: next,
        phase: "exploration",
        voteMap: {},
        myVoteTarget: null,
        eliminatedThisRound: [],
        trialTargetId: null,
        trialRollResult: null,
        infiltrator: { ...state.infiltrator, cooldowns },
        questProgress: {
          ...state.questProgress,
          [`q${next}`]: "active",
        },
      };
    }

    case "TICK":
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.tab };

    case "CAST_VOTE": {
      const existing = state.voteMap[action.targetId] ?? [];
      if (existing.includes(action.voterId)) return state;
      return {
        ...state,
        myVoteTarget:
          action.voterId === state.myUserId
            ? action.targetId
            : state.myVoteTarget,
        voteMap: {
          ...state.voteMap,
          [action.targetId]: [...existing, action.voterId],
        },
      };
    }

    case "SET_TRIAL_TARGET":
      return { ...state, trialTargetId: action.targetId };

    case "SET_TRIAL_ROLL":
      return { ...state, trialRollResult: action.result };

    case "ELIMINATE_PLAYER": {
      const updated = state.players.map((p) =>
        p.userId === action.targetId ? { ...p, isEliminated: true } : p,
      );
      const wasInfil =
        updated.find((p) => p.userId === action.targetId)?.role ===
        "infiltrator";
      const active = updated.filter((p) => !p.isEliminated);
      const infils = active.filter(
        (p) =>
          p.role === "infiltrator" ||
          (p.role === "catalyst" && state.catalystAllyCount >= 2),
      );
      const heroes = active.filter(
        (p) =>
          p.role !== "infiltrator" &&
          !(p.role === "catalyst" && state.catalystAllyCount >= 2),
      );

      let winner = state.winner;
      if (wasInfil && infils.length === 0) winner = "hero";
      if (infils.length >= heroes.length) winner = "infiltrator";

      return {
        ...state,
        players: updated,
        eliminatedThisRound: [...state.eliminatedThisRound, action.targetId],
        winner,
        phase: winner ? "endgame" : state.phase,
      };
    }

    case "PROTECT_PLAYER":
      return {
        ...state,
        players: state.players.map((p) =>
          p.userId === action.targetId ? { ...p, isProtected: true } : p,
        ),
      };

    case "ADD_SUSPICION":
      return {
        ...state,
        players: state.players.map((p) =>
          p.userId === action.targetId
            ? { ...p, suspicionTokens: p.suspicionTokens + 1 }
            : p,
        ),
      };

    case "EXEC_INFIL_ACTION": {
      const newUsed = action.isOnce
        ? [...state.infiltrator.usedActionIds, action.actionId]
        : state.infiltrator.usedActionIds;
      return {
        ...state,
        infiltrator: {
          ...state.infiltrator,
          blackoutUsed:
            action.actionId === "blackout"
              ? true
              : state.infiltrator.blackoutUsed,
          usedActionIds: newUsed,
          cooldowns: {
            ...state.infiltrator.cooldowns,
            [action.actionId]: action.cooldown,
          },
        },
      };
    }

    case "INCREMENT_CATALYST":
      return { ...state, catalystAllyCount: state.catalystAllyCount + 1 };

    case "SET_BLACKOUT":
      return { ...state, blackoutActive: action.active };

    case "SET_QUEST":
      return {
        ...state,
        questProgress: {
          ...state.questProgress,
          [action.questId]: action.status,
        },
      };

    case "PUSH_LOG":
      return {
        ...state,
        systemLog: [
          ...state.systemLog.slice(-29),
          { ...action.entry, id: `log_${Date.now()}_${Math.random()}` },
        ],
      };

    case "SET_GLITCH":
      return { ...state, glitchActive: action.active };

    case "SET_WINNER":
      return { ...state, winner: action.winner, phase: "endgame" };

    default:
      return state;
  }
}

// ── Initial State Factory ─────────────────────────────────

// InitialPlayer — tipe minimal yang dibutuhkan untuk build GameState.
// Menggunakan string agar kompatibel dengan MatchPlayer dari game-wrapper
// tanpa circular dependency.
export interface InitialPlayer {
  userId: string;
  displayName: string;
  role: string; // nilai UserRole enum sebagai string
  classId: string; // nilai DndClassId / CharUser sebagai string
}

export function createInitialState(
  myUserId: string,
  players: InitialPlayer[],
  timeLimit = 300,
): GameState {
  return {
    phase: "exploration",
    round: 1,
    maxRounds: 5,
    timeLeft: timeLimit,
    myUserId,
    players: players.map((p) => ({
      userId: p.userId,
      displayName: p.displayName,
      role: p.role as UserRole,
      classId: p.classId as DndClassId,
      isEliminated: false,
      suspicionTokens: 0,
      isProtected: false,
    })),
    voteMap: {},
    myVoteTarget: null,
    eliminatedThisRound: [],
    trialTargetId: null,
    trialRollResult: null,
    infiltrator: {
      blackoutUsed: false,
      usedActionIds: [],
      cooldowns: {},
    },
    catalystAllyCount: 0,
    blackoutActive: false,
    questProgress: { q1: "active" },
    activeTab: null,
    systemLog: [
      {
        id: "l1",
        type: "MOTION",
        color: "#f87171",
        text: "Heavy footsteps recorded near the East Annex.",
      },
      {
        id: "l2",
        type: "ANOMALY",
        color: "#fbbf24",
        text: "Vital signs spiked for 6 seconds.",
      },
      {
        id: "l3",
        type: "SYSTEM",
        color: "#57534e",
        text: "Sensor grid disrupted in the Chapel.",
      },
    ],
    glitchActive: false,
    winner: null,
  };
}

// ── Context ───────────────────────────────────────────────

export interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  myPlayer: Player | undefined;
  isInfiltrator: boolean;
  isCatalyst: boolean;
  activePlayers: Player[];
  // Computed vote helpers
  voteLeader: { targetId: string; count: number } | null;
  hasMajority: boolean;
  // Phase helpers
  advancePhase: () => void;
  toggleTab: (tab: OverlayTab) => void;
}

const Ctx = createContext<GameContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function GameProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: GameState;
}): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);

  const myPlayer = state.players.find((p) => p.userId === state.myUserId);
  const isInfiltrator = myPlayer?.role === "infiltrator";
  const isCatalyst = myPlayer?.role === "catalyst";
  const activePlayers = state.players.filter((p) => !p.isEliminated);

  // Siapa yang paling banyak mendapat vote
  const voteLeader = (() => {
    const entries = Object.entries(state.voteMap).map(([id, voters]) => ({
      targetId: id,
      count: voters.length,
    }));
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (b.count > a.count ? b : a));
  })();

  const hasMajority = voteLeader
    ? voteLeader.count > activePlayers.length / 2
    : false;

  const advancePhase = useCallback(() => {
    if (state.phase === "endgame") return;

    if (state.phase === "resolution") {
      if (state.round >= state.maxRounds || state.timeLeft <= 0) {
        dispatch({ type: "SET_WINNER", winner: "infiltrator" });
      } else {
        dispatch({ type: "NEXT_ROUND" });
      }
      return;
    }

    const idx = PHASE_ORDER.indexOf(state.phase);
    const next = PHASE_ORDER[idx + 1];
    if (next) {
      dispatch({ type: "SET_PHASE", phase: next });
      dispatch({ type: "SET_ACTIVE_TAB", tab: null });
    }
  }, [state.phase, state.round, state.maxRounds, state.timeLeft]);

  const toggleTab = useCallback(
    (tab: OverlayTab) => {
      dispatch({
        type: "SET_ACTIVE_TAB",
        tab: state.activeTab === tab ? null : tab,
      });
    },
    [state.activeTab],
  );

  return (
    <Ctx.Provider
      value={{
        state,
        dispatch,
        myPlayer,
        isInfiltrator,
        isCatalyst,
        activePlayers,
        voteLeader,
        hasMajority,
        advancePhase,
        toggleTab,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useGame(): GameContextValue {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "[useGame] Komponen ini harus berada di dalam <GameProvider>. " +
        "Pastikan GameWrapper membungkus GameUI.",
    );
  return ctx;
}
