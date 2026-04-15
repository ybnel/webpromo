import Papa from 'papaparse';

// Jika Anda sudah memiliki link CSV dari Google Sheets (Publish to Web), 
// ganti string kosong ini dengan link tersebut,
// Contoh: "https://docs.google.com/spreadsheets/d/e/2PACX-1.../pub?output=csv"
const GOOGLE_SHEETS_CSV_URL = import.meta.env.VITE_SHEETS_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vRdRv7-UeMEVdfGxwzvlYqWkelqts3lrl8IKiFHBdByP7nnOztoolBGNCix2m1mPyHZVkZ0xrmXE564/pub?output=csv";

// Jika URL belum disetel, kita akan memakai data CSV palsu untuk mendemonstrasikan hasil parsing
const dummyCsvString = `id,title,description,imageUrl,location,startDate,endDate,termsAndConditions
101,Promo dari Excel Gila-gilaan,Ini di-load dari tabel lho bukan hardcode!,https://placehold.co/600x800/10b981/ffffff?text=Promo+Excel,Denpasar,01/03/2026,31/12/2026,"Berlaku khusus wilayah Denpasar.
Hanya 1 per transaksi."
102,Diskon Live dari Spreadsheet,Bukti integrasi CSV PapaParse berhasil berjalan lancar.,https://placehold.co/600x800/8b5cf6/ffffff?text=Promo+Baru,Surabaya,31/03/2026,15/05/2026,"Tanpa syarat minim pembelian.
Langsung gunakan kode unik."`;

// Fungsi pembantu untuk mengurai format 'DD/MM/YYYY' menjadi standar ISO Javascript
const parseDateDDMMYYYY = (dateString) => {
  if (!dateString) return new Date().toISOString();
  
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Di JS, indeks bulan adalah 0-11
    const year = parseInt(parts[2], 10);
    
    // Validasi tambahan agar tidak error jika format tidak benar
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day).toISOString();
    }
  }
  
  // Jika karena alasan tertentu admin menginput "YYYY-MM-DD" secara tidak sengaja, 
  // kita tetap me-fallback (mencoba membaca pakai cara asli)
  const fallbackDate = new Date(dateString);
  return isNaN(fallbackDate.getTime()) ? new Date().toISOString() : fallbackDate.toISOString();
};

export const fetchPromosFromSheet = () => {
  return new Promise((resolve, reject) => {
    // 1. Tentukan sumber: Apakah dari URL live, atau dummy string
    // Tambahkan timestamp (?t=) untuk menghindari cache agar data selalu fresh saat refresh
    const useUrl = GOOGLE_SHEETS_CSV_URL 
      ? `${GOOGLE_SHEETS_CSV_URL}${GOOGLE_SHEETS_CSV_URL.includes('?') ? '&' : '?'}t=${new Date().getTime()}` 
      : null;
      
    const source = useUrl || dummyCsvString;
    const isUrl = Boolean(useUrl); // papa parse needs to know if downloading

    Papa.parse(source, {
      download: isUrl,
      header: true, // Beritahu PapaParse kalau baris 1 adalah nama kolom
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data;
          
          // 2. Map data mentah dari CSV ke format standar objek Promo
          const mappedPromos = rawData.map((row, index) => {
            // Helper untuk mengambil nilai kolom tanpa pusing huruf besar/kecil
            const getVal = (keyName) => {
              const matchedKey = Object.keys(row).find(k => k.trim().toLowerCase() === keyName.toLowerCase());
              return matchedKey ? row[matchedKey] : undefined;
            };

            const title = getVal('title') || 'Upcoming Special Promo';
            const endDateString = getVal('enddate') || '';
            
            // Membuat ID otomatis lebih stabil jika kolom ID kosong
            // Menggunakan kombinasi index, porsi judul, dan tanggal berakhir (agar unik)
            const autoId = `p-${index}-${title.substring(0,5).toLowerCase()}-${endDateString.replace(/\//g, '')}`;

            return {
              id: getVal('id') || autoId,
              title: title,
              description: getVal('description') || 'Enjoy our latest promotion at your favorite branches!',
              imageUrl: getVal('imageurl') || 'https://placehold.co/600x400/3b82f6/ffffff?text=Promo+Image', // Gambar placeholder biru jika kosong
              location: getVal('location') 
                ? getVal('location').split('\n').map(l => l.trim()).filter(l => l.length > 0)
                : ['All Locations'],
              startDate: parseDateDDMMYYYY(getVal('startdate')),
              endDate: parseDateDDMMYYYY(endDateString),
              // Kolom notes (dinamis), fallback ke nama lama
              note1: getVal('note1') || getVal('Note1') || '',
              note2: getVal('note2') || getVal('Note2') || '',
              note3: getVal('note3') || getVal('Additional_note') || '',
              kategori: getVal('category') || getVal('kategori') || 'Keduanya',
              prioritas: String(getVal('prioritas') || getVal('Checkbox untuk Pop up')).toUpperCase() === 'TRUE' ? 1 : 999
            };
          }).filter(promo => {
            const promoId = String(promo.id);
            const promoTitle = String(promo.title).toLowerCase();
            // Filter: Sembunyikan jika ID kosong atau Judul mengandung kata 'contoh'/'template'
            const isPlaceholder = promoTitle.includes('contoh') || promoTitle.includes('template');
            return promoId !== '0' && promoId !== 'null' && !isPlaceholder;
          });

          // Resolve hanya dengan data dari Google Sheets
          resolve(mappedPromos);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        console.error("PapaParse Error:", error);
        reject(error);
      }
    });
  });
};
