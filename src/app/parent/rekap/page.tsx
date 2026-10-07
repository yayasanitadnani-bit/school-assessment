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
  BookMarked,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

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
  subject_name: string;
};

// PENGELOMPOKAN MATA PELAJARAN UNTUK DROPDOWN ORANG TUA
const SUBJECT_GROUPS = {
  "Mata Pelajaran WALI KELAS": [
    "IPAS",
    "PKN",
    "BHS INDONESIA",
    "SBMN",
    "SB DP",
  ],
  "Mata Pelajaran Bid. Study": [
    "PAI",
    "BHS INGGRIS",
    "PJOK",
    "TIK",
    "MATEMATIKA",
    "BHS ARAB",
  ],
};

const SUBJECTS = [
  ...SUBJECT_GROUPS["Mata Pelajaran WALI KELAS"],
  ...SUBJECT_GROUPS["Mata Pelajaran Bid. Study"],
];

export default function ParentRekapPage() {
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedRombel, setSelectedRombel] = useState<Rombel | null>(null);

  // Minggu aktif sekarang otomatis dihitung dari database
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [variables, setVariables] = useState<Variable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [studentScores, setStudentScores] = useState<ScoreItem[]>([]);

  // State untuk mapel yang sedang dilihat orang tua (Khusus Tugas)
  const [activeSubject, setActiveSubject] = useState<string>(SUBJECTS[0]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const supabase = createClient();

  // MENGHITUNG KELAS & ROMBEL YANG TERSEDIA (Ini yang tadi terhapus!)
  const availableLevels = Array.from(new Set(rombels.map((r) => r.level))).sort(
    (a, b) => a - b,
  );
  const filteredRombelsByLevel = rombels.filter(
    (r) => r.level === selectedLevel,
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true);

      // Ambil Rombel & Siswa
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

      // Ambil Variabel, Kategori, Indikator
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

      // Auto-deteksi Minggu ke Berapa Saat Ini
      const { data: activeAY } = await supabase
        .from("academic_years")
        .select("semester, name")
        .eq("is_active", true)
        .single();
      if (activeAY) {
        const startYear = parseInt(activeAY.name.split("/")[0]);
        const startDate = activeAY.semester.toLowerCase().includes("genap")
          ? new Date(`${startYear + 1}-01-04`)
          : new Date(`${startYear}-07-13`);

        const diffDays = Math.floor(
          (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        let autoWeek = Math.floor(diffDays / 7) + 1;
        if (autoWeek < 1) autoWeek = 1;
        if (autoWeek > 24) autoWeek = 24;
        setSelectedWeek(autoWeek);
      }

      setLoadingInitial(false);
    };
    fetchInitialData();
  }, []);

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
      .select("indicator_id, week_number, score, notes, subject_name")
      .eq("student_id", student.id);

    setStudentScores(scoreData || []);
    setLoadingReport(false);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pastikan mengubah format data dari Supabase menjadi murni Angka (Number)
  const scoresForWeek = studentScores.filter(
    (s) => Number(s.week_number) === Number(selectedWeek),
  );

  const getScoreInfo = (indicatorId: number, subjectName: string) => {
    const found = scoresForWeek.find(
      (s) =>
        Number(s.indicator_id) === Number(indicatorId) &&
        (s.subject_name === subjectName ||
          (!s.subject_name && subjectName === "Umum")),
    );
    return {
      score: found ? Number(found.score) : null,
      notes: found ? found.notes : "",
    };
  };

  const getCategoryAverage = (catId: number) => {
    const indList = indicators.filter(
      (i) => Number(i.category_id) === Number(catId),
    );
    if (indList.length === 0) return 0;

    const indIds = indList.map((i) => Number(i.id));
    const relatedScores = scoresForWeek.filter((s) =>
      indIds.includes(Number(s.indicator_id)),
    );

    if (relatedScores.length === 0) return 0;
    const total = relatedScores.reduce((sum, s) => sum + Number(s.score), 0);
    return Math.round((total / relatedScores.length) * 10) / 10;
  };

  const getCategoryScoreByName = (nameKeyword: string) => {
    const matchedCat = categories.find(
      (c) => c.name.trim().toLowerCase() === nameKeyword.trim().toLowerCase(),
    );
    if (!matchedCat) return 0;
    return getCategoryAverage(Number(matchedCat.id));
  };

  const scoreUH =
    getCategoryScoreByName("UH") || getCategoryScoreByName("Ulangan Harian");
  const scoreKehadiran =
    getCategoryScoreByName("Kehadiran") || getCategoryScoreByName("Absensi");
  const scoreTugas = getCategoryScoreByName("Tugas");
  const scoreSikap = getCategoryScoreByName("Sikap");

  const components = [scoreUH, scoreKehadiran, scoreTugas, scoreSikap].filter(
    (s) => s > 0,
  );
  const sumScores = components.reduce((a, b) => a + b, 0);
  const weeklyAverage =
    components.length > 0
      ? Number((sumScores / components.length).toFixed(1))
      : 0;

  const getStatusLabel = (score: number) => {
    if (score === 0) return "-";
    if (score >= 85) return "Sangat Baik";
    if (score >= 70) return "Baik";
    return "Perlu Perhatian";
  };

  const getStatusColor = (score: number) => {
    if (score === 0) return "text-slate-400 bg-slate-100";
    if (score >= 70) return "text-emerald-600 bg-emerald-50";
    return "text-amber-600 bg-amber-50";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/parent"
            className="inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Portal</span>
          </Link>
        </div>

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

        {/* STEP 1 & 2 */}
        {!selectedLevel && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Langkah 1: Pilih Tingkat Kelas</span>
            </h2>
            {loadingInitial ? (
              <div className="text-center py-10 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-400">Memuat data kelas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center font-bold text-slate-800 shadow-sm"
                  >
                    <span className="text-xl text-emerald-600 block">
                      Kelas {lvl}
                    </span>
                    <span className="text-xs font-normal text-slate-400 block mt-1">
                      {rombels.filter((r) => r.level === lvl).length} Rombel
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left shadow-sm flex justify-between items-center"
                >
                  <div>
                    <span className="block text-slate-900 font-semibold">
                      {r.name}
                    </span>
                    <span className="text-xs font-normal text-slate-400">
                      {r.student_count || 0} Siswa
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {selectedRombel && !selectedStudent && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">
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
                className="text-xs flex items-center space-x-1 text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ganti Rombel</span>
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Langkah 3: Cari Nama Siswa
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik nama anak..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              {loadingStudents ? (
                <div className="text-center py-8">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[400px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="text-left p-4 rounded-xl border bg-white border-slate-200 hover:border-emerald-400 transition-all text-sm font-medium"
                    >
                      <span className="block truncate text-slate-800 font-bold">
                        {student.name}
                      </span>
                      <span className="text-xs text-slate-400 block mt-1">
                        NISN: {student.nisn}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: RAPOR BERTINGKAT & KOTAK RINGKASAN */}
        {selectedStudent && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Siswa</span>
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-5 rounded-2xl border border-slate-200 gap-4">
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                  Rapor Perkembangan
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  NISN: {selectedStudent.nisn} • {selectedRombel?.name}
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Minggu:
                </span>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  className="px-3 py-1.5 border-2 border-emerald-500 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-800 cursor-pointer outline-none"
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
              <div className="text-center py-12 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-400">
                  Memuat rekapitulasi nilai...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* KOTAK RINGKASAN */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
                  <div>
                    <h4 className="text-base font-bold text-slate-800">
                      Ringkasan Perkembangan
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Rata-rata nilai pada minggu ke-{selectedWeek}. *(Rata-rata
                      Tugas dihitung dari akumulasi semua Mapel)*
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="text-3xl font-black text-slate-900">
                          {scoreUH || "-"}
                        </span>
                        <span className="text-xs font-bold text-slate-700 block mt-1">
                          UH
                        </span>
                      </div>
                      <div className="mt-3">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${getStatusColor(scoreUH)}`}
                        >
                          {getStatusLabel(scoreUH)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="text-3xl font-black text-slate-900">
                          {scoreKehadiran || "-"}
                        </span>
                        <span className="text-xs font-bold text-slate-700 block mt-1">
                          Kehadiran
                        </span>
                      </div>
                      <div className="mt-3">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${getStatusColor(scoreKehadiran)}`}
                        >
                          {getStatusLabel(scoreKehadiran)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="text-3xl font-black text-slate-900">
                          {scoreTugas || "-"}
                        </span>
                        <span className="text-xs font-bold text-slate-700 block mt-1">
                          Tugas (Akumulasi)
                        </span>
                      </div>
                      <div className="mt-3">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${getStatusColor(scoreTugas)}`}
                        >
                          {getStatusLabel(scoreTugas)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="text-3xl font-black text-slate-900">
                          {scoreSikap || "-"}
                        </span>
                        <span className="text-xs font-bold text-slate-700 block mt-1">
                          Sikap
                        </span>
                      </div>
                      <div className="mt-3">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${getStatusColor(scoreSikap)}`}
                        >
                          {getStatusLabel(scoreSikap)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex flex-col justify-between sm:col-span-2 lg:col-span-1 shadow-sm">
                      <div>
                        <span className="text-3xl font-black text-emerald-700">
                          {weeklyAverage || "-"}
                        </span>
                        <span className="text-xs font-bold text-emerald-900 block mt-1">
                          Rata-Rata
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-600 text-white">
                          Pekan Ini
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-base font-bold text-slate-800">
                    Rincian Indikator Minggu ke-{selectedWeek}
                  </h4>
                </div>

                {/* PERINGATAN JIKA VARIABEL KOSONG KARENA TERBLOKIR SUPABASE RLS */}
                {variables.length === 0 && !loadingInitial && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <div className="text-sm font-medium">
                      <p className="font-bold text-base mb-1">
                        Rincian Variabel Terblokir Sistem (Kosong)
                      </p>
                      <p>
                        Jika data nilai tidak muncul di sini, itu karena tabel
                        database Anda di Supabase saat ini dikunci. Masuk ke
                        dashboard{" "}
                        <b>
                          Supabase {">"} Authentication {">"} Policies
                        </b>
                        , lalu buat aturan{" "}
                        <i>"Enable read access for all users"</i> (Aktifkan
                        Publik) untuk tabel:
                        <br />
                        <br />
                        <code className="bg-white px-2 py-1 rounded border border-amber-300 text-xs">
                          assessment_variables
                        </code>
                        ,
                        <code className="bg-white px-2 py-1 rounded border border-amber-300 text-xs ml-1">
                          assessment_categories
                        </code>
                        ,
                        <code className="bg-white px-2 py-1 rounded border border-amber-300 text-xs ml-1">
                          assessment_indicators
                        </code>
                        , dan
                        <code className="bg-white px-2 py-1 rounded border border-amber-300 text-xs ml-1">
                          assessment_points
                        </code>
                        .
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {variables.map((variable) => {
                    const catList = categories.filter(
                      (c) => Number(c.variable_id) === Number(variable.id),
                    );
                    if (catList.length === 0) return null;

                    return (
                      <div
                        key={variable.id}
                        className="border-2 border-slate-100 rounded-2xl p-5 sm:p-6 space-y-5 bg-slate-50/30 shadow-sm"
                      >
                        <div className="border-b-2 border-emerald-500 pb-2 inline-block">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                            {variable.name}
                          </h3>
                        </div>

                        <div className="space-y-5 mt-2">
                          {catList.map((cat) => {
                            const indList = indicators.filter(
                              (i) => Number(i.category_id) === Number(cat.id),
                            );
                            if (indList.length === 0) return null;

                            const catAvg = getCategoryAverage(cat.id);
                            const isTugas = cat.name
                              .toUpperCase()
                              .includes("TUGAS");

                            return (
                              <div
                                key={cat.id}
                                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                                  <div className="flex items-center space-x-2">
                                    <FolderOpen className="w-5 h-5 text-emerald-600" />
                                    <h4 className="font-bold text-slate-800 uppercase text-sm tracking-wider">
                                      {cat.name}
                                    </h4>
                                    <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md ml-2">
                                      {indList.length} Butir
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-500 font-medium">
                                      Rata-rata:
                                    </span>
                                    <span
                                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${catAvg >= 85 ? "bg-emerald-100 text-emerald-800" : catAvg >= 70 ? "bg-blue-100 text-blue-800" : catAvg > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}
                                    >
                                      {catAvg || "-"} (
                                      {catAvg >= 85
                                        ? "Sangat Baik"
                                        : catAvg >= 70
                                          ? "Baik"
                                          : catAvg > 0
                                            ? "Perlu Perhatian"
                                            : "Belum Dinilai"}
                                      )
                                    </span>
                                  </div>
                                </div>

                                {isTugas && (
                                  <div className="space-y-2 pt-4 pb-1">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                      <BookMarked className="w-4 h-4 text-emerald-600" />{" "}
                                      Pilih Mata Pelajaran:
                                    </label>
                                    <select
                                      value={activeSubject}
                                      onChange={(e) =>
                                        setActiveSubject(e.target.value)
                                      }
                                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-white focus:border-emerald-500 focus:ring-0 transition-colors cursor-pointer appearance-none shadow-sm"
                                      style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: `right 0.75rem center`,
                                        backgroundRepeat: `no-repeat`,
                                        backgroundSize: `1.5em 1.5em`,
                                      }}
                                    >
                                      {Object.entries(SUBJECT_GROUPS).map(
                                        ([groupName, subjects]) => (
                                          <optgroup
                                            key={groupName}
                                            label={groupName}
                                            className="font-bold text-slate-400 bg-white"
                                          >
                                            {subjects.map((sub) => (
                                              <option
                                                key={sub}
                                                value={sub}
                                                className="font-semibold text-slate-800"
                                              >
                                                {sub}
                                              </option>
                                            ))}
                                          </optgroup>
                                        ),
                                      )}
                                    </select>
                                  </div>
                                )}

                                <div className="space-y-2 mt-4">
                                  {indList.map((ind, iIdx) => {
                                    const targetSub = isTugas
                                      ? activeSubject
                                      : "Umum";
                                    const info = getScoreInfo(
                                      ind.id,
                                      targetSub,
                                    );

                                    return (
                                      <div
                                        key={ind.id}
                                        className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-3 hover:border-emerald-200 transition-colors"
                                      >
                                        <div className="flex items-start space-x-3 pr-2">
                                          <span className="w-5 h-5 shrink-0 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center text-[10px] font-bold mt-0.5">
                                            {iIdx + 1}
                                          </span>
                                          <div>
                                            <span className="font-semibold text-slate-800 leading-snug">
                                              {ind.name}
                                            </span>
                                            {info.notes && (
                                              <p className="text-slate-500 italic text-xs mt-1 bg-white p-2 rounded border border-slate-100">
                                                Catatan Guru: "{info.notes}"
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                                          <span className="font-black text-slate-900 bg-white border border-slate-200 px-4 py-1.5 rounded-lg shadow-sm">
                                            Nilai:{" "}
                                            {info.score !== null
                                              ? info.score
                                              : "-"}
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
    </div>
  );
}
