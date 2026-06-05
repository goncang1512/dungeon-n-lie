import { create } from "zustand";
import { MatchPlayer } from "../components/layouts/game-layouts/game-wrapper";

export type EngineType = {
  setValue: <T extends keyof Omit<EngineType, "setValue">>(
    key: T,
    value: EngineType[T],
  ) => void;
  turn: string;
  stage: number | null | string;
  discuss: boolean;
  matchPlayer: MatchPlayer[];
  pickCondition: string;
  condition: {
    stage: number | string | null;
    success: boolean;
  };
  voteTarget: {
    voter: string;
    target: string;
  }[];
};

export const useEngine = create<EngineType>((set) => ({
  setValue: (key, value) => set(() => ({ [key]: value })),
  turn: "",
  stage: null,
  discuss: false,
  matchPlayer: [],
  pickCondition: "",
  condition: {
    stage: null,
    success: false,
  },
  voteTarget: [],
}));
