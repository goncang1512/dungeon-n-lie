// ─────────────────────────────────────────────────────────
// game-choices.ts
// Sistem pilihan ganda per ronde.
//
// Setiap ronde pemain memilih 1 dari 5 aksi.
// Tiap aksi punya:
//   - stat utama yang dipakai (STR / DEX / INT / PER / CHA)
//   - DC (Difficulty Class)
//   - outcome berbeda untuk tiap karakter (success & fail)
//
// Formula: d20 + modifier(stat) vs DC
//   modifier = Math.floor((statValue - 10) / 2)
// ─────────────────────────────────────────────────────────

import { StatKey, DndClassId } from "./init-game";

// ── Tipe ──────────────────────────────────────────────────

export interface ChoiceOutcomes {
  success: Record<DndClassId, string>;
  fail: Record<DndClassId, string>;
}

export interface ScenarioChoice {
  key: string; // "A" | "B" | "C" | "D" | "E"
  title: string; // Label singkat untuk tombol
  description: string; // Deskripsi aksi
  stat: StatKey; // Stat yang dicheck
  dc: number; // Difficulty Class
  outcomes: ChoiceOutcomes; // Narasi hasil per karakter
}

export interface RoundScenario {
  round: number;
  title: string;
  narrative: string;
  choices: ScenarioChoice[];
}

// ── Helper ────────────────────────────────────────────────

export function getModifier(statValue: number): number {
  return Math.floor((statValue - 10) / 2);
}

// ── Round 1 ───────────────────────────────────────────────

const R1_CHOICES: ScenarioChoice[] = [
  {
    key: "A",
    title: "Periksa brankas PROTOKOL ZERO",
    description: "Analisis mekanisme kunci dan ambil petunjuk di dalamnya.",
    stat: "INT",
    dc: 13,
    outcomes: {
      success: {
        barbarian:
          "Kamu memaksa brankas dengan kapakmu. Petunjuk ditemukan — beberapa rusak tapi cukup untuk dibaca.",
        wizard:
          "Mantramu membuka kunci dalam hitungan detik. Semua isi tersedia lengkap.",
        paladin: "Aura sucimu mengungkap tulisan tersembunyi di dalam brankas.",
        cleric:
          "Wahyumu menunjukkan koneksi antara isi brankas dan ritual lama.",
        bard: "Kamu menemukan dokumen lama dan langsung menghafalnya dengan sempurna.",
        warlock:
          "Pactmu memberimu penglihatan tentang apa yang pernah ada di brankas.",
      },
      fail: {
        barbarian:
          "Terlalu kasar — kamu merusak beberapa dokumen. Petunjuk sebagian hilang.",
        wizard: "Anehnya runenya tidak kamu kenali. Mungkin enkripsi baru.",
        paladin: "Kamu tidak menemukan sesuatu yang bermakna di dalamnya.",
        cleric: "Konsentrasimu terganggu oleh suara dari koridor timur.",
        bard: "Kamu sibuk mencatat tapi malah mencampuradukkan informasi.",
        warlock: "Visimu terputus — ada sesuatu yang menghalangi dari dalam.",
      },
    },
  },
  {
    key: "B",
    title: "Ikuti jejak darah ke lorong timur",
    description: "Menyelidiki ke mana jejak itu berakhir sebelum orang lain.",
    stat: "PER",
    dc: 12,
    outcomes: {
      success: {
        barbarian:
          "Instingmu menuntunmu ke titik akhir jejak — sebuah pintu yang terkunci dari dalam.",
        wizard:
          "Analisismu menunjukkan pola — darah ini bukan dari satu orang.",
        paladin:
          "Kamu merasakan kehadiran gelap di ujung koridor — tapi sudah pergi.",
        cleric:
          "Tanda-tanda di dinding menunjukkan ritual darurat pernah dilakukan di sini.",
        bard: "Kamu merekam semua detail koridor dalam ingatanmu secara akurat.",
        warlock:
          "Penglihatan gelapmu mendeteksi jejak energi residual — seseorang diseret.",
      },
      fail: {
        barbarian:
          "Kamu langsung masuk tanpa hati-hati dan menginjak jejak penting.",
        wizard:
          "Terlalu banyak variabel — kamu tidak bisa menyimpulkan sesuatu yang pasti.",
        paladin: "Kabut di koridor mengaburkan pandanganmu.",
        cleric:
          "Kamu melihat tanda-tanda tapi tidak bisa membacanya dengan benar.",
        bard: "Kamu terlalu fokus pada ambience sampai lupa mencatat apa yang ditemukan.",
        warlock: "Koridor ini memblokir kemampuan persepsimu secara misterius.",
      },
    },
  },
  {
    key: "C",
    title: "Akses terminal komputer menyala",
    description: "Hack atau baca data yang sedang bergulir di monitor.",
    stat: "INT",
    dc: 15,
    outcomes: {
      success: {
        barbarian:
          "Kamu menghantam keyboard dengan cara yang tidak biasa — dan berhasil masuk secara tidak sengaja.",
        wizard:
          "Mudah. Enkripsinya adalah cipher lama yang kamu pelajari 20 tahun lalu.",
        paladin:
          "Kamu menemukan cara akses suci yang tersembunyi di antarmuka.",
        cleric:
          "Wahyumu mengungkap file tersembunyi di antara data yang bergulir.",
        bard: "Kamu menggoda sistem AI fasilitas hingga memberikan akses penuh.",
        warlock: "Pactmu memberimu koneksi langsung ke inti sistem.",
      },
      fail: {
        barbarian:
          "Terlalu rumit. Kamu hampir memperbarui firmware tapi salah tombol.",
        wizard: "Sistemnya menggunakan protokol yang bahkan tidak kamu kenali.",
        paladin: "Antarmuka yang tidak familiar membuatmu tidak bisa masuk.",
        cleric:
          "Kamu bisa membaca sebagian tapi datanya rusak dan tidak bisa disimpulkan.",
        bard: "Sistem mendeteksi intrusimu dan mengunci sebagian akses.",
        warlock: "Koneksimu terputus sebelum mendapat informasi berguna.",
      },
    },
  },
  {
    key: "D",
    title: "Intimidasi pemain yang paling diam",
    description: "Gunakan tekanan psikologis untuk memancing informasi.",
    stat: "CHA",
    dc: 14,
    outcomes: {
      success: {
        barbarian:
          "Tatapan dan posturmu yang mengintimidasi membuatnya bicara tanpa sadar.",
        wizard:
          "Logika dinginmu membuat dia tidak punya pilihan selain mengakui.",
        paladin:
          "Aura otoritasmu membuat mereka merasa tidak bisa berbohong padamu.",
        cleric:
          "Kamu membaca mikro-ekspresinya dan mengetahui dia menyembunyikan sesuatu.",
        bard: "Kamu memainkan psikologinya dengan sempurna — dia memberikan petunjuk tanpa sadar.",
        warlock: "Hex-mu membuatnya tidak nyaman dan dia akhirnya bicara.",
      },
      fail: {
        barbarian: "Terlalu agresif — dia malah menutup diri sepenuhnya.",
        wizard: "Terlalu dingin dan analitik — tidak ada resonansi emosional.",
        paladin:
          "Kamu terlalu jujur dalam pendekatanmu dan dia tahu kamu tidak punya bukti.",
        cleric: "Pendekatanmu terlalu lembut — dia tidak merasa tertekan.",
        bard: "Kamu mencoba terlalu keras dan dia langsung tahu kamu bluffing.",
        warlock: "Kamu gagal membangun tekanan yang cukup kali ini.",
      },
    },
  },
  {
    key: "E",
    title: "Diam dan amati semua pemain",
    description: "Tidak bertindak aktif — kumpulkan data perilaku semua orang.",
    stat: "PER",
    dc: 11,
    outcomes: {
      success: {
        barbarian:
          "Instingmu menangkap seseorang yang gerakannya tidak wajar saat lampu berkedip.",
        wizard:
          "Kamu menganalisis pola bicara setiap orang — satu terasa tidak konsisten.",
        paladin:
          "Aura kehadiranmu yang tenang membuat orang-orang berperilaku alami di dekatmu.",
        cleric:
          "Kamu mendeteksi ketegangan yang tidak wajar antara dua orang tertentu.",
        bard: "Kamu mencatat gestur, intonasi, dan micro-expression semua orang secara detail.",
        warlock:
          "Devil's Sight-mu mendeteksi sesuatu yang tidak bisa dilihat orang lain.",
      },
      fail: {
        barbarian:
          "Kamu tidak bisa fokus cukup lama untuk mengamati dengan efektif.",
        wizard:
          "Terlalu banyak variabel — analisismu tidak menghasilkan kesimpulan berguna.",
        paladin: "Kamu ikut teralihkan oleh kejadian di koridor timur.",
        cleric: "Konsentrasimu buyar saat suara aneh terdengar dari ventilasi.",
        bard: "Kamu malah jadi subject perhatian, bukan yang mengamati.",
        warlock:
          "Sesuatu mengganggu persepsimu — mungkin ada perlindungan di ruangan ini.",
      },
    },
  },
];

// ── Round 2 ───────────────────────────────────────────────

const R2_CHOICES: ScenarioChoice[] = [
  {
    key: "A",
    title: "Dekripsi catatan Dr. V",
    description: "Coba baca enkripsi dalam catatan peneliti yang ditemukan.",
    stat: "INT",
    dc: 16,
    outcomes: {
      success: {
        barbarian:
          "Kekerasan mentalmu menjebol logika enkripsi — kamu membacanya dengan cara yang aneh tapi benar.",
        wizard:
          "Algoritma lama. Kamu memecahkannya dalam hitungan menit dan menemukan semua yang tersembunyi.",
        paladin:
          "Cahaya sorgawi menerangi simbolmu — kamu membaca maksud di balik kata-katanya.",
        cleric:
          "Wahyu mengalir — kamu memahami konteks spiritual dari catatan ini.",
        bard: "Kamu menyadari catatan ini ditulis dalam kode musik tersembunyi. Sempurna bagimu.",
        warlock: "Entitasmu membisikkan terjemahan langsung ke dalam benakmu.",
      },
      fail: {
        barbarian: "Terlalu abstrak. Kamu hanya memahami sebagian kecil.",
        wizard:
          "Enkripsi tingkat militer — bahkan kamu butuh lebih banyak waktu untuk ini.",
        paladin: "Simbolnya bukan dari tradisi yang kamu kenal.",
        cleric:
          "Kamu memahami nada emosionalnya tapi bukan isinya secara literal.",
        bard: "Kodenya terlalu teknis bahkan untuk improvisasimu.",
        warlock: "Paktumu tidak menjawab kali ini — terlalu banyak gangguan.",
      },
    },
  },
  {
    key: "B",
    title: "Analisis sidik jari di brankas",
    description:
      "Gunakan observasi tajam untuk mengidentifikasi siapa yang menyentuh brankas.",
    stat: "PER",
    dc: 16,
    outcomes: {
      success: {
        barbarian:
          "Matamu yang terlatih di padang perang mengenali pola tekanan — tangan kanan, jari tengah dominan.",
        wizard:
          "Dengan loupe improvisasi, kamu mengkategorikan sidik jari berdasarkan anatomi tangan.",
        paladin:
          "Aura kebenaran membantumu membedakan mana jejak baru dan mana yang lama.",
        cleric:
          "Intuisimu memberitahu ukuran tangan ini cocok dengan seseorang yang ada di ruangan ini.",
        bard: "Kamu membandingkan cara pemain lain memegang benda-benda — dan menemukan kecocokan.",
        warlock:
          "Penglihatan spesialmu menembus waktu — kamu melihat siapa yang menyentuhnya.",
      },
      fail: {
        barbarian:
          "Terlalu kecil dan detail. Kamu tidak terlatih untuk forensik seperti ini.",
        wizard: "Kamu butuh peralatan yang tidak ada di sini.",
        paladin: "Kamu tidak bisa membedakan sidik jari yang berlapis-lapis.",
        cleric:
          "Ternyata ada terlalu banyak lapisan sidik jari untuk disimpulkan.",
        bard: "Kamu mencoba tapi tidak cukup perhatian untuk perbedaan kecil ini.",
        warlock: "Visimu tidak cukup jelas untuk detail sekecil ini.",
      },
    },
  },
  {
    key: "C",
    title: "Ajak bicara pemain lain secara private",
    description:
      "Dekati satu pemain dan bangun kepercayaan atau cari informasi.",
    stat: "CHA",
    dc: 13,
    outcomes: {
      success: {
        barbarian:
          "Ketulusanmu yang kasar justru disukainya — dia membuka diri lebih dari yang kamu duga.",
        wizard:
          "Analisis psikologismu membuat percakapan sangat efisien — dia memberikan data berguna.",
        paladin:
          "Kehadiranmu yang terpercaya membuatnya merasa aman untuk berbagi.",
        cleric:
          "Empatimu yang tulus membuat dia mau cerita tentang ketakutannya.",
        bard: "Kamu membangun rapport dengan sangat cepat — dia bahkan tidak sadar sudah bicara banyak.",
        warlock: "Karisma supranaturalmu membuat dia sangat nyaman bersamamu.",
      },
      fail: {
        barbarian:
          "Kamu terlalu blunt — dia merasa diinterogasi dan menutup diri.",
        wizard: "Terlalu formal dan analitik — tidak ada koneksi personal.",
        paladin: "Dia merasa kamu menghakimi — bukan membantu.",
        cleric:
          "Kamu terlalu fokus pada informasi sampai lupa membangun kepercayaan.",
        bard: "Kamu terlalu banyak bicara tentang dirimu sendiri.",
        warlock: "Kamu terlalu intens — dia justru menjauh.",
      },
    },
  },
  {
    key: "D",
    title: "Sabotase (khusus malam)",
    description: "Diam-diam rusak peralatan atau sembunyikan petunjuk penting.",
    stat: "DEX",
    dc: 15,
    outcomes: {
      success: {
        barbarian:
          "Kamu bergerak lebih pelan dari biasanya dan berhasil melakukannya tanpa ketahuan.",
        wizard: "Mantramu menyembunyikan jejakmu — aksi berjalan sempurna.",
        paladin:
          "Dengan langkah terlatih, kamu berhasil melakukannya tanpa suara.",
        cleric: "Doa pelindungmu menutupi gerakanmu dari perhatian orang lain.",
        bard: "Kamu membuat distraksi kecil sambil tanganmu bekerja — sempurna.",
        warlock: "Kegelapan menjadi mantelmu — tidak ada yang melihat.",
      },
      fail: {
        barbarian:
          "Terlalu berisik — seseorang memperhatikanmu bergerak mencurigakan.",
        wizard: "Mantramu gagal dan suara kecil terdengar oleh seseorang.",
        paladin:
          "Kamu tidak terbiasa dengan tindakan licik — gerakanmu tidak alami.",
        cleric:
          "Tanganmu gemetar saat melakukan hal yang bertentangan dengan nuranimu.",
        bard: "Distraksimu terlalu mencolok dan malah menarik lebih banyak perhatian.",
        warlock: "Sesuatu menghentikan kekuatanmu tepat di momen kritis.",
      },
    },
  },
  {
    key: "E",
    title: "Bertahan dan lindungi diri",
    description:
      "Posisikan dirimu di tempat aman dan waspada terhadap ancaman.",
    stat: "STR",
    dc: 10,
    outcomes: {
      success: {
        barbarian:
          "Kamu menemukan posisi bertahan sempurna — tidak ada yang bisa mendekatimu tanpa ketahuan.",
        wizard: "Ward defensifmu aktif — kamu aman dan bisa mengobservasi.",
        paladin: "Tamengmu dan posisimu memberikan perlindungan maksimal.",
        cleric:
          "Doa perlindunganmu menciptakan lingkaran keamanan yang kamu rasakan.",
        bard: "Kamu menemukan spot akustik yang sempurna — kamu mendengar segalanya.",
        warlock: "Pactmu memberikan lapisan perlindungan tak terlihat.",
      },
      fail: {
        barbarian: "Kamu terlalu gelisah untuk bertahan di satu tempat.",
        wizard: "Ward-mu tidak stabil di lingkungan fasilitas yang aneh ini.",
        paladin: "Naluri menyerangmu terlalu kuat — kamu tidak bisa diam.",
        cleric: "Doamu tidak menjangkau dengan baik di tempat ini.",
        bard: "Kamu bosan dan mulai bergerak tidak perlu.",
        warlock: "Entitasmu tidak memberikan perlindungan malam ini.",
      },
    },
  },
];

// ── Round 3 ───────────────────────────────────────────────

const R3_CHOICES: ScenarioChoice[] = [
  {
    key: "A",
    title: "Akses server inti — cari identitas GUEST_07",
    description:
      "Gunakan terminal server untuk ungkap siapa di balik akun misterius.",
    stat: "INT",
    dc: 18,
    outcomes: {
      success: {
        barbarian:
          "Dengan naluri perangmu, kamu menebak sequence password dan masuk secara brutal.",
        wizard:
          "Dalam 3 menit kamu menemukan log lengkap — GUEST_07 login dari terminal di lorong utara.",
        paladin:
          "Petunjuk suci menuntunmu ke file yang tepat — identitas terungkap sebagian.",
        cleric:
          "Wahyumu menunjukkan file yang tersembunyi di balik folder sistem.",
        bard: "Kamu menemukan bahwa GUEST_07 meninggalkan jejak audio di file log — kamu mengenali suaranya.",
        warlock:
          "Pactmu menghubungkanmu langsung ke lapisan tersembunyi server.",
      },
      fail: {
        barbarian: "Server ini terlalu sophisticated untuk caramu.",
        wizard:
          "Sistem memiliki lapisan keamanan yang bahkan kamu belum pernah temui.",
        paladin: "Navigasimu di sistem digital sangat terbatas.",
        cleric:
          "Kamu menemukan petunjuk tapi tidak bisa menyimpulkan identitas pasti.",
        bard: "Kamu hampir berhasil tapi sistem membutuhkan kode yang tidak kamu punya.",
        warlock:
          "Entitasmu menolak membantu — mungkin ada risiko yang tidak kamu lihat.",
      },
    },
  },
  {
    key: "B",
    title: "Periksa kamera yang dipindahkan",
    description:
      "Analisis kenapa kamera dipindahkan dan apa yang disembunyikan.",
    stat: "PER",
    dc: 14,
    outcomes: {
      success: {
        barbarian:
          "Matamu langsung menemukan titik buta yang diciptakan — dan siapa yang paling diuntungkan.",
        wizard:
          "Sudut matematis perpindahan kamera menunjukkan tujuan sabotase yang sangat spesifik.",
        paladin: "Kamu merasakan kehadiran niat jahat di sekitar kamera ini.",
        cleric:
          "Tanda-tanda menunjukkan kamera ini dipindahkan tepat sebelum kejadian penting.",
        bard: "Kamu menyadari pola perpindahan kamera sama dengan pola sabotase dalam cerita lama yang kamu tahu.",
        warlock:
          "Penglihatan residualmu menunjukkan siapa yang ada di sini saat kamera dipindahkan.",
      },
      fail: {
        barbarian:
          "Kamu tidak bisa melihat signifikansi dari perubahan sudut sekecil ini.",
        wizard:
          "Kamu membutuhkan data historis posisi kamera yang tidak tersedia.",
        paladin:
          "Kamu tidak bisa memastikan apakah ini sabotase atau memang seperti ini dari awal.",
        cleric:
          "Terlalu banyak kemungkinan penjelasan — kamu tidak bisa menyimpulkan.",
        bard: "Kamu kehilangan perhatian sebelum selesai menganalisis.",
        warlock: "Visimu terlalu kabur untuk detail teknis seperti ini.",
      },
    },
  },
  {
    key: "C",
    title: "Tantang pemain lain di depan semua orang",
    description: "Ungkap kecurigaanmu secara terbuka dan paksa reaksi.",
    stat: "CHA",
    dc: 15,
    outcomes: {
      success: {
        barbarian:
          "Konfrontasi langsungmu membuat target kehilangan kendali dan memberi info yang tidak sengaja.",
        wizard:
          "Argumenmu yang logis dan terstruktur membuat target tidak punya alibi yang meyakinkan.",
        paladin:
          "Otoritas moralmu membuat semua orang mendengarkan — dan target merasa terekspos.",
        cleric:
          "Kata-katamu yang bijak membuat target reaktif — kamu membaca kebenarannya dari reaksinya.",
        bard: "Kamu membuat momen dramatis yang memaksa target merespons dan mengungkap inkonsistensi.",
        warlock:
          "Aura intimidasimu membuat target gemetar dan bicara lebih dari yang direncanakan.",
      },
      fail: {
        barbarian:
          "Terlalu agresif — semua orang melihat kamu sebagai ancaman, bukan target.",
        wizard: "Terlalu dingin — tidak ada drama, tidak ada reaksi berguna.",
        paladin:
          "Target berhasil membalikkan argumenmu dan kamu terlihat tidak yakin.",
        cleric:
          "Kamu terlihat terlalu yakin tanpa bukti — orang lain malah meragukan kamu.",
        bard: "Dramamu backfire — target malah jadi simpati dari pemain lain.",
        warlock:
          "Target tidak merespons seperti yang kamu harapkan — dia lebih terlatih dari perkiraanmu.",
      },
    },
  },
  {
    key: "D",
    title: "Cari lorong tersembunyi di server room",
    description: "Ada sesuatu yang tidak terlihat di peta resmi fasilitas.",
    stat: "PER",
    dc: 13,
    outcomes: {
      success: {
        barbarian:
          "Instingmu menemukan panel yang sedikit berbeda teksturnya dari dinding sekitarnya.",
        wizard:
          "Analisis geometri ruangan menunjukkan ada ruang kosong yang tidak seharusnya ada.",
        paladin:
          "Doamu menuntunmu ke area yang tersembunyi dari pandangan normal.",
        cleric:
          "Kamu merasakan sesuatu menarikmu ke sudut yang terlihat biasa.",
        bard: "Kamu mendengar perbedaan akustik dinding — satu sisi terdengar hollow.",
        warlock:
          "Penglihatan gelapmu menembus dinding dan menemukan apa yang tersembunyi.",
      },
      fail: {
        barbarian:
          "Kamu mengetuk setiap dinding tapi tidak menemukan sesuatu yang berbeda.",
        wizard:
          "Kalkulasimu menunjukkan tidak ada ruang tersembunyi — atau perhitunganmu salah.",
        paladin: "Instingmu tidak mendeteksi sesuatu yang tidak biasa.",
        cleric: "Kamu tidak merasakan sesuatu yang menuntunmu ke mana pun.",
        bard: "Akustik ruangan terlalu berisik dari dengungan server.",
        warlock: "Kali ini paktumu diam — tidak ada petunjuk yang diberikan.",
      },
    },
  },
  {
    key: "E",
    title: "Corrupt data untuk lindungi informasimu",
    description: "Hapus atau sembunyikan petunjuk yang mengarah ke dirimu.",
    stat: "DEX",
    dc: 14,
    outcomes: {
      success: {
        barbarian:
          "Kamu merusak fisik media penyimpanan dengan cara yang terlihat seperti kerusakan alami.",
        wizard:
          "Kamu menanam data palsu yang akan menyesatkan siapa pun yang mencari.",
        paladin:
          "Kamu memindahkan dokumen ke tempat yang tidak akan ditemukan dengan mudah.",
        cleric: "Doamu menyembunyikan jejak digitalmu dari sistem.",
        bard: "Kamu mengalihkan perhatian pemain lain saat tanganmu bekerja di terminal.",
        warlock: "Inkantasimu menghapus jejak spesifik dari memori server.",
      },
      fail: {
        barbarian:
          "Kamu merusak terlalu banyak hal — justru menarik perhatian.",
        wizard: "Sistem keamanan mendeteksi perubahanmu dan mencatat anomali.",
        paladin: "Tanganmu hesitate di momen kritis — nuranimu menghalangi.",
        cleric:
          "Kamu tidak bisa membohongi sistem — terlalu banyak lapisan keamanan.",
        bard: "Distraksiku tidak cukup lama — seseorang melihatmu.",
        warlock: "Entitasmu tidak memberikan bantuan untuk tindakan ini.",
      },
    },
  },
];

// ── Round 4 ───────────────────────────────────────────────

const R4_CHOICES: ScenarioChoice[] = [
  {
    key: "A",
    title: "Nonaktifkan PROTOKOL ZERO",
    description: "Cegah lockdown permanen yang sedang diaktifkan dari dalam.",
    stat: "CHA",
    dc: 17,
    outcomes: {
      success: {
        barbarian:
          "Kamu berteriak untuk meyakinkan semua orang bekerja bersama — dan entah bagaimana berhasil.",
        wizard:
          "Kamu menemukan bypass legal dalam sistem dan menonaktifkan protokol secara elegan.",
        paladin:
          "Otoritas dan kepercayaanmu memungkinkan semua orang mengikutimu mengeksekusi solusi.",
        cleric:
          "Doamu menenangkan sistem — seolah fasilitas ini pun bisa mendengarkan.",
        bard: "Kamu menegosiasi, merayu, dan membujuk setiap pemain untuk bertindak bersama.",
        warlock: "Kamu menawarkan kesepakatan kepada sistem — dan diterima.",
      },
      fail: {
        barbarian:
          "Terlalu keras kepala — kamu tidak bisa meyakinkan siapa pun.",
        wizard:
          "Bypass-mu gagal — sistem memiliki fallback yang tidak kamu antisipasi.",
        paladin: "Tim tidak bergerak cukup cepat meskipun kamu memimpin.",
        cleric: "Doamu tidak cukup kuat untuk menghentikan sistem mekanik.",
        bard: "Negosiasifmu tidak berhasil — seseorang menolak bekerja sama.",
        warlock:
          "Kesepakatan ditolak — ada kekuatan lain yang mengontrol sistem ini.",
      },
    },
  },
  {
    key: "B",
    title: "Analisis kartu nama asing",
    description: "Identifikasi asal kartu ketujuh yang tidak seharusnya ada.",
    stat: "INT",
    dc: 17,
    outcomes: {
      success: {
        barbarian:
          "Kamu mengenali bahan kartu ini — dibuat di kota asal seseorang yang ada di ruangan ini.",
        wizard:
          "Analisis tinta, tipografi, dan bahan menunjukkan kartu ini dicetak dalam 48 jam terakhir.",
        paladin:
          "Aura dari kartu ini terasa berbeda — seperti bukan milik orang yang sudah mati.",
        cleric:
          "Wahyumu menunjukkan bahwa nama di kartu ini terhubung ke seseorang yang ada di sini.",
        bard: "Kamu mengenali font dan layout kartu ini — mirip dengan kartu seseorang yang pernah kamu temui.",
        warlock:
          "Entitasmu membisikkan nama yang tersembunyi di balik nama yang tercetak.",
      },
      fail: {
        barbarian: "Analisis detail bukan kekuatanmu.",
        wizard: "Data yang tersedia tidak cukup untuk kesimpulan definitif.",
        paladin: "Kamu tidak menemukan koneksi yang bisa dikonfirmasi.",
        cleric: "Wahyumu tidak memberikan jawaban yang jelas kali ini.",
        bard: "Kamu tidak mengenali apapun yang familiar dari kartu ini.",
        warlock: "Paktumu diam — mungkin ini memang jalan buntu.",
      },
    },
  },
  {
    key: "C",
    title: "Bertahan dari serangan mendadak",
    description: "Sesuatu bergerak di kegelapan — respons cepat atau terluka.",
    stat: "STR",
    dc: 14,
    outcomes: {
      success: {
        barbarian:
          "Refleksmu luar biasa — kamu menangkis serangan dan membalas dengan brutal.",
        wizard: "Ward defensifmu aktif tepat waktu — serangan memantul.",
        paladin:
          "Tameng dan latihanmu mengambil alih — serangan tidak menembus pertahananmu.",
        cleric: "Doa perlindunganmu aktif secara instingtif — kamu aman.",
        bard: "Kamu menghindari serangan dengan gerakan akrobatik yang tidak terduga.",
        warlock: "Paktumu memberikan perlindungan ajaib di momen kritis.",
      },
      fail: {
        barbarian:
          "Bahkan kamu terkejut — kamu terluka ringan sebelum berhasil bertahan.",
        wizard: "Ward-mu tidak aktif cukup cepat — kamu terkena dampak kecil.",
        paladin:
          "Kamu memblokir tapi serangan cukup kuat untuk merobohkan keseimbanganmu.",
        cleric: "Doamu terlambat — kamu terguncang.",
        bard: "Kamu menghindari serangan utama tapi jatuh dan kehilangan momentum.",
        warlock: "Perlindunganmu tidak aktif kali ini.",
      },
    },
  },
  {
    key: "D",
    title: "Bangun alibi bersama pemain lain",
    description:
      "Pastikan seseorang bisa memverifikasi lokasimu di waktu kritis.",
    stat: "CHA",
    dc: 12,
    outcomes: {
      success: {
        barbarian:
          "Kejujuran kasarmu justru meyakinkan — dia percaya kamu dan setuju.",
        wizard: "Kamu menyusun alibi yang logis dan tidak bisa dibantah.",
        paladin: "Kepercayaanmu yang natural membuatnya dengan mudah setuju.",
        cleric:
          "Hubungan emosionalmu yang dalam membuatnya ingin melindungimu.",
        bard: "Kamu membangun alibi sambil membuat cerita yang coherent dan natural.",
        warlock:
          "Charm supranaturalmu membuat orang ini yakin tanpa pertanyaan.",
      },
      fail: {
        barbarian: "Kamu terdengar terlalu defensif — justru mencurigakan.",
        wizard: "Terlalu kalkulatif — dia tahu kamu sedang memanipulasi.",
        paladin:
          "Kamu tidak mau berbohong sepenuhnya — alibimu terasa tidak natural.",
        cleric: "Hatimu tidak ada di sini — dia bisa merasakan kebohonganmu.",
        bard: "Kamu terlalu obvious — dia tahu persis apa yang sedang kamu lakukan.",
        warlock:
          "Charm-mu gagal — entah dia kebal atau ada kekuatan lain yang melindunginya.",
      },
    },
  },
  {
    key: "E",
    title: "Selidiki rekaman suara yang dipalsukan",
    description:
      "Verifikasi apakah rekaman pengakuan itu asli atau manipulasi.",
    stat: "PER",
    dc: 19,
    outcomes: {
      success: {
        barbarian:
          "Telingamu yang terlatih di medan perang menangkap discontinuity dalam rekaman.",
        wizard:
          "Analisis frekuensi audio menunjukkan tanda-tanda splicing yang jelas.",
        paladin:
          "Kamu merasakan ketidaktulusan dalam suara — ada yang dipaksakan.",
        cleric:
          "Wahyumu mengungkap bahwa rekaman ini memanipulasi kebenaran secara terstruktur.",
        bard: "Kamu langsung mengenali teknik manipulasi audio ini — kamu pernah menggunakannya sendiri.",
        warlock:
          "Pendengaranmu melampaui batas normal — kamu mendengar suara asli di balik manipulasi.",
      },
      fail: {
        barbarian: "Kamu tidak bisa membedakan mana yang asli.",
        wizard:
          "Tanpa peralatan analisis audio, kamu tidak bisa memverifikasi.",
        paladin: "Kamu merasakan sesuatu tapi tidak bisa membuktikannya.",
        cleric: "Wahyumu memberikan keraguan tapi bukan kepastian.",
        bard: "Tekniknya terlalu canggih bahkan untuk standarmu.",
        warlock: "Manipulasinya terlalu dalam untuk kamu tembus.",
      },
    },
  },
];

// ── Round 5 ───────────────────────────────────────────────

const R5_CHOICES: ScenarioChoice[] = [
  {
    key: "A",
    title: "Paksa pintu keluar secara fisik",
    description:
      "Gunakan kekuatan brute untuk membuka pintu yang terkunci sistem.",
    stat: "STR",
    dc: 18,
    outcomes: {
      success: {
        barbarian:
          "Kapakmu menghancurkan panel kontrol. Pintu terbuka paksa. Alarm berbunyi — tapi kalian bebas.",
        wizard:
          "Kamu menemukan titik lemah struktur pintu dan meledakkannya dengan mantra.",
        paladin:
          "Kekuatan sucimu melipatgandakan kekuatan fisikmu — pintu roboh.",
        cleric:
          "Doa kekuatanmu mengalir ke tanganmu — dorongan terakhir yang dibutuhkan.",
        bard: "Kamu mengkoordinasikan semua orang untuk mendorong serentak — berhasil.",
        warlock: "Paktumu memberikan kekuatan luar biasa selama 3 detik.",
      },
      fail: {
        barbarian:
          "Bahkan kekuatanmu tidak cukup untuk ini. Pintu ini dirancang anti-brute.",
        wizard: "Mantramu tidak cukup kuat untuk material pintu ini.",
        paladin: "Pintu ini tidak menyerah bahkan pada kekuatan sucimu.",
        cleric: "Kamu menghabiskan tenagamu tanpa hasil.",
        bard: "Koordinasimu gagal di momen terakhir.",
        warlock: "Kekuatan yang diberikan paktumu tidak cukup.",
      },
    },
  },
  {
    key: "B",
    title: "Hack sistem untuk buka pintu",
    description: "Override autentikasi dan buka pintu dari sistem.",
    stat: "INT",
    dc: 20,
    outcomes: {
      success: {
        barbarian: "Kamu menemukan cara fisik untuk membypass chip kontrol.",
        wizard:
          "Ini yang kamu latih seluruh hidupmu. Sistem terbuka dalam 90 detik.",
        paladin:
          "Doamu membukakan jalur yang kamu tidak mengerti sepenuhnya — tapi berhasil.",
        cleric: "Wahyu menunjukkan urutan kode yang tepat.",
        bard: "Kamu menegosiasi dengan AI sistem — dan memenangkan argumennya.",
        warlock: "Paktumu memberikan akses langsung ke inti sistem.",
      },
      fail: {
        barbarian: "Terlalu rumit.",
        wizard:
          "Sistem memiliki proteksi AI yang tidak bisa ditembus bahkan olehmu.",
        paladin: "Kamu tidak punya kemampuan teknis untuk ini.",
        cleric: "Wahyumu tidak menjangkau logika sistem digital.",
        bard: "AI sistem tidak terpengaruh oleh persuasimu.",
        warlock:
          "Entitasmu menolak membantu — mungkin sistem ini milik kekuatan yang lebih besar.",
      },
    },
  },
  {
    key: "C",
    title: "Ungkap infiltrator di depan semua orang",
    description:
      "Satu tuduhan terakhir — benar atau salah, ini menentukan segalanya.",
    stat: "CHA",
    dc: 16,
    outcomes: {
      success: {
        barbarian:
          "Tuduhanmu yang langsung dan tanpa basa-basi justru membuat infiltrator tidak siap.",
        wizard:
          "Argumenmu yang logis dan berbasis bukti tidak bisa dibantah oleh siapa pun.",
        paladin: "Kehadiran dan otoritasmu memimpin semua orang ke kebenaran.",
        cleric: "Kata-katamu dipenuhi konviksi yang tidak bisa diragukan.",
        bard: "Kamu membangun momen klimaks yang sempurna — semua orang menyaksikan kebenarannya.",
        warlock:
          "Tuduhan suprarnaturalmu menembus semua pertahanan psikologis.",
      },
      fail: {
        barbarian:
          "Terlalu agresif — kamu terlihat tidak rasional dan tidak dipercaya.",
        wizard: "Argumentasimu terlalu dingin — tidak ada resonansi emosional.",
        paladin: "Target membalikkan argumenmu dengan sangat baik.",
        cleric: "Kamu ragu di momen terakhir dan semua orang melihatnya.",
        bard: "Kamu membuat drama tapi gagal mengungkap fakta yang kuat.",
        warlock: "Target memiliki perlindungan yang tidak kamu antisipasi.",
      },
    },
  },
  {
    key: "D",
    title: "Lindungi pemain yang terancam",
    description:
      "Seseorang dalam bahaya — kamu bisa melindungi mereka atau tidak.",
    stat: "STR",
    dc: 14,
    outcomes: {
      success: {
        barbarian:
          "Tubuhmu menjadi perisai. Tidak ada yang menembus pertahananmu.",
        wizard: "Ward-mu melindungi keduamu dengan sempurna.",
        paladin:
          "Ini yang kamu latih — melindungi yang lemah. Berhasil sempurna.",
        cleric: "Doa perlindunganmu mencakup keduanya.",
        bard: "Kamu menarik perhatian ancaman ke dirimu sendiri — memberikan waktu untuk melarikan diri.",
        warlock: "Paktumu memberikan perlindungan ganda di momen kritis.",
      },
      fail: {
        barbarian:
          "Kamu terlambat satu detik — kamu berhasil melindungi tapi ikut terluka.",
        wizard: "Ward-mu hanya cukup untuk satu orang.",
        paladin: "Kamu berhasil melindungi tapi posisimu terekspos.",
        cleric: "Doa perlindunganmu terlambat — dia terluka ringan.",
        bard: "Manuvermu tidak berhasil dan keduanya terkena dampak.",
        warlock: "Perlindunganmu gagal di momen terpenting.",
      },
    },
  },
  {
    key: "E",
    title: "Jalani autentikasi terakhir",
    description: "Sistem memverifikasi identitasmu — murni atau anomali?",
    stat: "CHA",
    dc: 15,
    outcomes: {
      success: {
        barbarian:
          "Kejujuran mentahmu melewati bahkan deteksi kebohongan paling canggih.",
        wizard:
          "Kamu memahami cara sistem memverifikasi dan memberikan respons yang tepat.",
        paladin: "Kemurnian niatmu terasa oleh sistem — kamu lolos.",
        cleric: "Ketulusan doamu menjawab verifikasi sistem.",
        bard: "Kamu tahu cara mempresentasikan diri — sistem percaya.",
        warlock: "Kamu berhasil menyembunyikan anomalimu dari sistem.",
      },
      fail: {
        barbarian: "Sistem mendeteksi sesuatu yang tidak kamu mengerti.",
        wizard: "Sistem lebih pintar dari perkiraanmu.",
        paladin:
          "Ada sesuatu dalam dirimu yang sistem tandai sebagai tidak normal.",
        cleric: "Keraguan batinmu terbaca oleh sistem.",
        bard: "Kamu tidak bisa menyembunyikan inkonsistensi identitasmu.",
        warlock: "Sistem mendeteksi anomali biologis pada dirimu.",
      },
    },
  },
];

// ── Semua skenario ─────────────────────────────────────────

export const ROUND_SCENARIOS: RoundScenario[] = [
  {
    round: 1,
    title: "Pendaratan",
    narrative:
      "Kalian tiba di ruang penerimaan utama — Lantai B1. Terminal komputer di sudut masih menyala. Di tengah ruangan terdapat brankas terbuka bertanda PROTOKOL ZERO. Jejak darah kering mengarah ke lorong timur.",
    choices: R1_CHOICES,
  },
  {
    round: 2,
    title: "Laboratorium Bawah",
    narrative:
      "Lorong timur membawa kalian ke Laboratorium Biokimia — Lantai B2. Catatan Dr. V berbicara tentang 'perubahan yang tidak terasa'. Sidik jari asing ditemukan di brankas. Seseorang di antara kalian tahu lebih banyak dari yang mereka katakan.",
    choices: R2_CHOICES,
  },
  {
    round: 3,
    title: "Ruang Server",
    narrative:
      "Lantai B3. Server tower berjajar dalam kegelapan. Log aktivitas menunjukkan GUEST_07 mengakses semua profil tim. Kamera dipindahkan untuk menciptakan titik buta. Sesuatu sedang direncanakan dari dalam.",
    choices: R3_CHOICES,
  },
  {
    round: 4,
    title: "Ruang Protokol Zero",
    narrative:
      "Ruang tersembunyi ditemukan. Enam kartu nama — ditambah satu yang tidak seharusnya ada. Rekaman pengakuan ditemukan tapi terdengar dipalsukan. Waktu hampir habis dan seseorang sedang mengaktifkan PROTOKOL ZERO.",
    choices: R4_CHOICES,
  },
  {
    round: 5,
    title: "Titik Akhir",
    narrative:
      "Pintu keluar ada di depan kalian. Dua menit sebelum lockdown permanen aktif. Semua pertanyaan harus dijawab sekarang. Siapa yang benar-benar ingin keluar bersama? Dan siapa yang tidak ingin kalian sampai?",
    choices: R5_CHOICES,
  },
];

// ── Helper: dapatkan scenario untuk ronde tertentu ─────────

export function getScenarioForRound(round: number): RoundScenario | null {
  return ROUND_SCENARIOS.find((s) => s.round === round) ?? null;
}
