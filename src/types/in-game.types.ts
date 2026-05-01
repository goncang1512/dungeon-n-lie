export interface Player {
  id: number;
  name: string;
  role: string;
  position: string;
  suspicious: boolean;
  status: "active" | "inactive";
  isYou?: boolean;
}

export interface Clue {
  id: number;
  type: string;
  text: string;
  severity: "high" | "medium" | "low";
}
