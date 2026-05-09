import {
  ChatStoreType,
  PlayerMatch,
  useChatStore,
} from "@/src/store/chat.store";
import Pusher from "pusher-js";

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
