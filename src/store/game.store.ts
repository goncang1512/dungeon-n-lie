import { create } from "zustand";
import { MatchPlayer } from "../components/layouts/game-layouts/game-wrapper";

export type EngineType = {
  setValue: <T extends keyof Omit<EngineType, "setValue">>(
    key: T,
    value: EngineType[T],
  ) => void;
  turn: string;
  stage: null | string;
  discuss: boolean;
  matchPlayer: MatchPlayer[];
  pickCondition: string;
  condition: {
    stage: string | null;
    success: boolean;
    choice: string;
  };
  voteTarget: {
    voter: string;
    target: string;
  }[];
  state: string;
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
    choice: "",
  },
  voteTarget: [],
  state: "",
}));
