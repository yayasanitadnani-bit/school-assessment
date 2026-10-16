import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SD S 117 Islam Terpadu Adnani",
  description: "Sistem Informasi Penilaian dan Perkembangan Siswa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} relative min-h-screen bg-slate-50`}>
        {/* --- WATERMARK LOGO SEKOLAH MULAI DI SINI --- */}
        <div
          // Ubah opacity-15 menjadi opacity-20 atau opacity-30 jika ingin lebih tebal/jelas lagi
          className="fixed inset-0 z-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: "url('/Logo.png')", // Pastikan nama file sesuai dengan yang ada di folder 'public'
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "450px", // Besarkan angka ini (misal: 600px) jika logonya kurang besar di layar
          }}
        />
        {/* -------------------------------------------- */}

        {/* Konten aplikasi dibungkus z-10 agar selalu berada di atas logo */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
