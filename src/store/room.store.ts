import { create } from "zustand";
import { DungeonAudio } from "../components/layouts/home-page/dungeon-audio";
import { startTransition } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createMatch, joinMatch, outMatch } from "../actions/match.action";

export type NotOmitValue =
  | "setValue"
  | "createRoom"
  | "handleOpenJoin"
  | "handleJoin"
  | "outMatch";

export type MatchStoreType = {
  createRoom: (user_id: string, router: AppRouterInstance) => void;
  setValue: <T extends keyof Omit<MatchStoreType, NotOmitValue>>(
    key: T,
    value: MatchStoreType[T],
  ) => void;
  joining: boolean;
  joinOpen: boolean;
  creating: boolean;
  hoveredBtn: string | null;
  code: string;
  codeError: string;
  audioReady: boolean;
  audio: DungeonAudio;
  handleOpenJoin: () => void;
  handleJoin: (user_id: string, router: AppRouterInstance) => void;
  outMatch: (
    match_id: string,
    user_id: string,
    router: AppRouterInstance,
  ) => void;
  loading: boolean;
};

export const matchStore = create<MatchStoreType>((set, get) => ({
  outMatch: (match_id, user_id, router) => {
    startTransition(async () => {
      set(() => ({ loading: true }));
      await outMatch(match_id, user_id);

      router.push("/");
      set(() => ({ loading: false }));
    });
  },
  loading: false,
  createRoom: async (user_id, router) => {
    const audio = get().audio;
    await audio.resume();
    audio.playRumble();
    startTransition(async () => {
      set(() => ({ creating: true }));
      const res = await createMatch(user_id);
      set(() => ({ creating: false }));
      audio.playSuccess();
      router.push(`/waiting/${res.room_id}`);
    });
  },
  handleJoin: async (user_id, router) => {
    const code = get().code;
    const audio = get().audio;

    if (code.length < 6) {
      set(() => ({ codeError: "The cipher must be 6 characters." }));
      audio.playError();
      return;
    }
    audio.playClick();

    startTransition(async () => {
      set(() => ({ joining: true, codeError: "" }));

      const res = await joinMatch(code, user_id);

      set(() => ({ joining: false }));
      audio.playSuccess();
      set(() => ({ joinOpen: false }));

      router.push(`/waiting/${res?.room_id}`);
    });
  },
  handleOpenJoin: () => {
    const audio = get().audio;

    audio.resume();
    audio.playChain();

    set(() => ({ code: "", codeError: "", joinOpen: true }));
  },
  joining: false,
  audioReady: false,
  code: "",
  codeError: "",
  creating: false,
  hoveredBtn: null,
  joinOpen: false,
  audio: new DungeonAudio(),
  setValue: (key, value) => set(() => ({ [key]: value })),
}));
