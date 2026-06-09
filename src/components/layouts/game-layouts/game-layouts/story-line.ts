import { MatchPlayer } from "../game-wrapper";

export const STORY_LINE = {
  game_name: "The Cursed Dungeon",
  setting: {
    location: "Ancient Dungeon of Eldrath",
    story:
      "Enam petualang memasuki dungeon kuno Eldrath untuk mencari artefak legendaris bernama Heart of Eternity. Namun tanpa mereka ketahui, salah satu dari mereka telah dipengaruhi oleh entitas kuno yang tersegel di dalam dungeon dan diam-diam menjadi Infiltrator.",
  },
  stages: [
    {
      id: "1",
      title: "The Sealed Gate",
      story:
        "Kelompok tiba di gerbang batu raksasa yang menutup pintu masuk dungeon. Simbol-simbol kuno bersinar redup di permukaannya.",
      choices: [
        {
          id: "break_gate",
          label: "Mendobrak gerbang",
          required_stat: "STR",
          dc: 13,
          success: {
            story:
              "Gerbang berhasil dibuka dan kelompok menemukan petunjuk menuju ruang berikutnya.",
            effect: { evidence: 2 },
          },
          failure: {
            story: "Suara benturan membangunkan makhluk dungeon.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "solve_runes",
          label: "Memecahkan teka-teki rune",
          required_stat: "INT",
          dc: 15,
          success: {
            story: "Rune kuno bereaksi dan membuka jalan rahasia.",
            effect: { evidence: 2, survival: 1 },
          },
          failure: {
            story: "Rune melepaskan kutukan ringan.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "dark_ritual",
          label: "Menggunakan ritual terlarang",
          required_stat: "CHA",
          dc: 10,
          success: {
            story:
              "Gerbang terbuka, tetapi energi gelap mulai menyebar di dungeon.",
            effect: { chaos: 3 },
          },
          failure: {
            story: "Ritual gagal dan memperkuat kutukan.",
            effect: { chaos: 4 },
          },
        },
      ],
    },
    {
      id: "2",
      title: "Hall of Echoes",
      story:
        "Lorong panjang dipenuhi suara bisikan yang seolah mengetahui rahasia setiap petualang.",
      choices: [
        {
          id: "follow_whispers",
          label: "Mengikuti bisikan",
          required_stat: "PER",
          dc: 13,
          success: {
            story: "Bisikan mengarahkan kelompok menuju ruangan tersembunyi.",
            effect: { evidence: 2 },
          },
          failure: {
            story: "Kelompok tersesat di lorong yang sama.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "ignore_whispers",
          label: "Mengabaikan bisikan",
          required_stat: "PER",
          dc: 12,
          success: {
            story: "Kelompok berhasil mempertahankan fokus.",
            effect: { survival: 1 },
          },
          failure: {
            story: "Beberapa anggota mulai meragukan satu sama lain.",
            effect: { trust: -1 },
          },
        },
        {
          id: "embrace_whispers",
          label: "Mendengarkan seluruh bisikan",
          required_stat: "CHA",
          dc: 10,
          success: {
            story: "Suara misterius memberikan jalan pintas.",
            effect: { chaos: 2 },
          },
          failure: {
            story: "Bisikan menanamkan kecurigaan dalam kelompok.",
            effect: { chaos: 3 },
          },
        },
      ],
    },

    // ── NIGHT 1 — infiltrator beraksi ──────────────────────
    {
      id: "night_1",
      type: "night_phase",
      title: "Bayangan di Kegelapan",
      story:
        "Lampu padam. Sesuatu bergerak dalam kegelapan. Tidak ada yang tahu siapa — atau apa — yang mengintai.",
    },

    // ── DISCUSSION 1 — voting ──────────────────────────────
    {
      id: "discussion_1",
      type: "discuss",
      title: "Perkemahan Sementara",
      story:
        "Kelompok beristirahat sejenak. Ketegangan mulai memuncak. Seseorang harus disingkirkan sebelum perjalanan berlanjut.",
    },

    {
      id: "3",
      title: "The Forgotten Crypt",
      story:
        "Sebuah ruang pemakaman kuno dipenuhi peti mati batu dan patung penjaga.",
      choices: [
        {
          id: "inspect_tombs",
          label: "Memeriksa makam",
          required_stat: "PER",
          dc: 14,
          success: {
            story:
              "Kelompok menemukan catatan tentang pengkhianatan masa lalu.",
            effect: { evidence: 3 },
          },
          failure: {
            story: "Perangkap kuno aktif.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "pray_guardians",
          label: "Berdoa kepada penjaga kuno",
          required_stat: "CHA",
          dc: 12,
          success: {
            story: "Roh penjaga memberikan petunjuk.",
            effect: { evidence: 2, trust: 1 },
          },
          failure: {
            story: "Tidak ada respons dari para roh.",
            effect: {},
          },
        },
        {
          id: "open_cursed_tomb",
          label: "Membuka makam terlarang",
          required_stat: "STR",
          dc: 11,
          success: {
            story: "Artefak misterius ditemukan.",
            effect: { chaos: 3 },
          },
          failure: {
            story: "Kutukan dilepaskan ke dungeon.",
            effect: { chaos: 4 },
          },
        },
      ],
    },
    {
      id: "4",
      title: "The Abyss Library",
      story:
        "Perpustakaan kuno berisi ribuan buku sihir yang hampir hancur oleh waktu.",
      choices: [
        {
          id: "study_books",
          label: "Mempelajari buku kuno",
          required_stat: "INT",
          dc: 15,
          success: {
            story: "Kelompok menemukan sejarah asli dungeon.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Tulisan terlalu rusak untuk dibaca.",
            effect: {},
          },
        },
        {
          id: "search_secret_room",
          label: "Mencari ruangan rahasia",
          required_stat: "PER",
          dc: 14,
          success: {
            story: "Ruangan tersembunyi ditemukan.",
            effect: { evidence: 3 },
          },
          failure: {
            story: "Kelompok membuang banyak waktu.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "burn_books",
          label: "Membakar buku terlarang",
          required_stat: "STR",
          dc: 10,
          success: {
            story: "Banyak rahasia dungeon hilang selamanya.",
            effect: { chaos: 3 },
          },
          failure: {
            story: "Api menyebar ke seluruh perpustakaan.",
            effect: { chaos: 4 },
          },
        },
      ],
    },

    // ── NIGHT 2 — infiltrator beraksi ──────────────────────
    {
      id: "night_2",
      type: "night_phase",
      title: "Kegelapan Kembali",
      story:
        "Dungeon kembali menelan cahaya. Infiltrator merasakan kekuatannya semakin besar. Korban berikutnya sudah dipilih.",
    },

    // ── DISCUSSION 2 — voting ──────────────────────────────
    {
      id: "discussion_2",
      type: "discuss",
      title: "Persimpangan Terakhir",
      story:
        "Kelompok mulai saling mencurigai setelah berbagai kejadian aneh. Kepercayaan hampir habis. Ini mungkin kesempatan terakhir.",
    },

    {
      id: "5",
      title: "Heart Chamber",
      story:
        "Kelompok akhirnya mencapai ruang terakhir tempat Heart of Eternity disegel.",
      choices: [
        {
          id: "purify_artifact",
          label: "Menyucikan artefak",
          required_stat: "CHA",
          dc: 18,
          success: {
            story: "Kekuatan gelap mulai melemah.",
            effect: { evidence: 5 },
          },
          failure: {
            story: "Energi gelap melawan proses penyucian.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "analyze_artifact",
          label: "Mempelajari artefak",
          required_stat: "INT",
          dc: 16,
          success: {
            story: "Rahasia sebenarnya dari infiltrator mulai terungkap.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Artefak memancarkan ilusi.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "claim_power",
          label: "Mengambil kekuatan artefak",
          required_stat: "STR",
          dc: 10,
          success: {
            story: "Kekuatan besar diperoleh, tetapi kutukan semakin kuat.",
            effect: { chaos: 5 },
          },
          failure: {
            story: "Artefak menyerang balik pemegangnya.",
            effect: { chaos: 3 },
          },
        },
      ],
    },
  ],
};

export const getNextStage = (currentStage: string) => {
  const currentIndex = STORY_LINE.stages.findIndex(
    (s) => s.id === currentStage,
  );

  if (currentIndex === -1) return null;

  return STORY_LINE.stages[currentIndex + 1]?.id ?? null;
};

function extractStageNumber(stage: string): number {
  const match = stage.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getPlayerTurn(
  stage: string,
  players: MatchPlayer[],
): MatchPlayer | null {
  // Discuss stage tidak ada turn
  if (stage.startsWith("discuss")) return null;

  const alivePlayers = players.filter((p) => p.status !== "killed");
  if (!alivePlayers.length) return null;

  const index = extractStageNumber(stage);
  return alivePlayers[index % alivePlayers.length];
}

export function getNextAliveTurn(
  currentUserId: string | null,
  players: MatchPlayer[],
): MatchPlayer | null {
  const alivePlayers = players.filter((p) => p.status !== "killed");
  if (!alivePlayers.length) return null;

  // Kalau belum ada turn sebelumnya, mulai dari index 0
  if (!currentUserId) return alivePlayers[0];

  const currentIndex = alivePlayers.findIndex(
    (p) => p.userId === currentUserId,
  );

  // Kalau player saat ini sudah tidak ada di alive list (sudah killed),
  // tetap lanjut dari posisi yang seharusnya
  const nextIndex =
    (currentIndex === -1 ? 0 : currentIndex + 1) % alivePlayers.length;

  return alivePlayers[nextIndex];
}
