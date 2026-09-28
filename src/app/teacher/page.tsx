"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  ClipboardEdit,
  Bot,
  BookOpen,
  FileSpreadsheet,
  LogOut,
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/"); // Kembali ke halaman utama (Landing Page)
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      {/* Header Dashboard & Tombol Logout */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Sistem Penilaian
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Portal Wali Kelas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang! Silakan pilih menu di bawah ini untuk mengelola
            tugas Anda.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all font-bold text-xs flex items-center space-x-2 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
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
          href="/ai-assistant"
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

        {/* Menu 3: Panduan Guru */}
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

        {/* Menu 4: Export Rekap Nilai */}
        <Link
          href="/teacher/export-rekap"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
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
