import Link from "next/link";
import { ClipboardEdit, Bot, BookOpen, FileSpreadsheet } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      {/* Header Dashboard */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Portal Wali Kelas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang! Silakan pilih menu di bawah ini untuk memulai tugas
            Anda.
          </p>
        </div>
      </div>

      {/* Grid Menu Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menu 1: Input Penilaian */}
        <Link
          href="/teacher/assessments"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ClipboardEdit className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Input Penilaian Siswa
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Masuk ke form evaluasi akhir pekan untuk mengelola nilai
              kedisiplinan dan tugas siswa.
            </p>
          </div>
        </Link>

        {/* Menu 2: Asisten AI Guru */}
        <Link
          href="/teacher/ai-assistant"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Tanya Asisten AI
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Bingung cara memberi nilai atau butuh saran evaluasi? Tanyakan
              pada AI pintar kami di sini.
            </p>
          </div>
        </Link>

        {/* Menu 3: (Opsional) Rekap Nilai/Panduan */}
        <Link
          href="/teacher/guide"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Panduan Guru
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Baca panduan lengkap mengenai indikator penilaian kedisiplinan dan
              tugas di sekolah.
            </p>
          </div>
        </Link>
        <Link
          href="/teacher/export-rekap"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              Export Rekap Nilai
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Unduh rekapitulasi nilai akhir semester per siswa atau seluruh
              siswa dalam rombel ke format Excel.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
