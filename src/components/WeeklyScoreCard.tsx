import React from "react";

// Contoh data nilai per minggu untuk seorang siswa
interface WeeklyScoreProps {
  weekRange: string; // Contoh: "21-25 Sep 2026"
  uh: number;
  kehadiran: number;
  tugas: number;
  sikap: number;
}

export default function WeeklyScoreCard({
  weekRange,
  uh,
  kehadiran,
  tugas,
  sikap,
}: WeeklyScoreProps) {
  // Hitung rata-rata dari 4 variabel utama
  const weeklyAverage = Number(
    ((uh + kehadiran + tugas + sikap) / 4).toFixed(1),
  );

  // Fungsi helper untuk menentukan label status nilai
  const getStatusLabel = (score: number) => {
    if (score >= 85) return "Sangat Baik";
    if (score >= 75) return "Baik";
    return "Perlu Bimbingan";
  };

  const getStatusColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 bg-emerald-50";
    return "text-rose-600 bg-rose-50";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* Header Minggu */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Periode Minggu
          </span>
          <h3 className="text-lg font-bold text-gray-800">{weekRange}</h3>
        </div>
      </div>

      {/* Grid 5 Kotak (4 Variabel Utama + 1 Kotak Rata-Rata Akhir) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Kotak 1: UH */}
        <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">{uh}</span>
            <span className="text-sm font-bold text-gray-700 ml-2">UH</span>
          </div>
          <div className="mt-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(uh)}`}
            >
              {getStatusLabel(uh)}
            </span>
          </div>
        </div>

        {/* Kotak 2: Kehadiran */}
        <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">
              {kehadiran}
            </span>
            <span className="text-sm font-bold text-gray-700 ml-2">
              Kehadiran
            </span>
          </div>
          <div className="mt-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(kehadiran)}`}
            >
              {getStatusLabel(kehadiran)}
            </span>
          </div>
        </div>

        {/* Kotak 3: Tugas */}
        <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">{tugas}</span>
            <span className="text-sm font-bold text-gray-700 ml-2">Tugas</span>
          </div>
          <div className="mt-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(tugas)}`}
            >
              {getStatusLabel(tugas)}
            </span>
          </div>
        </div>

        {/* Kotak 4: Sikap */}
        <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">{sikap}</span>
            <span className="text-sm font-bold text-gray-700 ml-2">Sikap</span>
          </div>
          <div className="mt-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(sikap)}`}
            >
              {getStatusLabel(sikap)}
            </span>
          </div>
        </div>

        {/* Kotak 5: Rata-Rata Minggu Ini (Sorotan Utama) */}
        <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-2xl font-black text-emerald-700">
              {weeklyAverage}
            </span>
            <span className="text-sm font-bold text-emerald-900 ml-1">
              Rata-Rata
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
              Hasil Pekan Ini
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
