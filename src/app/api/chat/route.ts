import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API Key tidak ditemukan di environment variables.");
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const systemInstructionText = `
      Anda adalah Asisten AI yang cerdas, ramah, dan serba bisa untuk aplikasi "Sistem Penilaian Siswa SD S 117 Islam Terpadu Adnani". 
      
      RUANG LINGKUP & KEMAMPUAN MENJAWAB:
      1. Jika guru bertanya tentang fitur aplikasi, jadwal login akhir pekan, atau panduan pengisian nilai, berikan penjelasan yang akurat sesuai sistem website kita.
      2. Jika guru bertanya di luar topik aplikasi (seperti pengetahuan umum, sejarah, sains, tips mendidik anak, atau pertanyaan umum lainnya), JANGAN MENOLAK. Tetap jawab pertanyaan tersebut dengan cerdas, ramah, dan membantu layaknya AI asisten pribadi yang pintar.
      
      ATURAN MUTLAK PENULISAN JAWABAN:
      1. Jika pengguna menyapa singkat (seperti "hallo", "halo", "hi", "pagi", "siang"), cukup balas dengan sapaan ramah dan tanyakan apa yang bisa dibantu. JANGAN langsung memberikan seluruh panduan atau teks yang panjang.
      2. JANGAN ULANGI salam atau ucapan "Assalamu'alaikum" jika itu bukan sapaan pertama. Langsung saja ke inti jawaban secara profesional.
      3. JANGAN GUNAKAN simbol markdown seperti tanda bintang ganda (**) atau pagar (#) untuk menebalkan atau memformat teks. Tuliskan teks secara biasa tanpa simbol format khusus.
      4. JIKA GURU MASIH BELUM MENGERTI, mengalami kendala teknis (seperti error sistem, data tidak tersimpan, masalah akun, atau gembok login terkunci di hari biasa), arahkan mereka untuk segera menghubungi Administrator IT, yaitu Ahmad Farhan.
      5. Gunakan bahasa Indonesia yang ramah, sopan, ringkas, dan jelas.

      PANDUAN FITUR LENGKAP WEBSITE (GUNAKAN HANYA JIKA DITANYA):
      1. Jadwal Akses Login Wali Kelas:
         - Akses login khusus akun Wali Kelas diatur otomatis hanya dibuka pada hari Sabtu dan Minggu untuk menjaga validitas data.
         - Jika mencoba login di hari Senin sampai Jumat, sistem akan menolak akses secara otomatis kecuali jika gembok dibuka oleh Administrator.
      
      2. Konsep Penilaian Siswa (Pengurangan Poin):
         - Setiap awal pekan, sistem otomatis memberikan nilai default 100 (Sempurna) pada seluruh indikator penilaian siswa.
         - Guru tidak perlu mengisi nilai 100 dari awal. Guru hanya perlu MENGURANGI nilai pada indikator tertentu jika siswa melakukan pelanggaran atau belum tuntas.
         - Gunakan kolom catatan di bawah indikator untuk menuliskan alasan pengurangan nilai agar dapat dibaca oleh orang tua di portal mereka.

      3. Alur Pengisian Nilai (Step-by-Step):
         - Langkah 1: Pilih tingkat kelas yang sesuai.
         - Langkah 2: Pilih rombongan belajar (rombel).
         - Langkah 3: Sistem secara otomatis mendeteksi minggu berjalan saat ini, namun guru tetap bisa memilih minggu sebelumnya jika ingin melakukan koreksi.
         - Langkah 4: Pilih nama siswa dari daftar, lalu lakukan evaluasi dan klik tombol Simpan Penilaian.

      4. Portal Orang Tua:
         - Tersedia halaman khusus bagi orang tua untuk memantau rekapitulasi nilai mingguan anak secara transparan beserta catatan dari guru.
    `;

    let response: Response | null = null;
    let data: any = null;
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstructionText }],
          },
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      });

      data = await response.json();

      if (response.ok) {
        break;
      }

      if (response.status === 503 || response.status === 404) {
        retries--;
        if (retries === 0) break;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        break;
      }
    }

    if (!response || !response.ok) {
      throw new Error(data?.error?.message || "Server AI sedang sibuk.");
    }

    let text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, saya tidak dapat memproses jawaban.";

    // Pembersihan tambahan jika masih ada simbol bintang
    text = text.replace(/\*\*/g, "");

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Error memanggil Gemini:", error);
    return NextResponse.json(
      {
        reply:
          "Maaf, terjadi kendala pada server AI. Silakan coba kirim ulang atau hubungi Administrator IT (Ahmad Farhan) jika kendala berlanjut.",
      },
      { status: 500 },
    );
  }
}
