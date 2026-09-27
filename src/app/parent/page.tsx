"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  Search,
  BookOpen,
  ArrowLeft,
  Award,
  GraduationCap,
  Users,
  FolderOpen,
} from "lucide-react";

type Rombel = {
  id: number;
  name: string;
  level: number;
  student_count?: number;
};

type Student = {
  id: string;
  name: string;
  nisn: string;
};

type Variable = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  variable_id: number;
};

type Indicator = {
  id: number;
  name: string;
  category_id: number;
};

type ScoreItem = {
  indicator_id: number;
  week_number: number;
  score: number;
  notes: string;
};

export default function ParentPortalPage() {
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedRombel, setSelectedRombel] = useState<Rombel | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [variables, setVariables] = useState<Variable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [studentScores, setStudentScores] = useState<ScoreItem[]>([]);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: rombelData } = await supabase
        .from("rombels")
        .select("*")
        .order("level");

      const { data: studentData } = await supabase
        .from("students")
        .select("id, name, nisn, rombel_id");

      if (rombelData) {
        const rombelsWithCount = rombelData.map((r) => {
          const count = studentData
            ? studentData.filter(
                (s: any) => Number(s.rombel_id) === Number(r.id),
              ).length
            : 0;
          return { ...r, student_count: count };
        });
        setRombels(rombelsWithCount);
      }

      const { data: varData } = await supabase
        .from("assessment_variables")
        .select("*");
      const { data: catData } = await supabase
        .from("assessment_categories")
        .select("*");
      const { data: indData } = await supabase
        .from("assessment_indicators")
        .select("*");

      setVariables(varData || []);
      setCategories(catData || []);
      setIndicators(indData || []);
    };
    fetchInitialData();
  }, []);

  const availableLevels = Array.from(new Set(rombels.map((r) => r.level))).sort(
    (a, b) => a - b,
  );
  const filteredRombelsByLevel = rombels.filter(
    (r) => r.level === selectedLevel,
  );

  useEffect(() => {
    if (!selectedRombel) return;

    const fetchStudents = async () => {
      setLoadingStudents(true);
      setSelectedStudent(null);
      setSearchQuery("");

      const { data: studentData } = await supabase
        .from("students")
        .select("id, name, nisn")
        .eq("rombel_id", selectedRombel.id)
        .order("name");

      setStudents(studentData || []);
      setLoadingStudents(false);
    };

    fetchStudents();
  }, [selectedRombel]);

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setLoadingReport(true);

    const { data: scoreData } = await supabase
      .from("assessment_points")
      .select("indicator_id, week_number, score, notes")
      .eq("student_id", student.id);

    setStudentScores(scoreData || []);
    setLoadingReport(false);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const scoresForWeek = studentScores.filter(
    (s) => s.week_number === selectedWeek,
  );

  const getScoreInfo = (indicatorId: number) => {
    const found = scoresForWeek.find((s) => s.indicator_id === indicatorId);
    return {
      score: found ? Number(found.score) : 0,
      notes: found ? found.notes : "",
    };
  };

  // Helper untuk menghitung rata-rata per kategori (misal: UH, Kehadiran, Tugas, Sikap)
  const getCategoryAverage = (catId: number) => {
    const indList = indicators.filter((i) => i.category_id === catId);
    if (indList.length === 0) return 0;

    let total = 0;
    indList.forEach((ind) => {
      const info = getScoreInfo(ind.id);
      total += info.score;
    });

    return Math.round((total / indList.length) * 10) / 10;
  };

  // Cari nilai berdasarkan nama kategori secara fleksibel (case-insensitive)
  // 2. Gunakan fungsi pencarian kategori yang lebih presisi berdasarkan ID atau nama persis
  const getCategoryScoreByName = (nameKeyword: string) => {
    const matchedCat = categories.find(
      (c) => c.name.trim().toLowerCase() === nameKeyword.trim().toLowerCase(),
    );
    if (!matchedCat) return 0;
    return getCategoryAverage(matchedCat.id);
  };

  // Pastikan keyword pencarian sesuai dengan nama kategori di database Anda (misal: "UH", "KEHADIRAN", "TUGAS", "SIKAP")
  const scoreUH =
    getCategoryScoreByName("UH") || getCategoryScoreByName("Ulangan Harian");
  const scoreKehadiran =
    getCategoryScoreByName("Kehadiran") || getCategoryScoreByName("Absensi");
  const scoreTugas = getCategoryScoreByName("Tugas");
  const scoreSikap = getCategoryScoreByName("Sikap");

  // Rata-rata dari 4 kotak utama
  const weeklyAverage = Number(
    ((scoreUH + scoreKehadiran + scoreTugas + scoreSikap) / 4).toFixed(1),
  );

  // 1. Selaraskan batas nilai status agar seragam dengan rincian di bawah
  const getStatusLabel = (score: number) => {
    if (score >= 85) return "Sangat Baik";
    if (score >= 70) return "Baik"; // Diubah dari 75 menjadi 70 agar sama dengan rincian bawah
    return "Perlu Perhatian";
  };

  const getStatusColor = (score: number) => {
    if (score >= 70) return "text-emerald-600 bg-emerald-50"; // Disesuaikan juga ke 70
    return "text-amber-600 bg-amber-50";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Portal Laporan Perkembangan Siswa
          </h1>
          <p className="text-sm text-slate-500">
            Pilih tingkat kelas, rombel, dan minggu untuk melihat rekapitulasi
            nilai bertingkat.
          </p>
        </div>

        {/* STEP 1: Pilih Kelas */}
        {!selectedLevel && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Langkah 1: Pilih Tingkat Kelas</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center font-bold text-slate-800 shadow-sm flex flex-col items-center justify-center space-y-1"
                >
                  <span className="text-xl text-emerald-600">Kelas {lvl}</span>
                  <span className="text-xs font-normal text-slate-400">
                    {rombels.filter((r) => r.level === lvl).length} Rombel
                  </span>
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
                <span>Langkah 2: Pilih Rombel (Kelas {selectedLevel})</span>
              </h2>
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-xs flex items-center space-x-1 text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredRombelsByLevel.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRombel(r)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left font-semibold text-slate-800 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <span className="block text-slate-900">{r.name}</span>
                    <span className="text-xs font-normal text-slate-400">
                      {r.student_count || 0} Siswa terdaftar
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                    Pilih
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Cari Siswa & Rapor Bertingkat */}
        {selectedRombel && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Rombel Aktif
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedRombel.name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedRombel(null);
                  setSelectedStudent(null);
                }}
                className="text-xs flex items-center space-x-1 text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ganti Rombel</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Cari Nama Siswa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Ketik nama anak di sini..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {loadingStudents ? (
                <div className="text-center py-6 text-sm text-slate-400">
                  Memuat data siswa...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Tidak ada siswa yang ditemukan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`text-left p-3 rounded-xl border transition-all text-sm font-medium flex flex-col justify-between ${
                        selectedStudent?.id === student.id
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm"
                          : "bg-white border-slate-200 hover:border-emerald-300 text-slate-700"
                      }`}
                    >
                      <span className="truncate">{student.name}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        NISN: {student.nisn}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RAPOR BERTINGKAT & 5 KOTAK RINGKASAN */}
            {selectedStudent && (
              <div className="pt-4 border-t border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase">
                      Rapor Perkembangan
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      NISN: {selectedStudent.nisn}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Pilih Minggu:
                    </span>
                    <select
                      value={selectedWeek}
                      onChange={(e) =>
                        setSelectedWeek(parseInt(e.target.value))
                      }
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white focus:outline-none"
                    >
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((w) => (
                        <option key={w} value={w}>
                          Minggu {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loadingReport ? (
                  <div className="text-center py-8 text-sm text-slate-400">
                    Memuat rekapitulasi nilai...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ===== 5 KOTAK RINGKASAN OTOMATIS ===== */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Ringkasan Perkembangan
                        </h4>
                        <p className="text-xs text-slate-500">
                          Rata-rata nilai berdasarkan kelompok penilaian pada
                          minggu ke-{selectedWeek}.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Kotak 1: UH */}
                        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-2xl font-black text-slate-900">
                              {scoreUH}
                            </span>
                            <span className="text-xs font-bold text-slate-700 ml-2">
                              UH
                            </span>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(scoreUH)}`}
                            >
                              {getStatusLabel(scoreUH)}
                            </span>
                          </div>
                        </div>

                        {/* Kotak 2: Kehadiran */}
                        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-2xl font-black text-slate-900">
                              {scoreKehadiran}
                            </span>
                            <span className="text-xs font-bold text-slate-700 ml-2">
                              Kehadiran
                            </span>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(scoreKehadiran)}`}
                            >
                              {getStatusLabel(scoreKehadiran)}
                            </span>
                          </div>
                        </div>

                        {/* Kotak 3: Tugas */}
                        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-2xl font-black text-slate-900">
                              {scoreTugas}
                            </span>
                            <span className="text-xs font-bold text-slate-700 ml-2">
                              Tugas
                            </span>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(scoreTugas)}`}
                            >
                              {getStatusLabel(scoreTugas)}
                            </span>
                          </div>
                        </div>

                        {/* Kotak 4: Sikap */}
                        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-2xl font-black text-slate-900">
                              {scoreSikap}
                            </span>
                            <span className="text-xs font-bold text-slate-700 ml-2">
                              Sikap
                            </span>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(scoreSikap)}`}
                            >
                              {getStatusLabel(scoreSikap)}
                            </span>
                          </div>
                        </div>

                        {/* Kotak 5: Rata-Rata Minggu Ini */}
                        <div className="bg-emerald-50/90 rounded-xl p-3.5 border border-emerald-200 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                          <div>
                            <span className="text-2xl font-black text-emerald-700">
                              {weeklyAverage}
                            </span>
                            <span className="text-xs font-bold text-emerald-900 ml-1">
                              Rata-Rata
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              Pekan Ini
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* =========================================== */}

                    <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5 pt-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Rincian Indikator Minggu ke-{selectedWeek}</span>
                    </h4>

                    {/* Looping Aspek / Variabel Utama */}
                    <div className="space-y-6">
                      {variables.map((variable) => {
                        const catList = categories.filter(
                          (c) => c.variable_id === variable.id,
                        );
                        if (catList.length === 0) return null;

                        return (
                          <div
                            key={variable.id}
                            className="border-2 border-slate-200 rounded-2xl p-5 space-y-4 bg-white shadow-sm"
                          >
                            <div className="border-b-2 border-emerald-500 pb-2">
                              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                                {variable.name}
                              </h3>
                            </div>

                            <div className="space-y-4">
                              {catList.map((cat) => {
                                const indList = indicators.filter(
                                  (i) => cat.id && i.category_id === cat.id,
                                );
                                if (indList.length === 0) return null;

                                const catAvg = getCategoryAverage(cat.id);

                                return (
                                  <div
                                    key={cat.id}
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                      <div className="flex items-center space-x-2">
                                        <FolderOpen className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">
                                          {cat.name}
                                        </h4>
                                        <span className="text-[11px] text-slate-400">
                                          ({indList.length} indikator)
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-500 font-medium">
                                          Rata-rata:
                                        </span>
                                        <span
                                          className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                                            catAvg >= 85
                                              ? "bg-emerald-100 text-emerald-800"
                                              : catAvg >= 70
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-amber-100 text-amber-800"
                                          }`}
                                        >
                                          {catAvg} (
                                          {catAvg >= 85
                                            ? "Sangat Baik"
                                            : catAvg >= 70
                                              ? "Baik"
                                              : "Perlu Perhatian"}
                                          )
                                        </span>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      {indList.map((ind) => {
                                        const info = getScoreInfo(ind.id);
                                        return (
                                          <div
                                            key={ind.id}
                                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                                          >
                                            <div>
                                              <span className="font-semibold text-slate-800">
                                                • {ind.name}
                                              </span>
                                              {info.notes && (
                                                <p className="text-slate-500 italic mt-0.5">
                                                  Catatan: "{info.notes}"
                                                </p>
                                              )}
                                            </div>
                                            <div className="flex items-center space-x-2 self-end sm:self-auto">
                                              <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                                Nilai: {info.score || "-"}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
