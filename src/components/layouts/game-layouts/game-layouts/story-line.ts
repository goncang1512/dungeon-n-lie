import { MatchPlayer } from "../game-wrapper";

export const STORY_LINE = {
  game_name: "The Cursed Dungeon",
  setting: {
    location: "Ancient Dungeon of Eldrath",
    story:
      "Enam petualang memasuki dungeon kuno Eldrath untuk mencari artefak legendaris bernama Heart of Eternity. Namun tanpa mereka ketahui, salah satu dari mereka telah dipengaruhi oleh entitas kuno yang tersegel di dalam dungeon dan diam-diam menjadi Infiltrator.",
  },
  stages: [
    // ══════════════════════════════════════════════════════
    // CHAPTER 1 — THE OUTER DUNGEON
    // ══════════════════════════════════════════════════════
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
            effect: { chaos: 1 },
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
    {
      id: "3",
      title: "The Mossy Corridor",
      story:
        "Lorong berlumut dengan dinding yang basah dan licin. Jejak kaki samar terlihat menuju kedalaman dungeon.",
      choices: [
        {
          id: "track_footprints",
          label: "Mengikuti jejak kaki",
          required_stat: "PER",
          dc: 12,
          success: {
            story:
              "Jejak mengarah ke ruangan tersembunyi berisi perbekalan lama.",
            effect: { evidence: 2, survival: 1 },
          },
          failure: {
            story:
              "Jejak menghilang di persimpangan gelap. Kelompok terpecah sejenak.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "search_walls",
          label: "Memeriksa dinding berlumut",
          required_stat: "INT",
          dc: 13,
          success: {
            story:
              "Di balik lumut tebal, tersembunyi ukiran peta dungeon kuno.",
            effect: { evidence: 3 },
          },
          failure: {
            story:
              "Tangan menyentuh jebakan tersembunyi. Gas beracun ringan mengepul.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "rush_forward",
          label: "Bergerak cepat melewati lorong",
          required_stat: "DEX",
          dc: 11,
          success: {
            story: "Kelompok melewati lorong berbahaya tanpa insiden.",
            effect: { survival: 2 },
          },
          failure: {
            story:
              "Seseorang terpeleset dan mengeluarkan suara keras. Sesuatu terbangun.",
            effect: { chaos: 3 },
          },
        },
      ],
    },
    {
      id: "4",
      title: "The Flooded Chamber",
      story:
        "Ruangan besar dengan lantai terendam air setinggi lutut. Di tengahnya berdiri altar batu yang masih kering.",
      choices: [
        {
          id: "examine_altar",
          label: "Memeriksa altar di tengah",
          required_stat: "INT",
          dc: 14,
          success: {
            story:
              "Altar menyimpan kristal cahaya yang memandu jalan ke depan.",
            effect: { evidence: 3 },
          },
          failure: {
            story:
              "Altar memancarkan energi yang mengacaukan kompas dan orientasi.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "search_underwater",
          label: "Menyelam mencari benda tersembunyi",
          required_stat: "DEX",
          dc: 15,
          success: {
            story: "Di dasar air ditemukan kotak besi berisi dokumen penting.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Sesuatu di dalam air menyentuh kaki. Kepanikan menyebar.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "drain_water",
          label: "Mencari cara menguras air",
          required_stat: "STR",
          dc: 12,
          success: {
            story:
              "Saluran tersembunyi berhasil dibuka. Lantai perlahan mengering.",
            effect: { survival: 2, evidence: 1 },
          },
          failure: {
            story: "Mekanisme rusak dan air mulai naik perlahan.",
            effect: { chaos: 2 },
          },
        },
      ],
    },

    // ── NIGHT 1 ────────────────────────────────────────────
    {
      id: "night_1",
      type: "night_phase",
      title: "Bayangan di Kegelapan",
      story:
        "Lampu padam. Sesuatu bergerak dalam kegelapan. Tidak ada yang tahu siapa — atau apa — yang mengintai.",
    },
    // ── DISCUSSION 1 ───────────────────────────────────────
    {
      id: "discussion_1",
      type: "discuss",
      title: "Perkemahan Sementara",
      story:
        "Kelompok beristirahat sejenak di tepi ruangan. Ketegangan mulai memuncak. Seseorang harus disingkirkan sebelum perjalanan berlanjut.",
    },

    // ══════════════════════════════════════════════════════
    // CHAPTER 2 — THE INNER SANCTUM
    // ══════════════════════════════════════════════════════
    {
      id: "5",
      title: "The Forgotten Crypt",
      story:
        "Sebuah ruang pemakaman kuno dipenuhi peti mati batu dan patung penjaga yang matanya seolah mengikuti setiap gerakan.",
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
            story: "Perangkap kuno aktif dan menyemburkan serbuk tulang.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "pray_guardians",
          label: "Berdoa kepada penjaga kuno",
          required_stat: "CHA",
          dc: 12,
          success: {
            story:
              "Roh penjaga memberikan petunjuk tentang keberadaan infiltrator.",
            effect: { evidence: 2 },
          },
          failure: {
            story:
              "Tidak ada respons. Hening yang mencekam menyelimuti ruangan.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "open_cursed_tomb",
          label: "Membuka makam terlarang",
          required_stat: "STR",
          dc: 11,
          success: {
            story: "Artefak misterius ditemukan di dalam peti.",
            effect: { evidence: 3, chaos: 1 },
          },
          failure: {
            story: "Kutukan dilepaskan dan merasuki satu anggota kelompok.",
            effect: { chaos: 4 },
          },
        },
      ],
    },
    {
      id: "6",
      title: "The Abyss Library",
      story:
        "Perpustakaan kuno berisi ribuan buku sihir yang hampir hancur oleh waktu. Bau kertas tua memenuhi udara.",
      choices: [
        {
          id: "study_books",
          label: "Mempelajari buku kuno",
          required_stat: "INT",
          dc: 15,
          success: {
            story:
              "Kelompok menemukan sejarah asli dungeon dan identitas entitas gelap.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Tulisan terlalu rusak. Waktu terbuang sia-sia.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "search_secret_room",
          label: "Mencari ruangan rahasia",
          required_stat: "PER",
          dc: 14,
          success: {
            story:
              "Ruangan tersembunyi di balik rak buku ditemukan, berisi jurnal rahasia.",
            effect: { evidence: 3 },
          },
          failure: {
            story:
              "Rak buku runtuh dan menghalangi satu-satunya jalan keluar sementara.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "burn_books",
          label: "Membakar buku terlarang",
          required_stat: "STR",
          dc: 10,
          success: {
            story: "Buku-buku kutukan hancur, melemahkan entitas gelap.",
            effect: { evidence: 2, chaos: 2 },
          },
          failure: {
            story:
              "Api menyebar ke seluruh perpustakaan dan memaksa kelompok kabur.",
            effect: { chaos: 4 },
          },
        },
      ],
    },
    {
      id: "7",
      title: "The Statue Garden",
      story:
        "Taman dalam ruangan berisi puluhan patung batu dalam berbagai pose ketakutan. Legenda menyebut ini adalah petualang yang gagal.",
      choices: [
        {
          id: "examine_statues",
          label: "Memeriksa ekspresi patung",
          required_stat: "PER",
          dc: 13,
          success: {
            story:
              "Setiap patung menghadap ke satu titik — pintu tersembunyi di sudut ruangan.",
            effect: { evidence: 3 },
          },
          failure: {
            story:
              "Mata patung terasa mengikuti pergerakan. Konsentrasi terganggu.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "smash_statue",
          label: "Menghancurkan salah satu patung",
          required_stat: "STR",
          dc: 12,
          success: {
            story: "Di dalam patung terdapat scroll kuno yang masih utuh.",
            effect: { evidence: 2 },
          },
          failure: {
            story:
              "Patung hancur dan memancarkan energi yang membutakan sementara.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "meditate_garden",
          label: "Bermeditasi di tengah taman",
          required_stat: "CHA",
          dc: 14,
          success: {
            story:
              "Visi singkat muncul — wajah sang infiltrator terlihat samar.",
            effect: { evidence: 4 },
          },
          failure: {
            story:
              "Energi gelap taman menginvasi pikiran. Halusinasi mengganggu.",
            effect: { chaos: 3 },
          },
        },
      ],
    },
    {
      id: "8",
      title: "The Poison Garden",
      story:
        "Ruangan aneh berisi tanaman berduri yang tumbuh subur tanpa cahaya. Udara terasa berat dan sedikit memabukkan.",
      choices: [
        {
          id: "harvest_herbs",
          label: "Memanen tanaman obat",
          required_stat: "INT",
          dc: 14,
          success: {
            story:
              "Tanaman langka berhasil dipetik — berguna sebagai penawar racun.",
            effect: { survival: 3 },
          },
          failure: {
            story: "Duri beracun menusuk tangan. Racun ringan menyebar.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "burn_plants",
          label: "Membakar tanaman berbahaya",
          required_stat: "DEX",
          dc: 13,
          success: {
            story:
              "Tanaman terbakar dan mengungkap lorong tersembunyi di baliknya.",
            effect: { evidence: 2, survival: 1 },
          },
          failure: {
            story: "Asap beracun memenuhi ruangan dan memaksa kelompok mundur.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "study_patterns",
          label: "Mempelajari pola tumbuhan",
          required_stat: "INT",
          dc: 15,
          success: {
            story:
              "Pola pertumbuhan tanaman membentuk simbol kuno yang mengungkap rahasia dungeon.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Terlalu lama berdiam. Spora tanaman masuk ke paru-paru.",
            effect: { chaos: 2 },
          },
        },
      ],
    },

    // ── NIGHT 2 ────────────────────────────────────────────
    {
      id: "night_2",
      type: "night_phase",
      title: "Kegelapan Kembali",
      story:
        "Dungeon kembali menelan cahaya. Infiltrator merasakan kekuatannya semakin besar. Korban berikutnya sudah dipilih.",
    },
    // ── DISCUSSION 2 ───────────────────────────────────────
    {
      id: "discussion_2",
      type: "discuss",
      title: "Persimpangan Berbahaya",
      story:
        "Kelompok berkumpul di persimpangan. Dua anggota tampak gelisah. Kepercayaan mulai retak — siapa yang bisa dipercaya?",
    },

    // ══════════════════════════════════════════════════════
    // CHAPTER 3 — THE DARK HEART
    // ══════════════════════════════════════════════════════
    {
      id: "9",
      title: "The Mirror Maze",
      story:
        "Labirin cermin yang memantulkan bayangan aneh. Beberapa bayangan tidak bergerak sesuai pemiliknya.",
      choices: [
        {
          id: "follow_true_reflection",
          label: "Mengikuti bayangan yang benar",
          required_stat: "PER",
          dc: 15,
          success: {
            story:
              "Salah satu cermin menunjukkan bayangan infiltrator yang berbeda dari penampilan aslinya.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Kelompok tersesat dalam labirin selama berjam-jam.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "smash_mirrors",
          label: "Menghancurkan cermin satu per satu",
          required_stat: "STR",
          dc: 12,
          success: {
            story: "Cermin hancur dan membuka jalan langsung ke pusat labirin.",
            effect: { survival: 2 },
          },
          failure: {
            story:
              "Pecahan cermin melukai beberapa anggota. Energi gelap terpancar dari sisa cermin.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "decipher_maze",
          label: "Memecahkan pola labirin",
          required_stat: "INT",
          dc: 16,
          success: {
            story:
              "Pola matematika tersembunyi dalam susunan cermin menunjukkan jalan keluar.",
            effect: { evidence: 3, survival: 1 },
          },
          failure: {
            story: "Pola terlalu kompleks. Kelelahan mental mulai menghantam.",
            effect: { chaos: 2 },
          },
        },
      ],
    },
    {
      id: "10",
      title: "The Whispering Well",
      story:
        "Sumur tua yang dalam dengan air hitam pekat. Suara-suara dari bawah terdengar seperti nama setiap anggota kelompok.",
      choices: [
        {
          id: "drink_water",
          label: "Meminum air sumur",
          required_stat: "CHA",
          dc: 13,
          success: {
            story:
              "Visi masa lalu dungeon terlihat jelas — termasuk wajah orang yang pertama kali membuka segel.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Air hitam membakar tenggorokan. Pikiran menjadi kacau.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "lower_torch",
          label: "Menurunkan obor ke dalam sumur",
          required_stat: "DEX",
          dc: 12,
          success: {
            story:
              "Cahaya obor menerangi simbol di dinding sumur yang mengungkap kebenaran.",
            effect: { evidence: 3 },
          },
          failure: {
            story: "Obor padam dan kegelapan total menyelimuti area sumur.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "seal_well",
          label: "Menyegel sumur dengan mantra",
          required_stat: "INT",
          dc: 15,
          success: {
            story:
              "Sumur tersegel dan energi gelap yang mengalir darinya terhenti.",
            effect: { survival: 3, evidence: 1 },
          },
          failure: {
            story:
              "Mantra salah justru memperkuat suara-suara dari dalam sumur.",
            effect: { chaos: 4 },
          },
        },
      ],
    },
    {
      id: "11",
      title: "The Bone Throne Room",
      story:
        "Ruangan megah dengan singgasana yang terbuat dari tulang belulang. Di sinilah penguasa dungeon pernah bertakhta.",
      choices: [
        {
          id: "sit_throne",
          label: "Menduduki singgasana",
          required_stat: "CHA",
          dc: 16,
          success: {
            story:
              "Kekuatan singgasana memberikan penglihatan tentang semua yang terjadi di dungeon.",
            effect: { evidence: 5 },
          },
          failure: {
            story:
              "Singgasana menyerap energi vital. Tubuh terasa berat dan lemah.",
            effect: { chaos: 4 },
          },
        },
        {
          id: "search_throne_room",
          label: "Menggeledah ruangan",
          required_stat: "PER",
          dc: 14,
          success: {
            story:
              "Di balik singgasana ditemukan ruang rahasia berisi arsip kerajaan.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Jebakan tersembunyi aktif dan menutup pintu masuk.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "destroy_throne",
          label: "Menghancurkan singgasana",
          required_stat: "STR",
          dc: 14,
          success: {
            story:
              "Singgasana hancur dan melepaskan artefak yang tersegel di dalamnya.",
            effect: { evidence: 3, survival: 1 },
          },
          failure: {
            story:
              "Singgasana terlalu kokoh. Energi balik menghantam yang menyerang.",
            effect: { chaos: 3 },
          },
        },
      ],
    },
    {
      id: "12",
      title: "The Shadow Vault",
      story:
        "Ruangan brankas dengan pintu besi tebal yang terbuka sedikit. Dari celahnya memancar cahaya ungu redup.",
      choices: [
        {
          id: "force_vault",
          label: "Memaksa membuka pintu brankas",
          required_stat: "STR",
          dc: 15,
          success: {
            story:
              "Pintu terbuka penuh, mengungkap koleksi artefak yang dikurasi dengan hati-hati.",
            effect: { evidence: 4, survival: 1 },
          },
          failure: {
            story:
              "Pintu tidak bergerak. Usaha keras justru mengunci mekanismenya.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "pick_lock",
          label: "Membuka kunci dengan keahlian",
          required_stat: "DEX",
          dc: 16,
          success: {
            story: "Kunci terbuka tanpa suara. Isi brankas terungkap utuh.",
            effect: { evidence: 5 },
          },
          failure: {
            story:
              "Alat kunci patah di dalam lubang kunci. Alarm tersembunyi berbunyi.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "read_vault_runes",
          label: "Membaca rune di pintu brankas",
          required_stat: "INT",
          dc: 14,
          success: {
            story:
              "Rune adalah kata sandi. Pintu terbuka dan menyingkap kebenaran tentang infiltrator.",
            effect: { evidence: 5 },
          },
          failure: {
            story: "Rune dibaca salah dan memicu perangkap sihir.",
            effect: { chaos: 3 },
          },
        },
      ],
    },

    // ── NIGHT 3 ────────────────────────────────────────────
    {
      id: "night_3",
      type: "night_phase",
      title: "Malam Ketiga yang Mencekam",
      story:
        "Kegelapan terasa lebih pekat dari sebelumnya. Infiltrator kini bergerak dengan kepercayaan diri penuh. Dungeon sendiri seperti membantu menyembunyikannya.",
    },
    // ── DISCUSSION 3 ───────────────────────────────────────
    {
      id: "discussion_3",
      type: "discuss",
      title: "Persidangan di Kegelapan",
      story:
        "Kelompok tidak bisa lagi mengabaikan kecurigaan. Terlalu banyak yang terjadi. Sudah waktunya menunjuk tersangka.",
    },

    // ══════════════════════════════════════════════════════
    // CHAPTER 4 — THE CURSED DEPTHS
    // ══════════════════════════════════════════════════════
    {
      id: "13",
      title: "The Lava Bridge",
      story:
        "Jembatan batu tipis membentang di atas jurang berisi lava. Panas menyengat dan batu jembatan mulai retak.",
      choices: [
        {
          id: "cross_carefully",
          label: "Menyeberang dengan hati-hati satu per satu",
          required_stat: "DEX",
          dc: 14,
          success: {
            story:
              "Semua anggota berhasil menyeberang meski jembatan bergetar.",
            effect: { survival: 3 },
          },
          failure: {
            story:
              "Sebagian jembatan runtuh. Kelompok harus mencari jalan memutar.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "reinforce_bridge",
          label: "Memperkuat jembatan dulu",
          required_stat: "INT",
          dc: 15,
          success: {
            story:
              "Dengan penopang darurat, jembatan menjadi stabil dan aman dilalui.",
            effect: { survival: 2, evidence: 1 },
          },
          failure: {
            story:
              "Material yang digunakan salah dan jembatan semakin cepat rusak.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "jump_across",
          label: "Melompat langsung ke sisi lain",
          required_stat: "STR",
          dc: 13,
          success: {
            story:
              "Lompatan berhasil dan menjadi inspirasi bagi yang lain untuk mengikuti.",
            effect: { survival: 2 },
          },
          failure: {
            story:
              "Hampir terjatuh ke lava. Diselamatkan tapi kelelahan ekstrim.",
            effect: { chaos: 2 },
          },
        },
      ],
    },
    {
      id: "14",
      title: "The Ancient Forge",
      story:
        "Bengkel tempa kuno yang masih berfungsi. Api abadi menyala di perapian dan berbagai senjata tergantung di dinding.",
      choices: [
        {
          id: "forge_weapon",
          label: "Menempa senjata baru",
          required_stat: "STR",
          dc: 14,
          success: {
            story:
              "Senjata baru berhasil ditempa dari logam dungeon yang kuat.",
            effect: { survival: 3 },
          },
          failure: {
            story:
              "Tempa gagal dan logam panas meletup, melukai beberapa orang.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "study_blueprints",
          label: "Mempelajari cetak biru di meja kerja",
          required_stat: "INT",
          dc: 15,
          success: {
            story:
              "Cetak biru menunjukkan denah lengkap dungeon termasuk ruang yang belum dijelajahi.",
            effect: { evidence: 4 },
          },
          failure: {
            story:
              "Cetak biru terlalu teknis dan dalam bahasa yang tidak dikenal.",
            effect: { chaos: 1 },
          },
        },
        {
          id: "search_storage",
          label: "Menggeledah lemari penyimpanan",
          required_stat: "PER",
          dc: 12,
          success: {
            story:
              "Ditemukan catatan pesanan senjata dengan nama-nama yang mencurigakan.",
            effect: { evidence: 3 },
          },
          failure: {
            story: "Lemari dikunci rapat. Paksa buka malah rusak.",
            effect: { chaos: 1 },
          },
        },
      ],
    },
    {
      id: "15",
      title: "The Crystal Cavern",
      story:
        "Gua berkilap dengan kristal raksasa yang memancarkan cahaya biru. Suara bergema aneh di sini dan kadang terdengar seperti percakapan.",
      choices: [
        {
          id: "touch_crystal",
          label: "Menyentuh kristal terbesar",
          required_stat: "CHA",
          dc: 15,
          success: {
            story:
              "Kristal beresonansi dan memutar kembali percakapan yang terjadi di dungeon ini sebelumnya.",
            effect: { evidence: 5 },
          },
          failure: {
            story:
              "Kristal melepaskan gelombang energi yang membuat pingsan sementara.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "map_cave",
          label: "Memetakan struktur gua",
          required_stat: "INT",
          dc: 13,
          success: {
            story:
              "Peta gua menunjukkan jalur langsung ke ruang akhir dungeon.",
            effect: { evidence: 3, survival: 1 },
          },
          failure: {
            story: "Kristal memantulkan bayangan dan membingungkan peta.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "harvest_crystals",
          label: "Memanen pecahan kristal",
          required_stat: "DEX",
          dc: 12,
          success: {
            story:
              "Pecahan kristal bisa digunakan sebagai sumber cahaya permanen.",
            effect: { survival: 2 },
          },
          failure: {
            story:
              "Kristal pecah dengan suara keras dan menarik perhatian makhluk dungeon.",
            effect: { chaos: 3 },
          },
        },
      ],
    },
    {
      id: "16",
      title: "The Flesh Corridor",
      story:
        "Lorong yang dindingnya berdenyut seperti organisme hidup. Udara terasa hangat dan basah. Ini bagian dari makhluk raksasa yang hidup.",
      choices: [
        {
          id: "move_silently",
          label: "Bergerak diam-diam melewatinya",
          required_stat: "DEX",
          dc: 16,
          success: {
            story:
              "Kelompok melewati lorong hidup tanpa membangunkan makhluk raksasa.",
            effect: { survival: 3 },
          },
          failure: {
            story: "Dinding bergerak dan menekan kelompok. Makhluk terbangun.",
            effect: { chaos: 4 },
          },
        },
        {
          id: "study_organism",
          label: "Mempelajari organisme tersebut",
          required_stat: "INT",
          dc: 14,
          success: {
            story:
              "Titik lemah makhluk ditemukan. Satu tusukan dan ia tertidur kembali.",
            effect: { evidence: 2, survival: 2 },
          },
          failure: {
            story:
              "Salah sentuh titik sensitif. Makhluk mulai mengontraksi dinding.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "intimidate_organism",
          label: "Berteriak untuk mengintimidasi",
          required_stat: "CHA",
          dc: 11,
          success: {
            story:
              "Entah bagaimana, makhluk merespons suara keras dengan membuka jalan lebih lebar.",
            effect: { survival: 1 },
          },
          failure: {
            story:
              "Suara memicu respons defensif. Cairan asam disemprotkan dari dinding.",
            effect: { chaos: 4 },
          },
        },
      ],
    },

    // ── NIGHT 4 ────────────────────────────────────────────
    {
      id: "night_4",
      type: "night_phase",
      title: "Malam Tanpa Bintang",
      story:
        "Tidak ada cahaya sama sekali. Bahkan api obor terasa redup. Infiltrator bergerak seperti bayangan — satu lagi korban menunggu.",
    },
    // ── DISCUSSION 4 ───────────────────────────────────────
    {
      id: "discussion_4",
      type: "discuss",
      title: "Pengadilan Terakhir",
      story:
        "Kelompok semakin kecil. Setiap orang mencurigai yang lain. Ini mungkin diskusi terakhir sebelum semuanya terlambat.",
    },

    // ══════════════════════════════════════════════════════
    // CHAPTER 5 — THE FINAL RECKONING
    // ══════════════════════════════════════════════════════
    {
      id: "17",
      title: "The Entity's Antechamber",
      story:
        "Ruang depan menuju inti dungeon. Tekanan energi gelap terasa begitu kuat hingga udara bergetar. Ini hampir berakhir.",
      choices: [
        {
          id: "set_barrier",
          label: "Membangun penghalang sihir",
          required_stat: "INT",
          dc: 16,
          success: {
            story:
              "Penghalang melindungi kelompok dari energi gelap yang paling kuat.",
            effect: { survival: 3, evidence: 1 },
          },
          failure: {
            story:
              "Penghalang tidak cukup kuat. Energi gelap menembus dan melemahkan semua.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "channel_energy",
          label: "Menyalurkan energi dungeon",
          required_stat: "CHA",
          dc: 17,
          success: {
            story:
              "Energi dungeon dikendalikan dan dibalikkan untuk melawan entitas.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Energi tak terkendali meledak ke segala arah.",
            effect: { chaos: 4 },
          },
        },
        {
          id: "read_final_inscription",
          label: "Membaca prasasti akhir",
          required_stat: "PER",
          dc: 15,
          success: {
            story:
              "Prasasti mengungkap nama asli entitas dan cara mengalahkannya.",
            effect: { evidence: 5 },
          },
          failure: {
            story: "Prasasti terlalu rusak untuk dibaca sepenuhnya.",
            effect: { chaos: 1 },
          },
        },
      ],
    },
    {
      id: "18",
      title: "The Collapsing Tower",
      story:
        "Menara dalam dungeon yang mulai runtuh. Setiap langkah membuat batu berjatuhan. Waktu hampir habis.",
      choices: [
        {
          id: "find_safe_path",
          label: "Mencari jalur yang aman",
          required_stat: "PER",
          dc: 16,
          success: {
            story: "Jalur aman ditemukan di antara reruntuhan yang jatuh.",
            effect: { survival: 3 },
          },
          failure: {
            story: "Batu runtuh menutupi jalur. Kelompok terjebak sejenak.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "prop_structure",
          label: "Menopang struktur yang runtuh",
          required_stat: "STR",
          dc: 17,
          success: {
            story:
              "Menara distabilkan cukup lama untuk semua orang melewatinya.",
            effect: { survival: 4 },
          },
          failure: {
            story: "Terlalu berat. Penopang gagal dan robohan semakin besar.",
            effect: { chaos: 4 },
          },
        },
        {
          id: "search_ruins",
          label: "Mencari clue di antara reruntuhan",
          required_stat: "INT",
          dc: 15,
          success: {
            story:
              "Di antara puing ditemukan catatan terakhir penghuni menara tentang infiltrator.",
            effect: { evidence: 4 },
          },
          failure: {
            story: "Terlalu berbahaya untuk digeledah. Puing terus berjatuhan.",
            effect: { chaos: 2 },
          },
        },
      ],
    },
    {
      id: "19",
      title: "The Seal Chamber",
      story:
        "Ruangan berbentuk lingkaran dengan segel kuno di lantai yang mulai bersinar merah. Entitas di balik segel mulai mendorong untuk keluar.",
      choices: [
        {
          id: "reinforce_seal",
          label: "Memperkuat segel dari luar",
          required_stat: "CHA",
          dc: 17,
          success: {
            story: "Segel diperkuat dan entitas terdorong kembali ke dalam.",
            effect: { evidence: 4, survival: 2 },
          },
          failure: {
            story: "Energi segel berbalik dan mendorong kelompok menjauh.",
            effect: { chaos: 4 },
          },
        },
        {
          id: "decode_seal",
          label: "Mendekode simbol segel",
          required_stat: "INT",
          dc: 18,
          success: {
            story:
              "Simbol terdekode dan mengungkap cara mematikan entitas sepenuhnya.",
            effect: { evidence: 5 },
          },
          failure: {
            story: "Salah decode memperlemah segel secara signifikan.",
            effect: { chaos: 5 },
          },
        },
        {
          id: "sacrifice_artifact",
          label: "Mengorbankan artefak untuk segel",
          required_stat: "STR",
          dc: 13,
          success: {
            story:
              "Artefak memberikan energi yang dibutuhkan untuk menstabilkan segel.",
            effect: { evidence: 3, survival: 1 },
          },
          failure: {
            story: "Artefak ditolak segel dan meledak.",
            effect: { chaos: 3 },
          },
        },
      ],
    },

    // ── NIGHT 5 ────────────────────────────────────────────
    {
      id: "night_5",
      type: "night_phase",
      title: "Malam Terakhir",
      story:
        "Ini adalah malam terakhir. Entitas hampir bebas. Infiltrator tahu bahwa inilah kesempatannya untuk menyelesaikan segalanya. Tidak ada yang aman.",
    },
    // ── DISCUSSION 5 ───────────────────────────────────────
    {
      id: "discussion_5",
      type: "discuss",
      title: "Detik-Detik Terakhir",
      story:
        "Waktu hampir habis. Entitas hampir bebas. Hanya ada satu kesempatan terakhir untuk mengungkap pengkhianat di antara kalian.",
    },

    // ══════════════════════════════════════════════════════
    // FINAL STAGE
    // ══════════════════════════════════════════════════════
    {
      id: "20",
      title: "Heart Chamber — The Final Confrontation",
      story:
        "Kelompok akhirnya mencapai ruang terakhir tempat Heart of Eternity disegel. Energi gelap memuncak. Ini adalah akhir dari segalanya.",
      choices: [
        {
          id: "purify_artifact",
          label: "Menyucikan artefak",
          required_stat: "CHA",
          dc: 18,
          success: {
            story:
              "Kekuatan gelap mulai melemah. Heart of Eternity bersinar terang untuk pertama kalinya.",
            effect: { evidence: 5 },
          },
          failure: {
            story: "Energi gelap melawan proses penyucian dengan sengit.",
            effect: { chaos: 3 },
          },
        },
        {
          id: "analyze_artifact",
          label: "Mempelajari artefak secara mendalam",
          required_stat: "INT",
          dc: 16,
          success: {
            story:
              "Rahasia sebenarnya dari infiltrator dan entitas terungkap sepenuhnya.",
            effect: { evidence: 5 },
          },
          failure: {
            story: "Artefak memancarkan ilusi yang mengacaukan semua analisis.",
            effect: { chaos: 2 },
          },
        },
        {
          id: "claim_power",
          label: "Mengambil kekuatan artefak",
          required_stat: "STR",
          dc: 10,
          success: {
            story:
              "Kekuatan besar diperoleh. Entitas kalah namun kutukan dungeon semakin kuat.",
            effect: { chaos: 5 },
          },
          failure: {
            story:
              "Artefak menolak dan menyerang balik dengan seluruh kekuatan gelapnya.",
            effect: { chaos: 4 },
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

export function getNextAliveTurn(
  currentUserId: string | null,
  players: MatchPlayer[],
): MatchPlayer | null {
  const alivePlayers = players.filter((p) => p.status !== "killed");
  if (!alivePlayers.length) return null;

  if (!currentUserId) return alivePlayers[0];

  const currentIndex = alivePlayers.findIndex(
    (p) => p.userId === currentUserId,
  );

  const nextIndex =
    (currentIndex === -1 ? 0 : currentIndex + 1) % alivePlayers.length;

  return alivePlayers[nextIndex];
}
