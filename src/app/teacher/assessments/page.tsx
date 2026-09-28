"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  CheckCircle,
  AlertCircle,
  MessageSquare,
  LogOut,
  ExternalLink,
  FolderOpen,
  ArrowLeft,
  GraduationCap,
  Users,
  BookOpen,
  ChevronRight,
  UserCircle2,
  CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

type PointData = {
  score: number | "";
  notes: string;
};

export default function TeacherAssessmentPage() {
  // Step Navigation State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [selectedRombel, setSelectedRombel] = useState<string>("");
  const [weekNumber, setWeekNumber] = useState<number>(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [variables, setVariables] = useState<Variable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  const [pointDetails, setPointDetails] = useState<Record<string, PointData>>(
    {},
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    // 1. Tentukan tanggal hari pertama sekolah / awal semester (Format: YYYY-MM-DD)
    // Sesuaikan tanggal ini dengan kalender akademik yayasan
    const startDate = new Date("2026-07-13");
    const today = new Date();

    // 2. Hitung selisih waktu
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 3. Konversi hari menjadi minggu (dibagi 7)
    let autoWeek = Math.floor(diffDays / 7) + 1;

    // 4. Pastikan nilainya tetap masuk akal (minimal 1, maksimal 24 minggu)
    if (autoWeek < 1) autoWeek = 1;
    if (autoWeek > 24) autoWeek = 24;

    // 5. Ubah dropdown secara otomatis
    setWeekNumber(autoWeek);
  }, []);

  // Derived data
  const uniqueLevels = Array.from(new Set(rombels.map((r) => r.level))).sort(
    (a, b) => a - b,
  );
  const filteredRombels = rombels.filter((r) => r.level === selectedLevel);
  const activeRombelName =
    rombels.find((r) => r.id.toString() === selectedRombel)?.name || "";

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: rombelData } = await supabase
        .from("rombels")
        .select("*")
        .order("level");
      if (rombelData) setRombels(rombelData);

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

  useEffect(() => {
    if (!selectedRombel) return;

    const fetchStudents = async () => {
      setLoading(true);
      setError(null);

      const { data: studentData } = await supabase
        .from("students")
        .select("id, name, nisn")
        .eq("rombel_id", parseInt(selectedRombel))
        .order("name");

      setStudents(studentData || []);
      setLoading(false);
    };

    fetchStudents();
  }, [selectedRombel]);

  useEffect(() => {
    if (!selectedRombel || !selectedStudent || indicators.length === 0) return;

    const fetchScores = async () => {
      const { data: existingScores } = await supabase
        .from("assessment_points")
        .select("indicator_id, score, notes")
        .eq("rombel_id", parseInt(selectedRombel))
        .eq("student_id", selectedStudent.id)
        .eq("week_number", weekNumber);

      const detailsMap: Record<string, PointData> = {};
      indicators.forEach((ind) => {
        detailsMap[ind.id] = { score: 100, notes: "" };
      });

      if (existingScores) {
        existingScores.forEach((item) => {
          detailsMap[item.indicator_id] = {
            score: item.score ?? 100,
            notes: item.notes ?? "",
          };
        });
      }
      setPointDetails(detailsMap);
    };

    fetchScores();
  }, [selectedStudent, weekNumber, indicators]);

  const handleScoreChange = (indicatorId: number, val: string) => {
    if (val === "") {
      setPointDetails((prev) => ({
        ...prev,
        [indicatorId]: { score: "", notes: prev[indicatorId]?.notes || "" },
      }));
      return;
    }

    const numVal = parseInt(val);
    const cleanVal = Math.max(0, Math.min(100, isNaN(numVal) ? 0 : numVal));
    setPointDetails((prev) => ({
      ...prev,
      [indicatorId]: { score: cleanVal, notes: prev[indicatorId]?.notes || "" },
    }));
  };

  const handleNoteChange = (indicatorId: number, text: string) => {
    setPointDetails((prev) => ({
      ...prev,
      [indicatorId]: { score: prev[indicatorId]?.score ?? 100, notes: text },
    }));
  };

  const handleSaveStudent = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const upsertData = indicators.map((ind) => {
        const current = pointDetails[ind.id];
        return {
          student_id: selectedStudent.id,
          indicator_id: ind.id,
          rombel_id: parseInt(selectedRombel),
          week_number: weekNumber,
          score:
            current?.score === "" || current?.score === undefined
              ? 100
              : current.score,
          notes: current?.notes || "",
        };
      });

      await supabase
        .from("assessment_points")
        .delete()
        .eq("student_id", selectedStudent.id)
        .eq("rombel_id", parseInt(selectedRombel))
        .eq("week_number", weekNumber);

      const { error: insertError } = await supabase
        .from("assessment_points")
        .insert(upsertData);

      if (insertError) throw insertError;
      setSuccess(
        `Penilaian akhir pekan untuk ${selectedStudent.name} berhasil disimpan!`,
      );

      // Auto return to student list after saving
      setTimeout(() => {
        setSuccess(null);
        setStep(3);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  // Navigasi Step
  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <button
          onClick={() => setStep(1)}
          className={`hover:text-emerald-600 transition-colors ${step >= 1 ? "text-emerald-600" : ""}`}
        >
          Pilih Kelas
        </button>
        {step >= 2 && selectedLevel && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <button
              onClick={() => setStep(2)}
              className={`hover:text-emerald-600 transition-colors ${step >= 2 ? "text-emerald-600" : ""}`}
            >
              Kelas {selectedLevel}
            </button>
          </>
        )}
        {step >= 3 && selectedRombel && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <button
              onClick={() => setStep(3)}
              className={`hover:text-emerald-600 transition-colors ${step >= 3 ? "text-emerald-600" : ""}`}
            >
              {activeRombelName}
            </button>
          </>
        )}
        {step === 4 && selectedStudent && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-800">{selectedStudent.name}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Tombol Navigasi Dinamis */}
        {step === 1 ? (
          <Link
            href="/teacher"
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </Link>
        ) : (
          <button
            onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        )}

        {/* Header Portal Guru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
              Portal Wali Kelas (Evaluasi Akhir Pekan)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Input Penilaian Siswa
            </h1>
            <p className="text-sm text-slate-500">
              Sistem penilaian terstruktur step-by-step.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push("/parent")}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Portal Orang Tua</span>
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.clear();
                window.location.href = "/guru";
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-sm text-emerald-700 rounded-r-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {renderBreadcrumbs()}

        {/* ================= STEP 1: PILIH KELAS ================= */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Langkah 1: Pilih Tingkat Kelas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uniqueLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setSelectedLevel(level);
                    setStep(2);
                  }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-emerald-700 text-lg">
                    Kelas {level}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 2: PILIH ROMBEL ================= */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Langkah 2: Pilih Rombongan Belajar (Rombel)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredRombels.map((rombel) => (
                <button
                  key={rombel.id}
                  onClick={() => {
                    setSelectedRombel(rombel.id.toString());
                    setStep(3);
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between group text-left"
                >
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700">
                      {rombel.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Kelas {rombel.level}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 3: PILIH MINGGU & SISWA ================= */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-800">
                  Langkah 3: Pilih Siswa ({activeRombelName})
                </h2>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-2 px-4 rounded-xl border border-slate-200">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Pilih Minggu Evaluasi
                  </span>
                  <select
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                    className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Minggu {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500">
                Memuat data siswa...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Belum ada siswa di rombel ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {students.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStudent(st);
                      setStep(4);
                    }}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-start gap-3 text-left group"
                  >
                    <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors">
                      <UserCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-emerald-700">
                        {st.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        NISN: {st.nisn}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: FORM INPUT NILAI ================= */}
        {step === 4 && selectedStudent && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Evaluasi Siswa • Minggu Ke-{weekNumber}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {selectedStudent.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  NISN: {selectedStudent.nisn} • {activeRombelName}
                </p>
              </div>
              <button
                onClick={handleSaveStudent}
                disabled={saving}
                className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {saving ? "Menyimpan..." : "Simpan Penilaian"}
              </button>
            </div>

            <div className="space-y-8">
              {variables.map((variable) => {
                const catList = categories.filter(
                  (c) => c.variable_id === variable.id,
                );
                if (catList.length === 0) return null;

                return (
                  <div
                    key={variable.id}
                    className="border-2 border-slate-100 rounded-2xl p-4 sm:p-6 space-y-4 bg-slate-50/50"
                  >
                    <div className="border-b-2 border-emerald-500 pb-2 inline-block">
                      <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">
                        {variable.name}
                      </h3>
                    </div>

                    <div className="space-y-5 mt-4">
                      {catList.map((cat) => {
                        const indList = indicators.filter(
                          (i) => i.category_id === cat.id,
                        );
                        if (indList.length === 0) return null;

                        return (
                          <div
                            key={cat.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div className="flex items-center space-x-2">
                                <FolderOpen className="w-5 h-5 text-emerald-600" />
                                <h4 className="font-bold text-slate-800 uppercase text-sm tracking-wider">
                                  {cat.name}
                                </h4>
                              </div>
                              <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md">
                                {indList.length} Butir
                              </span>
                            </div>

                            <div className="space-y-3">
                              {indList.map((ind, iIdx) => {
                                const current = pointDetails[ind.id] || {
                                  score: 100,
                                  notes: "",
                                };
                                return (
                                  <div
                                    key={ind.id}
                                    className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3 hover:border-emerald-200 transition-colors"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex items-start space-x-3 pr-4">
                                        <span className="w-6 h-6 shrink-0 bg-white border border-slate-200 text-slate-700 rounded-md flex items-center justify-center text-xs font-bold mt-0.5">
                                          {iIdx + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800 leading-snug">
                                          {ind.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-3 shrink-0">
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          placeholder="100"
                                          value={current.score}
                                          onChange={(e) =>
                                            handleScoreChange(
                                              ind.id,
                                              e.target.value,
                                            )
                                          }
                                          className="w-20 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 bg-white focus:border-emerald-500 focus:ring-0 text-center transition-colors"
                                        />
                                        <span className="text-xs font-bold w-24 text-right">
                                          {current.score === "" ? (
                                            <span className="text-slate-400">
                                              -
                                            </span>
                                          ) : Number(current.score) >= 85 ? (
                                            <span className="text-emerald-600">
                                              Sangat Baik
                                            </span>
                                          ) : Number(current.score) >= 70 ? (
                                            <span className="text-blue-600">
                                              Baik
                                            </span>
                                          ) : (
                                            <span className="text-amber-600">
                                              Bimbingan
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="relative mt-2">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <MessageSquare className="w-4 h-4" />
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Ketik catatan atau alasan pengurangan nilai jika ada..."
                                        value={current.notes}
                                        onChange={(e) =>
                                          handleNoteChange(
                                            ind.id,
                                            e.target.value,
                                          )
                                        }
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:border-emerald-500 focus:ring-0 transition-colors"
                                      />
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
    </div>
  );
}
