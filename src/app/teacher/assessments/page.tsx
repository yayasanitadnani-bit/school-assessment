"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  CheckCircle,
  AlertCircle,
  Filter,
  HelpCircle,
  MessageSquare,
  LogOut,
  ExternalLink,
  FolderOpen,
  User,
  ArrowLeft,
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
    const fetchInitialData = async () => {
      const { data: rombelData } = await supabase
        .from("rombels")
        .select("*")
        .order("level");
      if (rombelData && rombelData.length > 0) {
        setRombels(rombelData);
        setSelectedRombel(rombelData[0].id.toString());
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
      if (studentData && studentData.length > 0) {
        setSelectedStudent(studentData[0]);
      } else {
        setSelectedStudent(null);
      }
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
        detailsMap[ind.id] = {
          score: 100,
          notes: "",
        };
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

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(
          `Penilaian akhir pekan untuk ${selectedStudent.name} berhasil disimpan!`,
        );
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Tombol Kembali ke Dashboard Utama */}
        <Link
          href="/teacher"
          className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Menu Utama</span>
        </Link>

        {/* Header Portal Guru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
              Portal Wali Kelas (Evaluasi Akhir Pekan)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Input Penilaian & Pengurangan Nilai Siswa
            </h1>
            <p className="text-sm text-slate-500">
              Nilai otomatis diset 100 setiap awal pekan/Sabtu-Minggu. Guru
              tinggal mengurangi sesuai evaluasi.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push("/parent")}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Cek Portal Orang Tua</span>
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
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

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              Pilih Rombel:
            </span>
            <select
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
            >
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Kelas {r.level})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">
              Pekan / Minggu Ke-:
            </span>
            <select
              value={weekNumber}
              onChange={(e) => setWeekNumber(parseInt(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
            >
              {[
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20, 21, 22, 23, 24,
              ].map((w) => (
                <option key={w} value={w}>
                  Minggu {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Layout Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Kolom Kiri: Daftar Siswa */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 lg:col-span-1 h-fit">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Daftar Siswa ({students.length})</span>
            </h2>
            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Memuat siswa...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Tidak ada siswa.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {students.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all flex flex-col justify-between ${
                      selectedStudent?.id === st.id
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 border shadow-sm"
                        : "hover:bg-slate-50 text-slate-700 border border-transparent"
                    }`}
                  >
                    <span className="truncate font-semibold">{st.name}</span>
                    <span className="text-[11px] text-slate-400">
                      NISN: {st.nisn}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kolom Kanan: Form Kartu Penilaian Bertingkat */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 lg:col-span-3">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Info Siswa & Tombol Simpan */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase">
                      Evaluasi Siswa
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      NISN: {selectedStudent.nisn} | Minggu ke-{weekNumber}{" "}
                      (Default 100)
                    </p>
                  </div>
                  <button
                    onClick={handleSaveStudent}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Nilai Siswa Ini"}
                  </button>
                </div>

                {/* Looping Hierarki Aspek, Kategori, dan Indikator */}
                <div className="space-y-8">
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
                              (i) => i.category_id === cat.id,
                            );
                            if (indList.length === 0) return null;

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
                                  </div>
                                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded-md">
                                    {indList.length} indikator
                                  </span>
                                </div>

                                <div className="space-y-2.5">
                                  {indList.map((ind, iIdx) => {
                                    const current = pointDetails[ind.id] || {
                                      score: 100,
                                      notes: "",
                                    };
                                    return (
                                      <div
                                        key={ind.id}
                                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2.5"
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                          <div className="flex items-center space-x-3">
                                            <span className="w-6 h-6 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center text-xs font-bold">
                                              {iIdx + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">
                                              {ind.name}
                                            </span>
                                          </div>

                                          <div className="flex items-center space-x-2">
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
                                              className="w-20 px-3 py-1.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-center"
                                            />
                                            <span className="text-xs font-medium min-w-[100px]">
                                              {current.score === "" ? (
                                                <span className="text-slate-400">
                                                  -
                                                </span>
                                              ) : Number(current.score) >=
                                                85 ? (
                                                <span className="text-emerald-600 font-bold">
                                                  Sangat Baik
                                                </span>
                                              ) : Number(current.score) >=
                                                70 ? (
                                                <span className="text-blue-600 font-bold">
                                                  Baik
                                                </span>
                                              ) : (
                                                <span className="text-amber-600 font-bold">
                                                  Perlu Bimbingan
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                          </div>
                                          <input
                                            type="text"
                                            placeholder="Tulis alasan pengurangan nilai/catatan..."
                                            value={current.notes}
                                            onChange={(e) =>
                                              handleNoteChange(
                                                ind.id,
                                                e.target.value,
                                              )
                                            }
                                            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            ) : (
              <div className="text-center py-24 text-sm text-slate-400">
                Silakan pilih salah satu siswa dari daftar di sebelah kiri.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
