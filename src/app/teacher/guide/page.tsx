"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  ListChecks,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export default function TeacherGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tombol Kembali */}
        <Link
          href="/teacher"
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors bg-white hover:bg-emerald-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Menu Utama</span>
        </Link>

        {/* Header Title */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-2xl mb-2">
            <ListChecks className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Buku Panduan Wali Kelas
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
            Panduan lengkap langkah demi langkah penggunaan Sistem Penilaian
            Siswa SD. Silakan baca petunjuk di bawah ini sebelum mulai menginput
            nilai.
          </p>
        </div>

        {/* Isi Panduan */}
        <div className="space-y-6">
          {/* Panduan 1: Jadwal Akses */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                1. Jadwal Pengisian Nilai (Kunci Sistem)
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Untuk menjaga kedisiplinan dan kerapian data, akses login bagi
                akun Wali Kelas{" "}
                <strong>
                  hanya dibuka pada akhir pekan (Sabtu dan Minggu)
                </strong>
                .
              </p>
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-800">
                  Jika Anda mencoba login pada hari Senin hingga Jumat, sistem
                  akan otomatis menolak akses. Jika ada kebutuhan mendesak untuk
                  mengisi di hari biasa, silakan hubungi Administrator Yayasan
                  untuk membuka gembok akses sementara.
                </p>
              </div>
            </div>
          </div>

          {/* Panduan 2: Sistem Pengurangan Nilai (Penting) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                2. Konsep Penilaian (Poin Pengurangan)
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sistem ini menggunakan metode <strong>Pengurangan Poin</strong>.
                Artinya:
              </p>
              <ul className="mt-3 space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>
                    Setiap awal minggu, seluruh indikator penilaian siswa
                    (contoh: sholat, tugas, kehadiran) akan{" "}
                    <strong>otomatis terisi nilai 100 (Sempurna)</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>
                    Guru <strong>tidak perlu repot mengetik nilai 100</strong>{" "}
                    satu per satu untuk anak yang disiplin.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>
                    Guru <strong>hanya perlu MENGURANGI nilai</strong> jika
                    siswa tersebut melakukan pelanggaran atau tidak memenuhi
                    target pada minggu tersebut (misalnya diubah menjadi 80, 70,
                    dst).
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Panduan 3: Alur Pengisian Step-by-Step */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <ListChecks className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                3. Alur Pengisian Nilai (Step-by-Step)
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Pengisian nilai didesain bertahap agar tampilan tetap rapi saat
                diakses melalui HP maupun Laptop.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    1
                  </div>
                  <p className="text-sm text-slate-700">
                    <strong>Pilih Tingkat Kelas:</strong> Mulai dengan memilih
                    kelas yang Anda ajar.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    2
                  </div>
                  <p className="text-sm text-slate-700">
                    <strong>Pilih Rombel:</strong> Klik nama rombongan belajar
                    (misal: Al Baasith).
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    3
                  </div>
                  <p className="text-sm text-slate-700">
                    <strong>Pilih Minggu & Siswa:</strong> Pastikan Anda memilih{" "}
                    <strong>Minggu Ke-berapa</strong> di pojok kanan atas, lalu
                    klik nama siswa yang ingin dievaluasi.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    4
                  </div>
                  <p className="text-sm text-slate-700">
                    <strong>Input Nilai:</strong> Ubah angka 100 menjadi nilai
                    yang sesuai (jika ada evaluasi). Sistem akan otomatis
                    memberi warna hijau (Sangat Baik), Biru (Baik), atau Kuning
                    (Perlu Bimbingan).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panduan 4: Catatan Evaluasi */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                4. Memberikan Catatan & Menyimpan
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Di bawah setiap kotak nilai indikator, terdapat kolom teks
                panjang. Gunakan kolom tersebut untuk menulis alasan jika Anda
                mengurangi nilai siswa (Contoh:{" "}
                <em>"Terlambat sholat dzuhur 2x minggu ini"</em>). Catatan ini
                akan sangat membantu orang tua saat mengecek rapor di Portal
                Orang Tua.
              </p>
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm font-bold text-emerald-800">
                  Tahap Akhir: Jangan Lupa Klik "Simpan Penilaian"!
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Setelah selesai mengubah nilai satu siswa, scroll ke bagian
                  paling atas atau bawah dan klik tombol hijau "Simpan
                  Penilaian". Sistem akan menyimpan data dan otomatis
                  mengembalikan Anda ke daftar siswa setelah 2 detik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
