import { CLASSES, StatKey } from "@/src/types/classes";

export const getBaseHp = (classId: string): number => {
  const cls = CLASSES.find((c) => c.id === classId);
  if (!cls) return 40;

  const hitDieMax = parseInt(cls.hitDie.replace("d", ""), 10);
  const totalStats = Object.values(cls.baseStats).reduce(
    (a: number, b: number) => a + b,
    0,
  );
  return hitDieMax * 4 + Math.floor(totalStats / 3);
};

export const getDefStat = (classId: string): number => {
  const cls = CLASSES.find((c) => c.id === classId);
  return cls ? cls.baseStats[cls.primaryStat] : 3;
};

export const calculateDamage = (
  dc: number,
  requiredStat: string,
  classId: string,
): number => {
  const cls = CLASSES.find((c) => c.id === classId);
  if (!cls) return 3;

  const validStats: StatKey[] = ["STR", "DEX", "INT", "PER", "CHA"];
  const statKey: StatKey = validStats.includes(requiredStat as StatKey)
    ? (requiredStat as StatKey)
    : cls.primaryStat;

  const actionStat = cls.baseStats[statKey];
  const primaryStat = cls.baseStats[cls.primaryStat];
  const avgStat = (actionStat + primaryStat) / 2;

  const baseDamage = Math.ceil(dc / 5);
  const penalty = Math.floor(Math.max(0, 6 - avgStat) / 2);

  return Math.max(1, baseDamage + penalty);
};
