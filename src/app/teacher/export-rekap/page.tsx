"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  GraduationCap,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Rombel = {
  id: number;
  name: string;
  level: number;
};

type Student = {
  id: string;
  name: string;
  nisn: string;
};

export default function ExportRekapPage() {
  const router = useRouter();
  const supabase = createClient();

  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedRombel, setSelectedRombel] = useState<Rombel | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all"); // "all" atau ID siswa spesifik
  const [loading, setLoading] = useState(false);

  // Ambil data rombel saat pertama load
  useEffect(() => {
    const fetchRombels = async () => {
      const { data } = await supabase
        .from("rombels")
        .select("*")
        .order("level");
      setRombels(data || []);
    };
    fetchRombels();
  }, []);

  // Ambil data siswa saat rombel dipilih
  useEffect(() => {
    if (!selectedRombel) return;
    const fetchStudents = async () => {
      const { data } = await supabase
        .from("students")
        .select("id, name, nisn")
        .eq("rombel_id", selectedRombel.id)
        .order("name");
      setStudents(data || []);
    };
    fetchStudents();
  }, [selectedRombel]);

  const availableLevels = Array.from(new Set(rombels.map((r) => r.level))).sort(
    (a, b) => a - b,
  );
  const filteredRombels = rombels.filter((r) => r.level === selectedLevel);

  // Fungsi utama untuk menghitung dan mendownload rekap ke CSV/Excel
  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const targetStudents =
        selectedStudentId === "all"
          ? students
          : students.filter((s) => s.id === selectedStudentId);

      if (targetStudents.length === 0) {
        alert("Tidak ada siswa yang dipilih atau rombel kosong.");
        setLoading(false);
        return;
      }

      const studentIds = targetStudents.map((s) => s.id);
      const { data: scoresData } = await supabase
        .from("assessment_points")
        .select("student_id, indicator_id, week_number, score")
        .in("student_id", studentIds);

      const { data: catData } = await supabase
        .from("assessment_categories")
        .select("*");
      const { data: indData } = await supabase
        .from("assessment_indicators")
        .select("*");

      // Menggunakan tabulasi (\t) agar saat dibuka di Excel otomatis terbagi ke dalam kolom-kolom tabel yang rapi
      let excelContent =
        "No\tNISN\tNama Siswa\tRombel\tTotal Minggu Dinilai\tNilai Akhir Semester (Rata-rata)\n";

      for (let i = 0; i < targetStudents.length; i++) {
        const student = targetStudents[i];
        const studentScores = (scoresData || []).filter(
          (s) => s.student_id === student.id,
        );

        const activeWeeks = Array.from(
          new Set(studentScores.map((s) => s.week_number)),
        );

        let totalWeeklyAverages = 0;
        let validWeeksCount = 0;

        activeWeeks.forEach((weekNum) => {
          const scoresForThisWeek = studentScores.filter(
            (s) => s.week_number === weekNum,
          );

          let weekScoreSum = 0;
          let categoryCount = 0;

          if (catData && indData) {
            catData.forEach((cat) => {
              const indicatorsInCat = indData.filter(
                (ind) => ind.category_id === cat.id,
              );
              if (indicatorsInCat.length > 0) {
                const indIds = indicatorsInCat.map((ind) => ind.id);
                const matchedScores = scoresForThisWeek.filter((s) =>
                  indIds.includes(s.indicator_id),
                );

                if (matchedScores.length > 0) {
                  const catAvg =
                    matchedScores.reduce(
                      (acc, curr) => acc + Number(curr.score),
                      0,
                    ) / matchedScores.length;
                  weekScoreSum += catAvg;
                  categoryCount += 1;
                }
              }
            });
          }

          if (categoryCount > 0) {
            const weeklyAvg = weekScoreSum / categoryCount;
            totalWeeklyAverages += weeklyAvg;
            validWeeksCount += 1;
          }
        });

        const finalSemesterScore =
          validWeeksCount > 0
            ? (totalWeeklyAverages / validWeeksCount).toFixed(2)
            : "0.00";

        // Masukkan data terpisah tab (\t) agar masuk ke kolom Excel masing-masing
        excelContent += `${i + 1}\t${student.nisn}\t${student.name}\t${selectedRombel?.name}\t${validWeeksCount}\t${finalSemesterScore}\n`;
      }

      // Ubah ekstensi menjadi .xls agar Excel langsung mengenalinya sebagai format tabel siap-baca
      const blob = new Blob([excelContent], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Rekap_Nilai_Semester_${selectedRombel?.name || "Rombel"}.xls`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal export data:", err);
      alert("Terjadi kesalahan saat mengexport data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Export Rekap Nilai
              </h1>
              <p className="text-xs text-slate-500">
                Unduh data rekapitulasi semester ke Excel/CSV
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/teacher")}
            className="text-xs flex items-center space-x-1 text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-2 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
        </div>

        {/* STEP 1: Pilih Tingkat Kelas */}
        {!selectedLevel && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Pilih Tingkat Kelas</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center font-bold text-slate-800 shadow-sm"
                >
                  <span className="text-lg text-emerald-600">Kelas {lvl}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Pilih Rombel */}
        {selectedLevel && !selectedRombel && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Pilih Rombel Kelas {selectedLevel}</span>
              </h2>
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                Kembali
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredRombels.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRombel(r)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left font-semibold text-slate-800 shadow-sm"
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Pilih Opsi Siswa & Tombol Export */}
        {selectedRombel && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">
                  Rombel Dipilih
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedRombel.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRombel(null)}
                className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                Ganti Rombel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  Target Export Siswa
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">
                    Semua Siswa dalam Rombel Ini (1 Rombel Penuh)
                  </option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (NISN: {s.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportExcel}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {loading
                    ? "Menyiapkan Data..."
                    : "Download Rekap Excel (.csv)"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
