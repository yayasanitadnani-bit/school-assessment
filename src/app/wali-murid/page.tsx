// import React from "react";

// // Komponen kartu 5 kotak untuk rekap mingguan siswa
// interface WeeklyCardProps {
//   weekRange: string;
//   uh: number;
//   kehadiran: number;
//   tugas: number;
//   sikap: number;
// }

// function WeeklyCard({
//   weekRange,
//   uh,
//   kehadiran,
//   tugas,
//   sikap,
// }: WeeklyCardProps) {
//   // Hitung rata-rata dari 4 variabel utama untuk kotak kelima
//   const weeklyAverage = Number(
//     ((uh + kehadiran + tugas + sikap) / 4).toFixed(1),
//   );

//   const getStatusLabel = (score: number) => {
//     if (score >= 85) return "Sangat Baik";
//     if (score >= 75) return "Baik";
//     return "Perlu Bimbingan";
//   };

//   const getStatusColor = (score: number) => {
//     if (score >= 75) return "text-emerald-600 bg-emerald-50";
//     return "text-rose-600 bg-rose-50";
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
//       {/* Header Periode Minggu */}
//       <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
//         <div>
//           <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
//             Periode Minggu
//           </span>
//           <h3 className="text-lg font-bold text-gray-800">{weekRange}</h3>
//         </div>
//       </div>

//       {/* Grid 5 Kotak (UH, Kehadiran, Tugas, Sikap, dan Rata-Rata) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//         {/* Kotak 1: UH */}
//         <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
//           <div>
//             <span className="text-2xl font-black text-gray-900">{uh}</span>
//             <span className="text-sm font-bold text-gray-700 ml-2">UH</span>
//           </div>
//           <div className="mt-3">
//             <span
//               className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(uh)}`}
//             >
//               {getStatusLabel(uh)}
//             </span>
//           </div>
//         </div>

//         {/* Kotak 2: Kehadiran */}
//         <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
//           <div>
//             <span className="text-2xl font-black text-gray-900">
//               {kehadiran}
//             </span>
//             <span className="text-sm font-bold text-gray-700 ml-2">
//               Kehadiran
//             </span>
//           </div>
//           <div className="mt-3">
//             <span
//               className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(kehadiran)}`}
//             >
//               {getStatusLabel(kehadiran)}
//             </span>
//           </div>
//         </div>

//         {/* Kotak 3: Tugas */}
//         <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
//           <div>
//             <span className="text-2xl font-black text-gray-900">{tugas}</span>
//             <span className="text-sm font-bold text-gray-700 ml-2">Tugas</span>
//           </div>
//           <div className="mt-3">
//             <span
//               className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(tugas)}`}
//             >
//               {getStatusLabel(tugas)}
//             </span>
//           </div>
//         </div>

//         {/* Kotak 4: Sikap */}
//         <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
//           <div>
//             <span className="text-2xl font-black text-gray-900">{sikap}</span>
//             <span className="text-sm font-bold text-gray-700 ml-2">Sikap</span>
//           </div>
//           <div className="mt-3">
//             <span
//               className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(sikap)}`}
//             >
//               {getStatusLabel(sikap)}
//             </span>
//           </div>
//         </div>

//         {/* Kotak 5: Rata-Rata Minggu Ini */}
//         <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
//           <div>
//             <span className="text-2xl font-black text-emerald-700">
//               {weeklyAverage}
//             </span>
//             <span className="text-sm font-bold text-emerald-900 ml-1">
//               Rata-Rata
//             </span>
//           </div>
//           <div className="mt-3">
//             <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
//               Hasil Pekan Ini
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function WaliMuridPerkembanganPage() {
//   // Contoh data siswa dan rekap mingguan (nantinya bisa ditarik dari database Supabase)
//   const dataSiswa = {
//     nama: "Al Baasith",
//     nis: "1380",
//   };

//   const riwayatMingguan = [
//     {
//       weekRange: "21-25 Sep 2026",
//       uh: 66,
//       kehadiran: 100,
//       tugas: 55,
//       sikap: 60,
//     },
//     {
//       weekRange: "14-18 Sep 2026",
//       uh: 80,
//       kehadiran: 90,
//       tugas: 75,
//       sikap: 85,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header Profil Siswa (Mirip Referensi Foto) */}
//         <div className="bg-[#2D5A27] text-white rounded-2xl p-6 shadow-sm mb-6">
//           <h1 className="text-2xl font-bold mb-1">Perkembangan</h1>
//           <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 inline-block w-full">
//             <h2 className="text-lg font-semibold">{dataSiswa.nama}</h2>
//             <p className="text-sm text-emerald-100">NIS: {dataSiswa.nis}</p>
//           </div>
//         </div>

//         {/* Judul Bagian */}
//         <div className="mb-4">
//           <h3 className="text-xl font-bold text-gray-800">
//             Ringkasan Perkembangan
//           </h3>
//           <p className="text-sm text-gray-500">
//             Rata-rata nilai berdasarkan kelompok penilaian per minggu.
//           </p>
//         </div>

//         {/* Daftar Kartu Rekap Nilai Mingguan */}
//         {riwayatMingguan.map((item, index) => (
//           <WeeklyCard
//             key={index}
//             weekRange={item.weekRange}
//             uh={item.uh}
//             kehadiran={item.kehadiran}
//             tugas={item.tugas}
//             sikap={item.sikap}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }
