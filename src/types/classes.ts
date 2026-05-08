import * as THREE from "three";
import { Mats } from "../components/layouts/char-page/selection";
import { buildBarbarian } from "../components/layouts/char-page/character-build/barbarian";
import { buildWizard } from "../components/layouts/char-page/character-build/wizard";
import { buildPaladin } from "../components/layouts/char-page/character-build/paladin";
import { buildCleric } from "../components/layouts/char-page/character-build/cleric";
import { buildBard } from "../components/layouts/char-page/character-build/bard";
import { buildWarlock } from "../components/layouts/char-page/character-build/warlock";

export type StatKey = "STR" | "DEX" | "INT" | "PER" | "CHA";
export type DnDClassId =
  | "barbarian"
  | "wizard"
  | "paladin"
  | "cleric"
  | "bard"
  | "warlock";

export interface Stats {
  STR: number;
  DEX: number;
  INT: number;
  PER: number;
  CHA: number;
}

export interface ClassSkill {
  name: string;
  desc: string;
}

export interface DiceCheck {
  check: string;
  formula: string;
}

export interface DnDClass {
  id: DnDClassId;
  name: string; // "Barbarian"
  classCode: string; // "BARB" — 4-letter code
  archetype: string; // Sub-tagline
  description: string;
  baseStats: Stats;
  primaryStat: StatKey;
  hitDie: string; // d6/d8/d10/d12
  classSkills: ClassSkill[];
  diceChecks: DiceCheck[];
  weapon: string;
  armor: string;
  color: number; // 3D body color
  accentColor: number; // Glow color
  build: (group: THREE.Group, mats: Mats, scale: number) => void;
}

export const STAT_NAMES: Record<StatKey, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  INT: "Intelligence",
  PER: "Perception",
  CHA: "Charisma",
};

/* =========================================================
   BALANCING — total 27 baseline (avg 5.4)
                STR  DEX  INT  PER  CHA  | TOTAL
   Barbarian →   8    6    3    5    5   | 27
   Wizard    →   3    5    9    7    3   | 27
   Paladin   →   7    4    4    5    7   | 27
   Cleric    →   5    4    6    8    4   | 27
   Bard      →   4    6    5    4    8   | 27
   Warlock   →   5    7    7    4    7   | 27
   ========================================================= */

export const CLASSES: DnDClass[] = [
  {
    id: "barbarian",
    build: buildBarbarian,
    name: "Barbarian",
    classCode: "BARB",
    archetype: "Sang Petarung Brutal",
    description:
      "Pejuang utara yang murka membakar darahnya saat pertempuran tiba. Daya tahan luar biasa, daging penuh bekas luka. Tidak peduli pada strategi rumit — yang ia tahu hanyalah bertahan dan menumbangkan musuh dengan kapak besarnya.",
    baseStats: { STR: 8, DEX: 6, INT: 3, PER: 5, CHA: 5 },
    primaryStat: "STR",
    hitDie: "d12",
    classSkills: [
      {
        name: "Rage",
        desc: "Memasuki kondisi murka selama satu ronde — meningkatkan ketahanan dan kekuatan, namun INT check dilakukan dengan disadvantage.",
      },
      {
        name: "Reckless Instinct",
        desc: "Insting jalanan memberinya bisikan dari sistem AI saat HP-nya rendah.",
      },
    ],
    diceChecks: [
      { check: "Bertahan dari serangan", formula: "d20 + STR" },
      { check: "Intimidasi musuh", formula: "d20 + STR" },
      { check: "Menghindar", formula: "d20 + DEX" },
    ],
    weapon: "Kapak Besar",
    armor: "Kulit Kasar",
    color: 0xc94f2a,
    accentColor: 0xff7a3c,
  },
  {
    id: "wizard",
    name: "Wizard",
    build: buildWizard,
    classCode: "WIZD",
    archetype: "Sang Penyihir Akademik",
    description:
      "Penyihir akademik yang menghabiskan dekade meneliti rune kuno. Pikirannya seperti perpustakaan — dingin, rapi, brutal akurat. Tubuhnya rapuh seperti kulit perkamen, namun pengetahuannya bisa membongkar kebohongan dalam sekejap.",
    baseStats: { STR: 3, DEX: 5, INT: 9, PER: 7, CHA: 3 },
    primaryStat: "INT",
    hitDie: "d6",
    classSkills: [
      {
        name: "Scrying",
        desc: "Menganalisis satu pemain dengan mantra penglihatan — akurasi berdasarkan kombinasi INT dan PER.",
      },
      {
        name: "Arcane Recall",
        desc: "Mengingat detail dari ronde-ronde sebelumnya yang terlupakan oleh pemain lain.",
      },
    ],
    diceChecks: [
      { check: "Investigasi pemain", formula: "d20 + INT" },
      { check: "Membaca mikro-ekspresi", formula: "d20 + PER" },
      { check: "Mengingat detail", formula: "d20 + INT" },
    ],
    weapon: "Tongkat Bintang Malam",
    armor: "Jubah Akademi",
    color: 0x4f3fa8,
    accentColor: 0x9070ff,
  },
  {
    id: "paladin",
    name: "Paladin",
    build: buildPaladin,
    classCode: "PALA",
    archetype: "Sang Ksatria Suci",
    description:
      "Ksatria suci dari Ordo Cahaya Fajar. Bersumpah melindungi yang lemah, dengan tameng yang tak pernah retak dan pedang yang membakar bayangan. Kombinasi unik antara kekuatan fisik dan karisma — orang-orang ingin mengikutinya ke dalam neraka.",
    baseStats: { STR: 7, DEX: 4, INT: 4, PER: 5, CHA: 7 },
    primaryStat: "STR",
    hitDie: "d10",
    classSkills: [
      {
        name: "Divine Shield",
        desc: "Mengangkat perisai untuk melindungi satu pemain dari serangan dalam satu ronde.",
      },
      {
        name: "Lay on Hands",
        desc: "Menyalurkan kekuatan suci untuk memulihkan satu pemain yang terluka.",
      },
      {
        name: "Aura of Truth",
        desc: "Pemain di dekatnya mengalami disadvantage saat melakukan Bluff (CHA).",
      },
    ],
    diceChecks: [
      { check: "Bertahan", formula: "d20 + STR" },
      { check: "Melindungi sekutu", formula: "d20 + STR" },
      { check: "Meyakinkan tim", formula: "d20 + CHA" },
    ],
    weapon: "Pedang Fajar & Tameng Ordo",
    armor: "Plate Armor Ordo Cahaya",
    color: 0xc8a04a,
    accentColor: 0xffe07a,
  },
  {
    id: "cleric",
    name: "Cleric",
    build: buildCleric,
    classCode: "CLRC",
    archetype: "Sang Pendeta Wahyu",
    description:
      "Pendeta dewi pengetahuan yang membaca arus takdir. Tenang, sabar, dan selalu melihat satu langkah lebih jauh. Saat lainnya panik, ia merapal doa diam — dan jawaban datang dari arah yang tak terduga.",
    baseStats: { STR: 5, DEX: 4, INT: 6, PER: 8, CHA: 4 },
    primaryStat: "PER",
    hitDie: "d8",
    classSkills: [
      {
        name: "Divine Insight",
        desc: "Memohon wahyu dari dewinya — meminta gambaran global kondisi permainan dari sistem AI.",
      },
      {
        name: "Bless",
        desc: "Memberkati satu pemain — check selanjutnya mendapat advantage.",
      },
      {
        name: "Detect Evil",
        desc: "Sekali per game: memeriksa apakah satu pemain memiliki niat jahat (akurasi 50% + bonus PER).",
      },
    ],
    diceChecks: [
      { check: "Membaca tanda-tanda", formula: "d20 + PER" },
      { check: "Doa wahyu", formula: "d20 + PER" },
      { check: "Bertahan", formula: "d20 + STR" },
    ],
    weapon: "Mace Berkah",
    armor: "Chainmail Suci",
    color: 0xd4c878,
    accentColor: 0xfff5c0,
  },
  {
    id: "bard",
    name: "Bard",
    build: buildBard,
    classCode: "BARD",
    archetype: "Sang Musisi Penipu",
    description:
      "Musisi kelana yang setiap kata-katanya bisa menggerakkan kerumunan. Lincah, fasih, dan pesonanya seperti racun manis. Pandai menyusup ke setiap percakapan — meniru suara, gaya, bahkan keyakinan orang lain dengan kesempurnaan menyeramkan.",
    baseStats: { STR: 4, DEX: 6, INT: 5, PER: 4, CHA: 8 },
    primaryStat: "CHA",
    hitDie: "d8",
    classSkills: [
      {
        name: "Vicious Mockery",
        desc: "Menjatuhkan reputasi satu pemain — check CHA mereka berikutnya mendapat disadvantage.",
      },
      {
        name: "Mimicry",
        desc: "Meniru aksi atau kemampuan pemain lain dalam satu ronde dengan sempurna.",
      },
      {
        name: "Inspiration",
        desc: "Memberi inspirasi pada satu sekutu — check mereka berikutnya mendapat advantage.",
      },
    ],
    diceChecks: [
      { check: "Bluff / Persuasi", formula: "d20 + CHA" },
      { check: "Tipuan gerak", formula: "d20 + DEX" },
      { check: "Membaca audiens", formula: "d20 + CHA" },
    ],
    weapon: "Pisau Lentur & Kecapi",
    armor: "Pakaian Kulit Lembut",
    color: 0x4fb088,
    accentColor: 0x88ffc4,
  },
  {
    id: "warlock",
    name: "Warlock",
    build: buildWarlock,
    classCode: "WRLK",
    archetype: "Sang Pengikat Pact",
    description:
      "Berikrar pada entitas gelap dari Lapisan Bayang. Karisma tak wajarnya membuat pendengar nyaris mempercayainya — bahkan saat ia berbohong terang-terangan. Pact-nya memberi kekuatan tabu yang tidak dimiliki kelas lain.",
    baseStats: { STR: 5, DEX: 7, INT: 7, PER: 4, CHA: 7 },
    primaryStat: "CHA",
    hitDie: "d8",
    classSkills: [
      {
        name: "Eldritch Blast",
        desc: "Menyerang dengan energi pact dari kejauhan — d20 + CHA.",
      },
      {
        name: "Hex",
        desc: "Mengutuk satu target — check mereka mendapat disadvantage selama 2 ronde.",
      },
      {
        name: "Devil's Sight",
        desc: "Bisa melihat dalam kegelapan total — advantage saat sistem mengalami Blackout.",
      },
    ],
    diceChecks: [
      { check: "Eldritch Blast", formula: "d20 + CHA" },
      { check: "Manipulasi sosial", formula: "d20 + CHA" },
      { check: "Sabotase / Stealth", formula: "d20 + DEX" },
    ],
    weapon: "Belati Pact",
    armor: "Jubah Kerudung Gelap",
    color: 0x6b1a4a,
    accentColor: 0xc848d8,
  },
];

export const getClassById = (id: DnDClassId): DnDClass | undefined =>
  CLASSES.find((c) => c.id === id);

export const calculateTotalPower = (stats: Stats): number =>
  Object.values(stats).reduce((a, b) => a + b, 0);
