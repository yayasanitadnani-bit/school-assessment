"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight, BookOpen, Users, Award } from "lucide-react";

export default function ParentHome() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* WATERMARK LOGO SEKOLAH DI LATAR BELAKANG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <img
          src="/Logo.png"
          alt="Watermark Logo"
          /* -translate-y-52 akan mendorong logo lebih tinggi lagi ke atas khusus di layar HP */
          className="w-[300px] sm:w-[520px] lg:w-[680px] h-[300px] sm:h-[520px] lg:h-[680px] object-contain opacity-[0.08] select-none -translate-y-52 sm:translate-y-0"
        />
      </div>

      {/* Navbar Minimalis */}
      <header className="w-full max-w-5xl mx-auto p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex items-center justify-center p-1.5">
            <img
              src="/Logo.png"
              alt="Logo Sekolah"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="block font-black text-slate-900 text-lg tracking-tight">
              SD S 117 IT Adnani
            </span>
            <span className="block text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Portal Wali Murid
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section Utama */}
      <main className="max-w-4xl mx-auto px-6 py-6 sm:py-12 text-center space-y-6 sm:space-y-8 my-auto relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wider uppercase shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Transparansi Perkembangan Anak</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Pantau Evaluasi & Karakter <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Buah Hati Anda Secara Berkala
          </span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Selamat datang di Portal Orang Tua SD S 117 Islam Terpadu Adnani.
          Akses rekam jejak kedisiplinan, tugas, dan perkembangan harian siswa
          secara real-time.
        </p>

        {/* Tombol Masuk */}
        <div className="py-2 flex flex-col sm:flex-row items-center justify-center">
          <Link
            href="/parent/rekap"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-3 group text-base"
          >
            <span>Masuk ke Portal Rekapitulasi</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Info Fitur Singkat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 text-left">
          <div className="bg-white/90 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Evaluasi Mingguan
            </h3>
            <p className="text-xs text-slate-500">
              Rekap nilai kedisiplinan dan ibadah diperbarui secara rutin setiap
              pekan.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Mudah Diakses
            </h3>
            <p className="text-xs text-slate-500">
              Cukup pilih tingkat kelas dan rombel anak untuk melihat rincian
              nilai.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Akurat & Transparan
            </h3>
            <p className="text-xs text-slate-500">
              Data langsung disinkronkan dari catatan resmi wali kelas di
              sekolah.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto p-6 text-center text-xs text-slate-400 font-medium border-t border-slate-200/60 mt-8 relative z-10">
        <p>&copy; 2026 SD S 117 Islam Terpadu Adnani. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  );
}
