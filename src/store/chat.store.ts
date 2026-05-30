import { Prisma } from "@/generated/prisma/client";
import { create } from "zustand";
import { match_user_select } from "../types/select";

export type status_player = "ready" | "waiting" | "host";

export type PlayerMatch = Prisma.MatchUserGetPayload<{
  select: typeof match_user_select;
}> & { status: status_player; isYou: boolean };

export type ChatStoreType = {
  setValue: <T extends keyof Omit<ChatStoreType, "setValue">>(
    key: T,
    value: ChatStoreType[T],
  ) => void;
  message: string;
  messages: {
    sender: string;
    text: string;
    isSystem: boolean;
  }[];
  isReady: boolean;
  players: PlayerMatch[];
  loading: boolean;
};

export const useChatStore = create<ChatStoreType>((set) => ({
  message: "",
  messages: [],
  isReady: false,
  players: [],
  setValue: (key, value) => set(() => ({ [key]: value })),
  loading: false,
}));
