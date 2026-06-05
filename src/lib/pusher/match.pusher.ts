import { nextTurn } from "@/src/actions/game-match.action";
import { getNextStage } from "@/src/components/layouts/game-layouts/game-layouts/story-line";
import {
  ChatStoreType,
  PlayerMatch,
  useChatStore,
} from "@/src/store/chat.store";
import { EngineType, useEngine } from "@/src/store/game.store";
import Pusher from "pusher-js";
import { startTransition } from "react";

export const pusherClientMatch = new Pusher(
  process.env.NEXT_PUBLIC_KEY_PUSHER!,
  {
    cluster: "ap1",
    forceTLS: true,
  },
);

export const handleUserJoined = (
  data: PlayerMatch,
  setValue: ChatStoreType["setValue"],
) => {
  // Ambil state TERBARU langsung dari store (bukan dari closure)
  const currentPlayers = useChatStore.getState().players;

  // Cek duplikasi: jangan tambah jika userId sudah ada
  const exists = currentPlayers.some((p) => p.userId === data.userId);
  if (exists) return;

  setValue("players", [...currentPlayers, data]);
};

export const handleUserOut = (
  data: { userId: string },
  setValue: ChatStoreType["setValue"],
) => {
  // Ambil state TERBARU langsung dari store (bukan dari closure)
  const currentPlayers = useChatStore.getState().players;

  // Cek duplikasi: jangan tambah jika userId sudah ada
  const newData = currentPlayers.filter((p) => p.userId !== data.userId);

  setValue("players", newData);
};

export const handleHostChanged = (
  data: { user_id: string },
  setValue: ChatStoreType["setValue"],
) => {
  const currentPlayers = useChatStore.getState().players;

  // Update status semua player:
  // - Player baru jadi "host"
  // - Player lama yang sebelumnya "host" jadi "waiting"
  const updatedPlayers = currentPlayers.map((player) => {
    if (player.userId === data.user_id) {
      // Player baru menjadi host
      return { ...player, status: "host" as const };
    }

    // Player yang sebelumnya host (atau status lain) jadi waiting
    // jika status-nya "host", reset ke "waiting"
    if (player.status === "host") {
      return { ...player, status: "waiting" as const };
    }

    // Player lain tidak berubah
    return player;
  });

  setValue("players", updatedPlayers);
};

export const handleUserReady = (
  data: { userId: string; ready: boolean },
  setValue: ChatStoreType["setValue"],
) => {
  const currentPlayers = useChatStore.getState().players;

  const updatedPlayers = currentPlayers.map((player) => {
    if (player.userId === data.userId) {
      return { ...player, ready: data.ready };
    }
    return player;
  });

  setValue("players", updatedPlayers);
};

export type HandleTurnGameType = {
  room_id: string;
  data: {
    stage: string | number | null;
    turn: string;
  };
};

export const handleTurnGame = (
  data: HandleTurnGameType,
  setValue: EngineType["setValue"],
) => {
  setValue("stage", data.data.stage);
  setValue("turn", data.data.turn);
  setValue("condition", { stage: null, success: false });
};

export type TurnConditionType = {
  room_id: string;
  data: {
    stage: number;
    success: boolean;
  };
};

export const handleTurnCondition = (
  data: TurnConditionType,
  user_id: string,
  room_id: string,
  setValue: EngineType["setValue"],
) => {
  const conditionStage = useEngine.getState().condition;

  setValue("condition", {
    ...conditionStage,
    stage: data.data.stage,
    success: data.data.success,
  });

  setTimeout(() => {
    startTransition(async () => {
      const nextStage = getNextStage(data.data.stage);
      await nextTurn(nextStage, user_id, room_id);
    });
  }, 5000);
};
