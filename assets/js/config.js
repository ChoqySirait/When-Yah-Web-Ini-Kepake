// ============================================================
// PUSAT KONFIGURASI TEMPLATE & EMAIL PENAMPUNG HARAPAN
// ============================================================
const CONFIG = {
  recipientName: "Bidadari Malam",
  senderName: "Seseorang yang Selalu Mengagumimu",

  // Masukkan email Anda di sini agar isi harapan otomatis masuk ke inbox
  receiverEmail: "email_anda_disini@gmail.com",

  // Tanggal kelahiran untuk kuis (angka 1 - 31)
  birthDate: 14,

  // Audio: Menggunakan file lokal jika ada, atau fallback URL romantis
  audioUrl: "assets/audio/lagu.mp3",
  fallbackAudioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=romantic-ambient-111427.mp3",
  audioTitle: "Until I Found You (Acoustic Ambient)",

  // Galeri Memori 3D & Syair (Jalur foto lokal dengan fallback otomatis)
  memories: [
    {
      image: "assets/images/foto1.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
      title: "Tatapan Pertama",
      poem: "Ada jutaan bintang di angkasa, namun malam itu langit meredup; kalah benderang oleh sepasang matamu."
    },
    {
      image: "assets/images/foto2.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
      title: "Senyum Sunyi",
      poem: "Bahkan dalam bisu yang paling pekat, tawamu adalah satu-satunya melodi yang sanggup menenangkan duniaku."
    },
    {
      image: "assets/images/foto3.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
      title: "Langkah Waktu",
      poem: "Waktu boleh terus berputar liar, tapi bersamamu, setiap detiknya menjelma menjadi keabadian yang teduh."
    },
    {
      image: "assets/images/foto4.jpg",
      fallbackImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
      title: "Doa di Balik Doa",
      poem: "Aku meminta kepada semesta agar senantiasa menjagamu, saat tanganku tak cukup panjang merengkuh resahmu."
    }
  ],

  // Naskah Surat Terakhir
  letter: {
    salutation: "Untuk Jiwa yang Paling Menenangkan,",
    body: [
      "Selamat bertambah usia. Di antara miliaran manusia yang berjalan di bawah kubah langit yang sama, kehadiranmu adalah kebetulan paling indah yang pernah kurayakan dalam diam.",
      "Mungkin dunia sering kali bising dan melelahkan bagimu. Namun ingatlah, kamu tidak pernah diciptakan untuk memikul seluruh beratnya sendirian. Setiap lelahmu adalah ketegaran, dan senyummu adalah anugerah terindah.",
      "Semoga di usiamu yang baru ini, semesta memelukmu dengan segala hal baik yang layak kau dapatkan: impian yang bermekaran, ketenangan yang tak terusik, dan hati yang senantiasa diliputi cinta sejati.",
      "Terima kasih telah lahir ke dunia, dan terima kasih telah menjadi alasan mengapa hari ini begitu layak untuk diabadikan selamanya."
    ],
    signature: "Selalu Mengagumimu,",
    date: "Di Bawah Langit Malam"
  }
};