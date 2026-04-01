export const mockPromos = [
  {
    id: 1,
    title: "Cashback Hingga Rp 50.000",
    description: "Nikmati cashback spesial untuk pembelian tiket pertama Anda di outlet kami.",
    imageUrl: "https://placehold.co/600x800/1e293b/ffffff?text=Cashback+Promo",
    location: "Jakarta",
    startDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    termsAndConditions: [
      "Promo berlaku khusus untuk pendaftaran/member baru.",
      "Minimal transaksi Rp 100.000 untuk mendapatkan cashback maksimal Rp 50.000.",
      "Cashback akan diberikan dalam bentuk poin yang dapat ditukar pada transaksi berikutnya.",
      "Promo ini tidak dapat digabungkan dengan promo lainnya.",
      "Pihak manajemen berhak membatalkan cashback jika ditemukan indikasi kecurangan."
    ]
  },
  {
    id: 2,
    title: "Beli 1 Gratis 1 Minuman",
    description: "Khusus untuk member, dapatkan promo spesial beli 1 gratis 1 untuk semua varian kopi.",
    imageUrl: "https://placehold.co/600x800/dc2626/ffffff?text=Beli+1+Gratis+1",
    location: "Bandung",
    startDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    termsAndConditions: [
      "Promo berlaku untuk pembelian di tempat (dine-in).",
      "Berlaku untuk semua ukuran minuman jenis kopi.",
      "Gratis minuman adalah varian dengan harga sama atau lebih rendah.",
      "Hanya berlaku kelipatan satu kali dalam 1 tagihan transaksi."
    ]
  },
  {
    id: 3,
    title: "Diskon Akhir Bulan 30%",
    description: "Jangan lewatkan diskon akhir bulan untuk semua kategori.",
    imageUrl: "https://placehold.co/600x800/059669/ffffff?text=Diskon+30%25",
    location: "All Locations",
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    termsAndConditions: [
      "Berlaku di semua cabang dan layanan aplikasi.",
      "Maksimal potongan diskon sebesar Rp 150.000.",
      "Berlaku tanpa batas minimum transaksi.",
      "Item yang sudah dibeli dengan promo ini tidak dapat dikembalikan atau ditukar (non-refundable)."
    ]
  },
  {
    id: 4,
    title: "Flash Sale 1 Jam",
    description: "Cuma ada hari ini! Diskon gila-gilaan selama 1 jam saja.",
    imageUrl: "https://placehold.co/600x800/d97706/ffffff?text=Flash+Sale",
    location: "Surabaya",
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    termsAndConditions: [
      "Promo hanya berlaku di jam yang ditentukan.",
      "Pembelian dibatasi maksimal 1 item per pengguna."
    ]
  },
  {
    id: 5,
    title: "Tiket Nonton Murah",
    description: "Nonton lebih hemat di akhir pekan eksklusif di Jakarta.",
    imageUrl: "https://placehold.co/600x800/4f46e5/ffffff?text=Tiket+Murah",
    location: "Jakarta",
    startDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    termsAndConditions: [
      "Berlaku untuk penayangan film sebelum pukul 14:00.",
      "Khusus untuk teater 2D regular (tidak berlaku IMAX/Premiere).",
      "Tiket promo yang sudah ditebus tidak bisa dijadwalkan ulang."
    ]
  }
];

export const locations = ["All Locations", "Jakarta", "Bandung", "Surabaya"];
