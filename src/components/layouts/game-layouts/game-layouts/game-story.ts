// ─────────────────────────────────────────────────────────
// game-story.ts
// Konten statis Dungeon Master: chapter per ronde, clue,
// quest, dan aksi rahasia infiltrator.
// Tidak ada React di sini — murni data TypeScript.
// ─────────────────────────────────────────────────────────

import { StatKey } from "./init-game";

// ── Story Chapters ─────────────────────────────────────────

export interface Chapter {
  round: number;
  title: string;
  narrative: string; // Teks panjang narasi DM
  whisper: string; // Satu kalimat ringkas di status bar
  infiltratorSecret: string; // Pesan khusus hanya untuk infiltrator
  ambience: string; // Deskripsi suasana ruangan
}

export const CHAPTERS: Chapter[] = [
  {
    round: 1,
    title: "Pendaratan",
    narrative:
      "Kalian tiba di ruang penerimaan utama — Lantai B1. Terminal komputer di sudut masih menyala, menampilkan data yang terus bergulir. Di tengah ruangan terdapat brankas terbuka bertanda 'PROTOKOL ZERO'. Di lantai, jejak darah kering mengarah ke lorong timur. Seseorang mendengar langkah kaki di atas plafon — terlalu ringan untuk manusia dewasa.",
    whisper: "Pintu terbuka dari dalam. Siapa yang membukanya?",
    infiltratorSecret:
      "Dokumen PROTOKOL ZERO ada di tanganmu. Diberikan oleh entitas yang mengirimmu ke sini.",
    ambience:
      "Lampu darurat merah. Generator berdenging. Lorong timur lebih dingin.",
  },
  {
    round: 2,
    title: "Laboratorium Bawah",
    narrative:
      "Lorong timur membawa kalian ke Laboratorium Biokimia — Lantai B2. Rak spesimen masih tertata rapi, beberapa tabung pecah. Di papan whiteboard ada formula tidak lengkap — separuhnya dipindahkan. Catatan peneliti bertanda 'Dr. V' berakhir dengan: \"Subjek tidak menyadari perubahan. Subjek bahkan tidak merasa berbeda. Itulah yang paling menakutkan.\"",
    whisper: "Dr. V memperingatkan tentang perubahan yang tidak terasa.",
    infiltratorSecret:
      "Formula di whiteboard adalah milikmu. Separuh lagi ada di sakumu.",
    ambience: "Bau formalin dan sesuatu yang manis. Ventilasi tidak berfungsi.",
  },
  {
    round: 3,
    title: "Ruang Server",
    narrative:
      "Lantai B3. Ruang server utama — ratusan tower berjajar dalam kegelapan, disinari LED biru. Log aktivitas menunjukkan seseorang mengakses database 23 menit sebelum kalian tiba. Nama akun: 'GUEST_07.' Di fasilitas ini hanya ada enam terminal resmi. Tidak ada tamu ketujuh dalam catatan.",
    whisper:
      "GUEST_07 mengakses sistem sebelum kalian. Tapi kalian hanya berenam.",
    infiltratorSecret:
      "GUEST_07 adalah akunmu. Entitas di balik layar sudah mempersiapkan semuanya.",
    ambience:
      "Dengungan server seperti doa yang tidak berhenti. Suhu turun. Nafas terlihat.",
  },
  {
    round: 4,
    title: "Ruang Protokol",
    narrative:
      "Ruang tersembunyi di balik rak buku laboratorium — Ruang Protokol Zero. Di dalamnya: kursi dengan restraint terpasang, monitor yang memutar rekaman wajah tak dikenal, sebuah kotak berisi enam kartu bertuliskan nama kalian masing-masing. Di bawah kotak itu, satu kartu tambahan — dengan nama yang tidak ada di antara kalian.",
    whisper:
      "Enam kartu dengan nama kalian. Dan satu yang tidak seharusnya ada.",
    infiltratorSecret:
      "Kartu dengan nama asing itu adalah nama aslimu — nama yang kamu sembunyikan sejak awal.",
    ambience: "Rekaman di monitor menunjukkan seseorang berbicara tanpa suara.",
  },
  {
    round: 5,
    title: "Titik Akhir",
    narrative:
      "Pintu keluar fasilitas ada di depan kalian. Sistem penghitung mundur menunjukkan dua menit sebelum lockdown permanen aktif. Pintu membutuhkan autentikasi dari semua pihak yang dipercaya sistem — sistem akan menolak siapa pun yang terdeteksi sebagai anomali. Semua pertanyaan harus dijawab sekarang: Siapa yang benar-benar di sini untuk keluar bersama?",
    whisper:
      "Dua menit. Satu pintu. Satu di antara kalian tidak ingin kalian keluar.",
    infiltratorSecret:
      "Jika pintu terbuka, semua yang kamu lakukan akan terungkap. Pintu ini tidak boleh dibuka.",
    ambience: "Alarm berbunyi. Pintu baja menutup satu per satu.",
  },
];

// ── Clues ─────────────────────────────────────────────────

export type ClueType = "physical" | "testimony" | "magical" | "fabricated";

export interface Clue {
  id: string;
  round: number; // Muncul mulai ronde ini
  type: ClueType;
  title: string;
  description: string;
  isFabricated: boolean; // Clue palsu dari infiltrator
  dcToRead: number; // DC untuk memahami clue
}

export const CLUES: Clue[] = [
  {
    id: "c1",
    round: 1,
    type: "physical",
    isFabricated: false,
    dcToRead: 12,
    title: "Jejak Darah Kering",
    description:
      "Mengarah ke lorong timur lalu berhenti di depan pintu yang terkunci dari dalam. Darah terlalu segar untuk berasal dari insiden sembilan tahun lalu.",
  },
  {
    id: "c2",
    round: 1,
    type: "fabricated",
    isFabricated: true,
    dcToRead: 10,
    title: "Catatan Tersembunyi",
    description:
      '"Waspada pada yang paling diam. Mereka sudah tahu segalanya." Tulisan tangan tidak dikenal. [Kemungkinan dipalsukan]',
  },
  {
    id: "c3",
    round: 2,
    type: "testimony",
    isFabricated: false,
    dcToRead: 13,
    title: "Rekaman Audio Dr. V",
    description:
      '"...subjek menerima injeksi hari ketiga. Hari kelima, tidak merespons nama asli mereka. Hari ketujuh... kami kehilangan kendali." Rekaman terputus.',
  },
  {
    id: "c4",
    round: 2,
    type: "physical",
    isFabricated: false,
    dcToRead: 16,
    title: "Sidik Jari di Brankas",
    description:
      "Sidik jari baru di brankas PROTOKOL ZERO — bukan milik staf fasilitas. Ukurannya cocok dengan seseorang yang ada di ruangan ini sekarang.",
  },
  {
    id: "c5",
    round: 3,
    type: "magical",
    isFabricated: false,
    dcToRead: 18,
    title: "Log Akses GUEST_07",
    description:
      "Data yang diakses GUEST_07: semua profil psikologis anggota tim. Seseorang telah mempelajari kalian semua bahkan sebelum kalian masuk.",
  },
  {
    id: "c6",
    round: 3,
    type: "physical",
    isFabricated: false,
    dcToRead: 14,
    title: "Kamera yang Dipindahkan",
    description:
      "Kamera di lorong utama dipindahkan beberapa sentimeter — menciptakan titik buta di depan pintu server. Ini direncanakan.",
  },
  {
    id: "c7",
    round: 4,
    type: "testimony",
    isFabricated: false,
    dcToRead: 17,
    title: "Kartu Nama Asing",
    description:
      "Kartu ke-7 dicetak dengan tinta yang berbeda dari printer fasilitas. Seseorang membawa kartu ini dari luar dan menaruhnya dengan sengaja.",
  },
  {
    id: "c8",
    round: 4,
    type: "fabricated",
    isFabricated: true,
    dcToRead: 19,
    title: "Rekaman Suara Palsu",
    description:
      "Seseorang mengaku melakukan sabotase dalam rekaman ini — tapi analisis spektrum menunjukkan suaranya dimanipulasi dari beberapa rekaman berbeda. [Dipalsukan]",
  },
];

// ── Quests ─────────────────────────────────────────────────

export type QuestStatus = "locked" | "active" | "success" | "failed";

export interface Quest {
  id: string;
  round: number;
  title: string;
  description: string;
  objective: string; // Teks singkat untuk UI
  stat: StatKey;
  dc: number;
  reward: string;
  sabotageEffect: string; // Efek kalau quest digagalkan infiltrator
}

export const QUESTS: Quest[] = [
  {
    id: "q1",
    round: 1,
    title: "Aktifkan Generator Cadangan",
    description:
      "Generator utama padam. Sistem darurat membutuhkan generator cadangan di Lantai B1 untuk mengaktifkan peta fasilitas.",
    objective: "Roll DEX atau STR ≥ 14",
    stat: "DEX",
    dc: 14,
    reward: "Peta lengkap fasilitas terbuka.",
    sabotageEffect: "Tim bergerak buta di lantai bawah.",
  },
  {
    id: "q2",
    round: 2,
    title: "Dekripsi Log Dr. V",
    description:
      "Catatan Dr. V terenkripsi dengan algoritma lama. Isinya mungkin mengungkap metode yang digunakan infiltrator.",
    objective: "Roll INT ≥ 16",
    stat: "INT",
    dc: 16,
    reward:
      "Terungkap bahwa Subjek #6 memiliki tanda biologis yang bisa dideteksi.",
    sabotageEffect: "Log terhapus permanen. Petunjuk Dr. V hilang selamanya.",
  },
  {
    id: "q3",
    round: 3,
    title: "Akses Ruang Server Inti",
    description:
      "Terminal utama membutuhkan autentikasi biologis. Server inti menyimpan rekaman semua aktivitas — termasuk identitas GUEST_07.",
    objective: "Roll PER ≥ 15",
    stat: "PER",
    dc: 15,
    reward: "Identitas GUEST_07 terungkap.",
    sabotageEffect: "Akses server diblokir selama dua ronde.",
  },
  {
    id: "q4",
    round: 4,
    title: "Nonaktifkan PROTOKOL ZERO",
    description:
      "PROTOKOL ZERO adalah failsafe yang mengunci semua orang di dalam fasilitas selamanya. Seseorang sedang mencoba mengaktifkannya.",
    objective: "Roll CHA ≥ 17 atau INT ≥ 19",
    stat: "CHA",
    dc: 17,
    reward: "PROTOKOL ZERO dinonaktifkan. Pintu keluar dapat diakses.",
    sabotageEffect: "PROTOKOL ZERO aktif. Lockdown permanen dimulai.",
  },
  {
    id: "q5",
    round: 5,
    title: "Eksfiltrasi — Pintu Akhir",
    description:
      "Pintu utama membutuhkan autentikasi dari semua individu yang dipercaya sistem. Sistem menolak siapa pun yang terdeteksi sebagai anomali.",
    objective: "Semua pemain vote buka pintu",
    stat: "CHA",
    dc: 20,
    reward: "HERO WIN: Pintu terbuka.",
    sabotageEffect: "INFILTRATOR WIN: Lockdown. Semua sistem dikompromikan.",
  },
];

// ── Infiltrator Actions ────────────────────────────────────

export interface InfiltratorAction {
  id: string;
  name: string;
  description: string;
  effect: string;
  dcDetect: number; // DC untuk pemain lain mendeteksi
  cooldown: number; // Ronde cooldown setelah dipakai
  isOnce: boolean; // Hanya bisa dipakai sekali per game
  availableFrom: number; // Tersedia mulai ronde berapa
}

export const INFILTRATOR_ACTIONS: InfiltratorAction[] = [
  {
    id: "blackout",
    name: "BLACKOUT",
    description: "Matikan semua kamera dan lampu selama 10 detik.",
    effect:
      "Semua pemain kehilangan visibilitas. Clue yang ditemukan ronde ini tidak bisa diverifikasi.",
    dcDetect: 18,
    cooldown: 3,
    isOnce: true,
    availableFrom: 1,
  },
  {
    id: "corrupt_clue",
    name: "CORRUPT CLUE",
    description: "Ubah satu clue yang ditemukan menjadi informasi palsu.",
    effect: "Clue target menjadi fabricated tanpa diketahui pemain lain.",
    dcDetect: 15,
    cooldown: 1,
    isOnce: false,
    availableFrom: 1,
  },
  {
    id: "frame",
    name: "FRAME",
    description: "Tanamkan bukti palsu yang mengarah ke satu pemain spesifik.",
    effect: "Target mendapat Suspicion Token yang terlihat semua orang.",
    dcDetect: 16,
    cooldown: 2,
    isOnce: false,
    availableFrom: 2,
  },
  {
    id: "sabotage",
    name: "SABOTAGE",
    description: "Gagalkan quest aktif saat ini secara diam-diam.",
    effect: "Quest gagal tanpa penjelasan. Reward tidak didapatkan.",
    dcDetect: 14,
    cooldown: 2,
    isOnce: false,
    availableFrom: 2,
  },
  {
    id: "mimic",
    name: "MIMIC SIGNAL",
    description: "Kirim sinyal palsu yang meniru pola perilaku pemain lain.",
    effect:
      "Observer mendapat pembacaan emosional yang salah untuk target yang dipilih.",
    dcDetect: 17,
    cooldown: 2,
    isOnce: false,
    availableFrom: 3,
  },
  {
    id: "lockdown",
    name: "PARTIAL LOCKDOWN",
    description: "Aktifkan lockdown sebagian pada satu area fasilitas.",
    effect: "Satu pemain terisolasi dari ronde ini.",
    dcDetect: 19,
    cooldown: 3,
    isOnce: false,
    availableFrom: 4,
  },
];

// ── System Log Messages (glitch messages) ─────────────────

export const SYSTEM_GLITCH_MSGS = [
  {
    type: "ANOMALY",
    color: "#fbbf24",
    text: "Sensor grid tidak stabil di koridor timur.",
  },
  {
    type: "MOTION",
    color: "#f87171",
    text: "Aktivitas terdeteksi di area yang seharusnya kosong.",
  },
  {
    type: "SYSTEM",
    color: "#57534e",
    text: "Koneksi terputus sesaat. Reconnecting...",
  },
  {
    type: "ANOMALY",
    color: "#fbbf24",
    text: "Frekuensi tidak biasa terdeteksi di Lantai B2.",
  },
  {
    type: "MOTION",
    color: "#f87171",
    text: "Bayangan terlihat di kamera 04 — sudut yang tidak terjangkau.",
  },
  {
    type: "SYSTEM",
    color: "#57534e",
    text: "Log aktivitas terakhir: 23 menit sebelum kedatangan tim.",
  },
];
