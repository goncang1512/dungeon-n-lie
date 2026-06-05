// ─────────────────────────────────────────────────────────
// init-game.ts
// Semua tipe dasar, enum, dan metadata yang dipakai
// di seluruh game. Tidak ada logic di sini — murni data.
// ─────────────────────────────────────────────────────────

import { $Enums } from "@/generated/prisma/client";

// ── Roles ─────────────────────────────────────────────────
// UserRole diambil dari "@prisma/client" agar selalu sinkron dengan
// database (MatchUser.role enum). Re-export di sini supaya komponen
// game cukup import dari satu tempat.

export type UserRole = $Enums.UserRole;

export interface RoleMeta {
  label: string;
  tagline: string;
  color: string; // hex utama
  glow: string; // rgba untuk box-shadow/text-shadow
  borderColor: string; // rgba untuk border
  icon: string;
  description: string;
  ability: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  survivor: {
    label: "SURVIVOR",
    tagline: "Bound by Fate",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.35)",
    borderColor: "rgba(74,222,128,0.55)",
    icon: "⚔",
    description:
      "Tidak ada kekuatan khusus. Senjatamu hanya insting dan observasi.",
    ability:
      "Sekali per ronde: minta 1 petunjuk dari sistem — kebenaran tidak dijamin.",
  },
  observer: {
    label: "OBSERVER",
    tagline: "Eyes in the Dark",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.35)",
    borderColor: "rgba(96,165,250,0.55)",
    icon: "👁",
    description:
      "Kamu membaca apa yang tidak bisa dibaca orang lain — mikro-ekspresi, perubahan nada, keraguan.",
    ability:
      "Sekali per ronde: pelajari kondisi emosional satu pemain — tenang, panik, atau menyembunyikan sesuatu.",
  },
  guardian: {
    label: "GUARDIAN",
    tagline: "Shield of the Fallen",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
    borderColor: "rgba(251,191,36,0.55)",
    icon: "🛡",
    description: "Kamu berdiri antara yang tidak bersalah dan eliminasi.",
    ability:
      "Lindungi satu pemain dari voting. Jika kamu melindungi Infiltrator, kekuatan ini hilang selamanya.",
  },
  analyst: {
    label: "ANALYST",
    tagline: "Truth is a Riddle",
    color: "#e879f9",
    glow: "rgba(232,121,249,0.35)",
    borderColor: "rgba(232,121,249,0.55)",
    icon: "🔎",
    description: "Dungeon memberimu informasi — tapi setengahnya adalah racun.",
    ability:
      "Tiap ronde kamu menerima 2 petunjuk: satu benar, satu salah. Kamu tidak akan pernah tahu mana yang mana.",
  },
  infiltrator: {
    label: "INFILTRATOR",
    tagline: "The Void Within",
    color: "#f87171",
    glow: "rgba(248,113,113,0.35)",
    borderColor: "rgba(248,113,113,0.55)",
    icon: "💀",
    description:
      "Kamu bukan bagian dari mereka. Pastikan mereka tidak pernah sampai ke akhir.",
    ability:
      "Sekali per game: picu BLACKOUT — semua kamera mati 10 detik. Korupsi satu petunjuk per ronde.",
  },
  catalyst: {
    label: "CATALYST",
    tagline: "Between Two Worlds",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.35)",
    borderColor: "rgba(251,146,60,0.55)",
    icon: "⚡",
    description:
      "Bahkan kamu tidak tahu pihak mana yang sebenarnya kamu dukung. Dungeon yang memutuskan.",
    ability:
      "Bertindak bersama Infiltrator 2+ kali → menjadi sekutu mereka. Tetap bersih → tetap bersama grup.",
  },
};

// ── DnD Classes ───────────────────────────────────────────

export type StatKey = "STR" | "DEX" | "INT" | "PER" | "CHA";
export type DndClassId =
  | "barbarian"
  | "wizard"
  | "paladin"
  | "cleric"
  | "bard"
  | "warlock";

export interface DiceCheck {
  label: string;
  stat: StatKey;
}

export interface DndClass {
  id: DndClassId;
  name: string;
  code: string; // 4-char code, e.g. "BARB"
  archetype: string;
  primaryStat: StatKey;
  stats: Record<StatKey, number>;
  checks: DiceCheck[]; // 3 jenis skill check
  weapon: string;
  armor: string;
}

export const DND_CLASSES: Record<DndClassId, DndClass> = {
  barbarian: {
    id: "barbarian",
    name: "Barbarian",
    code: "BARB",
    archetype: "Sang Petarung Brutal",
    primaryStat: "STR",
    stats: { STR: 8, DEX: 6, INT: 3, PER: 5, CHA: 5 },
    checks: [
      { label: "Bertahan dari serangan", stat: "STR" },
      { label: "Intimidasi musuh", stat: "STR" },
      { label: "Menghindar", stat: "DEX" },
    ],
    weapon: "Kapak Besar",
    armor: "Kulit Kasar",
  },
  wizard: {
    id: "wizard",
    name: "Wizard",
    code: "WIZD",
    archetype: "Sang Penyihir Akademik",
    primaryStat: "INT",
    stats: { STR: 3, DEX: 5, INT: 9, PER: 7, CHA: 3 },
    checks: [
      { label: "Investigasi pemain", stat: "INT" },
      { label: "Membaca mikro-ekspresi", stat: "PER" },
      { label: "Mengingat detail", stat: "INT" },
    ],
    weapon: "Tongkat Bintang Malam",
    armor: "Jubah Akademi",
  },
  paladin: {
    id: "paladin",
    name: "Paladin",
    code: "PALA",
    archetype: "Sang Ksatria Suci",
    primaryStat: "STR",
    stats: { STR: 7, DEX: 4, INT: 4, PER: 5, CHA: 7 },
    checks: [
      { label: "Bertahan", stat: "STR" },
      { label: "Melindungi sekutu", stat: "STR" },
      { label: "Meyakinkan tim", stat: "CHA" },
    ],
    weapon: "Pedang Fajar & Tameng Ordo",
    armor: "Plate Armor Ordo Cahaya",
  },
  cleric: {
    id: "cleric",
    name: "Cleric",
    code: "CLRC",
    archetype: "Sang Pendeta Wahyu",
    primaryStat: "PER",
    stats: { STR: 5, DEX: 4, INT: 6, PER: 8, CHA: 4 },
    checks: [
      { label: "Membaca tanda-tanda", stat: "PER" },
      { label: "Doa wahyu", stat: "PER" },
      { label: "Bertahan", stat: "STR" },
    ],
    weapon: "Mace Berkah",
    armor: "Chainmail Suci",
  },
  bard: {
    id: "bard",
    name: "Bard",
    code: "BARD",
    archetype: "Sang Musisi Penipu",
    primaryStat: "CHA",
    stats: { STR: 4, DEX: 6, INT: 5, PER: 4, CHA: 8 },
    checks: [
      { label: "Bluff / Persuasi", stat: "CHA" },
      { label: "Tipuan gerak", stat: "DEX" },
      { label: "Membaca audiens", stat: "CHA" },
    ],
    weapon: "Pisau Lentur & Kecapi",
    armor: "Pakaian Kulit Lembut",
  },
  warlock: {
    id: "warlock",
    name: "Warlock",
    code: "WRLK",
    archetype: "Sang Pengikat Pact",
    primaryStat: "CHA",
    stats: { STR: 5, DEX: 7, INT: 7, PER: 4, CHA: 7 },
    checks: [
      { label: "Eldritch Blast", stat: "CHA" },
      { label: "Manipulasi sosial", stat: "CHA" },
      { label: "Sabotase / Stealth", stat: "DEX" },
    ],
    weapon: "Belati Pact",
    armor: "Jubah Kerudung Gelap",
  },
};

// ── Game Phases ───────────────────────────────────────────

export type GamePhase =
  | "role_reveal" // Kartu identitas ditampilkan
  | "exploration" // DM narasi + quest aktif
  | "secret_action" // Fase malam — infiltrator bertindak
  | "discussion" // Diskusi bebas
  | "voting" // Fase tuduhan
  | "trial" // Sidang + persuasion roll
  | "resolution" // Hasil ronde
  | "endgame"; // Game selesai

export const PHASE_ORDER: GamePhase[] = [
  "role_reveal",
  "exploration",
  "secret_action",
  "discussion",
  "voting",
  "trial",
  "resolution",
];

export const PHASE_LABELS: Record<GamePhase, string> = {
  role_reveal: "IDENTITAS",
  exploration: "EKSPLORASI",
  secret_action: "AKSI RAHASIA",
  discussion: "DISKUSI",
  voting: "VOTING",
  trial: "SIDANG",
  resolution: "RESOLUSI",
  endgame: "SELESAI",
};

export const PHASE_COLORS: Record<GamePhase, string> = {
  role_reveal: "#e879f9",
  exploration: "#d97706",
  secret_action: "#f87171",
  discussion: "#60a5fa",
  voting: "#fbbf24",
  trial: "#fb923c",
  resolution: "#4ade80",
  endgame: "#e7e5e4",
};

// ── Action Buttons ────────────────────────────────────────
// Tipe aksi yang bisa dipilih pemain di bottom bar

export type ActionKey =
  | "INVESTIGATE" // Buka story/clue panel
  | "ROLL_CHECK" // Buka dice roller
  | "SECRET_ACTION" // Buka panel infiltrator
  | "PROTECT" // Guardian ability (pasif)
  | "ACCUSE" // Buka vote panel
  | "VOTE_NOW" // Buka vote panel (fase voting)
  | "PERSUASION" // Dice roll CHA saat sidang
  | "SIDANG" // Buka trial panel
  | "HASIL_RONDE"; // Buka resolusi

// mapping dari ActionKey ke OverlayTab
export type OverlayTab = "story" | "dice" | "infiltrator" | "vote" | null;
