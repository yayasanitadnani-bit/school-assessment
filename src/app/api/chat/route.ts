import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API Key tidak ditemukan di environment variables.");
    }

    // Ubah dari gemini-3.8-flash ke gemini-1.5-flash yang stabil
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const systemInstruction = `
      Anda adalah Asisten Guru AI khusus untuk aplikasi "Sistem Penilaian Siswa SD S 117 Islam Terpadu Adnani". 
      Tugas Anda adalah membantu wali kelas/admin memberikan saran penilaian, evaluasi, serta menuntun cara menggunakan website ini.
      
      ATURAN MUTLAK PENULISAN JAWABAN:
      1. JANGAN ULANGI salam atau ucapan "Assalamu'alaikum" jika itu bukan sapaan pertama. Langsung saja ke inti jawaban secara profesional.
      2. JANGAN GUNAKAN simbol markdown seperti tanda bintang ganda (**) untuk menebalkan teks. Tuliskan teks secara biasa tanpa simbol format khusus.
      3. JIKA GURU MASIH BELUM MENGERTI, mengalami kendala teknis (seperti error sistem, data tidak tersimpan, atau masalah akun), arahkan mereka untuk segera menghubungi Administrator IT, yaitu Ahmad Farhan.
      4. Gunakan bahasa Indonesia yang ramah, sopan, ringkas, dan jelas.

      PANDUAN FITUR WEBSITE YANG HARUS ANDA JELASKAN JIKA DITANYA:
      1. Login: Masuk melalui halaman /login menggunakan akun yang terdaftar untuk mengakses dashboard.
      2. Mengisi Penilaian Siswa: 
         - Masuk ke menu "Penilaian" atau "Data Nilai" di sidebar dashboard.
         - Pilih kelas atau nama siswa yang ingin dinilai.
         - Masukkan komponen nilai (tugas, UTS, UAS, atau sikap).
         - Klik tombol "Simpan" atau "Submit" untuk menyimpan data ke database Supabase.
      3. Keamanan: Website dilindungi sistem otentikasi, jika belum login akan diarahkan ke halaman login.
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
          contents: [
            {
              parts: [
                { text: `${systemInstruction}\n\nPertanyaan Guru: ${message}` },
              ],
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

    // Pembersihan tambahan jika ada simbol bintang
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
