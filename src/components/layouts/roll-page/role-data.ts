export type UserRole =
  | "survivor"
  | "observer"
  | "guardian"
  | "analyst"
  | "infiltrator"
  | "catalyst";

export type Phase = "rolling" | "reveal" | "done";

export const ROLE_META: Record<
  UserRole,
  {
    label: string;
    tagline: string;
    color: string;
    glowColor: string;
    borderColor: string;
    icon: string;
    description: string;
    ability: string;
  }
> = {
  survivor: {
    label: "SURVIVOR",
    tagline: "Bound by Fate",
    color: "#4ade80",
    glowColor: "rgba(74,222,128,0.14)",
    borderColor: "rgba(74,222,128,0.55)",
    icon: "⚔",
    description:
      "No special power. Your only weapon is instinct and observation.",
    ability:
      "Once per round, request 1 clue from the system — truth not guaranteed.",
  },
  observer: {
    label: "OBSERVER",
    tagline: "Eyes in the Dark",
    color: "#60a5fa",
    glowColor: "rgba(96,165,250,0.14)",
    borderColor: "rgba(96,165,250,0.55)",
    icon: "👁",
    description:
      "You read what others cannot — micro-expressions, tonal shifts, hesitation.",
    ability:
      "Once per round: learn one player's emotional state — calm, panicked, or hiding something.",
  },
  guardian: {
    label: "GUARDIAN",
    tagline: "Shield of the Fallen",
    color: "#fbbf24",
    glowColor: "rgba(251,191,36,0.14)",
    borderColor: "rgba(251,191,36,0.55)",
    icon: "🛡",
    description: "You stand between the innocent and elimination.",
    ability:
      "Protect one player from the vote. If you shield the Infiltrator, you lose this power forever.",
  },
  analyst: {
    label: "ANALYST",
    tagline: "Truth is a Riddle",
    color: "#e879f9",
    glowColor: "rgba(232,121,249,0.14)",
    borderColor: "rgba(232,121,249,0.55)",
    icon: "🔎",
    description:
      "The dungeon feeds you information — but half of it is poison.",
    ability:
      "Each round you receive 2 clues: one true, one false. You will never know which is which.",
  },
  infiltrator: {
    label: "INFILTRATOR",
    tagline: "The Void Within",
    color: "#f87171",
    glowColor: "rgba(248,113,113,0.14)",
    borderColor: "rgba(248,113,113,0.55)",
    icon: "💀",
    description:
      "You are not one of them. You never were. Make sure they never reach the end.",
    ability:
      "Once per game: trigger a BLACKOUT — all cameras die for 10 seconds. Corrupt one clue per round.",
  },
  catalyst: {
    label: "CATALYST",
    tagline: "Between Two Worlds",
    color: "#fb923c",
    glowColor: "rgba(251,146,60,0.14)",
    borderColor: "rgba(251,146,60,0.55)",
    icon: "⚡",
    description:
      "Even you do not know whose side you are truly on. The dungeon decides.",
    ability:
      "Act alongside the Infiltrator 2+ times → become their ally. Stay clean → remain with the group.",
  },
};
