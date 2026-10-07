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
  BookMarked,
  UserPlus,
  X,
  Eye,
  Award,
  Plus,
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

type ScoreItem = {
  indicator_id: number;
  week_number: number;
  score: number;
  notes: string;
  subject_name: string;
};

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

export default function TeacherAssessmentPage() {
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

  const [activeSubject, setActiveSubject] = useState<string>(SUBJECTS[0]);
  const [pointDetails, setPointDetails] = useState<
    Record<string, Record<number, PointData>>
  >({});

  // State Modal Tambah Siswa
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNisn, setNewStudentNisn] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  // State Modal Preview Rapor Guru
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewScores, setPreviewScores] = useState<ScoreItem[]>([]);
  const [previewActiveSubject, setPreviewActiveSubject] = useState<string>(
    SUBJECTS[0],
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // Ambil data awal
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

  const fetchStudentsList = async (rombelIdStr: string) => {
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, name, nisn")
      .eq("rombel_id", parseInt(rombelIdStr))
      .order("name");

    if (studentError) {
      setError(studentError.message);
    } else {
      setStudents(studentData || []);
    }
  };

  useEffect(() => {
    if (!selectedRombel) return;

    const fetchRombelData = async () => {
      setLoading(true);
      setError(null);

      await fetchStudentsList(selectedRombel);

      const { data: activeAY } = await supabase
        .from("academic_years")
        .select("semester, name")
        .eq("is_active", true)
        .single();

      let semesterStartDate = new Date("2026-07-13");
      if (activeAY) {
        const startYear = parseInt(activeAY.name.split("/")[0]);
        if (activeAY.semester.toLowerCase().includes("genap")) {
          semesterStartDate = new Date(`${startYear + 1}-01-04`);
        } else {
          semesterStartDate = new Date(`${startYear}-07-13`);
        }
      }

      const today = new Date();
      const diffTime = today.getTime() - semesterStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let autoWeek = Math.floor(diffDays / 7) + 1;
      if (autoWeek < 1) autoWeek = 1;
      if (autoWeek > 24) autoWeek = 24;

      const { data: rombelData } = await supabase
        .from("rombels")
        .select("active_week")
        .eq("id", parseInt(selectedRombel))
        .single();

      if (
        rombelData &&
        rombelData.active_week &&
        rombelData.active_week !== 1
      ) {
        setWeekNumber(rombelData.active_week);
      } else {
        setWeekNumber(autoWeek);
      }

      setLoading(false);
    };

    fetchRombelData();
  }, [selectedRombel]);

  const handleAddNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedRombel) return;

    setAddingStudent(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("students").insert([
        {
          name: newStudentName.trim(),
          nisn: newStudentNisn.trim() || "-",
          rombel_id: parseInt(selectedRombel),
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(`Siswa ${newStudentName} berhasil ditambahkan!`);
      setNewStudentName("");
      setNewStudentNisn("");
      setIsAddStudentOpen(false);

      await fetchStudentsList(selectedRombel);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan siswa.");
    } finally {
      setAddingStudent(false);
    }
  };

  // Fungsi Tambah UH Baru Secara Dinamis
  const handleAddUHIndicator = async (categoryId: number) => {
    const catIndicators = indicators.filter(
      (i) => i.category_id === categoryId,
    );
    const nextUHNum = catIndicators.length + 1;
    const newIndName = `UH ${nextUHNum}`;

    const { data: inserted, error: insErr } = await supabase
      .from("assessment_indicators")
      .insert([{ name: newIndName, category_id: categoryId }])
      .select()
      .single();

    if (insErr) {
      setError(insErr.message);
      return;
    }

    if (inserted) {
      setIndicators((prev) => [...prev, inserted]);
      // Inisialisasi default 100 untuk indikator baru
      setPointDetails((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((sub) => {
          updated[sub] = {
            ...updated[sub],
            [inserted.id]: { score: 100, notes: "" },
          };
        });
        return updated;
      });
      setSuccess(`Berhasil menambah ${newIndName}!`);
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  useEffect(() => {
    if (!selectedRombel || !selectedStudent || indicators.length === 0) return;

    const fetchScores = async () => {
      const { data: existingScores } = await supabase
        .from("assessment_points")
        .select("indicator_id, subject_name, score, notes")
        .eq("rombel_id", parseInt(selectedRombel))
        .eq("student_id", selectedStudent.id)
        .eq("week_number", weekNumber);

      const detailsMap: Record<string, Record<number, PointData>> = {};
      detailsMap["Umum"] = {};
      SUBJECTS.forEach((sub) => {
        detailsMap[sub] = {};
      });

      categories.forEach((cat) => {
        const isTugasOrUH =
          cat.name.toUpperCase().includes("TUGAS") ||
          cat.name.toUpperCase().includes("UH");
        const catIndicators = indicators.filter(
          (i) => i.category_id === cat.id,
        );

        catIndicators.forEach((ind) => {
          if (isTugasOrUH) {
            SUBJECTS.forEach((sub) => {
              detailsMap[sub][ind.id] = { score: 100, notes: "" };
            });
          } else {
            detailsMap["Umum"][ind.id] = { score: 100, notes: "" };
          }
        });
      });

      if (existingScores) {
        existingScores.forEach((item) => {
          const sub = item.subject_name || "Umum";
          if (detailsMap[sub] && detailsMap[sub][item.indicator_id]) {
            detailsMap[sub][item.indicator_id] = {
              score: item.score ?? 100,
              notes: item.notes ?? "",
            };
          }
        });
      }
      setPointDetails(detailsMap);
    };

    fetchScores();
  }, [selectedStudent, weekNumber, indicators, categories]);

  const handleOpenPreview = async () => {
    if (!selectedStudent) return;
    const { data: scoreData } = await supabase
      .from("assessment_points")
      .select("indicator_id, week_number, score, notes, subject_name")
      .eq("student_id", selectedStudent.id);

    setPreviewScores(scoreData || []);
    setIsPreviewOpen(true);
  };

  const previewScoresForWeek = previewScores.filter(
    (s) => Number(s.week_number) === Number(weekNumber),
  );

  const getPreviewScoreInfo = (indicatorId: number, subjectName: string) => {
    const found = previewScoresForWeek.find(
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

  const getPreviewCategoryAverage = (catId: number) => {
    const indList = indicators.filter(
      (i) => Number(i.category_id) === Number(catId),
    );
    if (indList.length === 0) return 0;
    const indIds = indList.map((i) => Number(i.id));
    const relatedScores = previewScoresForWeek.filter((s) =>
      indIds.includes(Number(s.indicator_id)),
    );
    if (relatedScores.length === 0) return 0;
    const total = relatedScores.reduce((sum, s) => sum + Number(s.score), 0);
    return Math.round((total / relatedScores.length) * 10) / 10;
  };

  const getPreviewCategoryScoreByName = (nameKeyword: string) => {
    const matchedCat = categories.find(
      (c) => c.name.trim().toLowerCase() === nameKeyword.trim().toLowerCase(),
    );
    if (!matchedCat) return 0;
    return getPreviewCategoryAverage(Number(matchedCat.id));
  };

  const pUH =
    getPreviewCategoryScoreByName("UH") ||
    getPreviewCategoryScoreByName("Ulangan Harian");
  const pKehadiran =
    getPreviewCategoryScoreByName("Kehadiran") ||
    getPreviewCategoryScoreByName("Absensi");
  const pTugas = getPreviewCategoryScoreByName("Tugas");
  const pSikap = getPreviewCategoryScoreByName("Sikap");
  const pComponents = [pUH, pKehadiran, pTugas, pSikap].filter((s) => s > 0);
  const pWeeklyAvg =
    pComponents.length > 0
      ? Number(
          (pComponents.reduce((a, b) => a + b, 0) / pComponents.length).toFixed(
            1,
          ),
        )
      : 0;

  const handleScoreChange = (
    subject: string,
    indicatorId: number,
    val: string,
  ) => {
    setPointDetails((prev) => {
      const subjectData = prev[subject] || {};
      const currentInd = subjectData[indicatorId] || { score: 100, notes: "" };

      if (val === "") {
        return {
          ...prev,
          [subject]: {
            ...subjectData,
            [indicatorId]: { ...currentInd, score: "" },
          },
        };
      }

      const numVal = parseInt(val);
      const cleanVal = Math.max(0, Math.min(100, isNaN(numVal) ? 0 : numVal));
      return {
        ...prev,
        [subject]: {
          ...subjectData,
          [indicatorId]: { ...currentInd, score: cleanVal },
        },
      };
    });
  };

  const handleNoteChange = (
    subject: string,
    indicatorId: number,
    text: string,
  ) => {
    setPointDetails((prev) => {
      const subjectData = prev[subject] || {};
      const currentInd = subjectData[indicatorId] || { score: 100, notes: "" };
      return {
        ...prev,
        [subject]: {
          ...subjectData,
          [indicatorId]: { ...currentInd, notes: text },
        },
      };
    });
  };

  const handleSaveStudent = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const upsertData: any[] = [];

      categories.forEach((cat) => {
        const isTugasOrUH =
          cat.name.toUpperCase().includes("TUGAS") ||
          cat.name.toUpperCase().includes("UH");
        const catIndicators = indicators.filter(
          (i) => i.category_id === cat.id,
        );

        catIndicators.forEach((ind) => {
          if (isTugasOrUH) {
            SUBJECTS.forEach((sub) => {
              const current = pointDetails[sub]?.[ind.id];
              upsertData.push({
                student_id: selectedStudent.id,
                indicator_id: ind.id,
                rombel_id: parseInt(selectedRombel),
                week_number: weekNumber,
                subject_name: sub,
                score:
                  current?.score === "" || current?.score === undefined
                    ? 100
                    : current.score,
                notes: current?.notes || "",
              });
            });
          } else {
            const current = pointDetails["Umum"]?.[ind.id];
            upsertData.push({
              student_id: selectedStudent.id,
              indicator_id: ind.id,
              rombel_id: parseInt(selectedRombel),
              week_number: weekNumber,
              subject_name: "Umum",
              score:
                current?.score === "" || current?.score === undefined
                  ? 100
                  : current.score,
              notes: current?.notes || "",
            });
          }
        });
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

      setTimeout(() => {
        setSuccess(null);
        setStep(3);
        setActiveSubject(SUBJECTS[0]);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

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
              {rombels.find((r) => r.id.toString() === selectedRombel)?.name}
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

  const uniqueLevels = Array.from(new Set(rombels.map((r) => r.level))).sort(
    (a, b) => a - b,
  );
  const filteredRombels = rombels.filter((r) => r.level === selectedLevel);
  const activeRombelName =
    rombels.find((r) => r.id.toString() === selectedRombel)?.name || "";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
              Portal Wali Kelas (Evaluasi Akhir Pekan)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Input Penilaian Siswa
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push("/parent/rekap")}
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

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Langkah 1:
              Pilih Tingkat Kelas
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

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Langkah 2: Pilih
              Rombongan Belajar
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

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-800">
                  Langkah 3: Pilih Siswa ({activeRombelName})
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Siswa</span>
                </button>

                <div className="flex items-center space-x-3 bg-emerald-50 p-2 px-4 rounded-xl border border-emerald-200 shadow-sm">
                  <CalendarDays className="w-5 h-5 text-emerald-600" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Periode
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      Minggu {weekNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500">
                Memuat data siswa...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-slate-500">Belum ada siswa di rombel ini.</p>
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2 border border-emerald-200"
                >
                  <UserPlus className="w-4 h-4" /> Tambah Siswa Pertama
                </button>
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

        {/* MODAL TAMBAH SISWA */}
        {isAddStudentOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Tambah Siswa Baru
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddStudentOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Al Farizi"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Nomor NISN (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 31548821"
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-0"
                  />
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={addingStudent}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold"
                  >
                    {addingStudent ? "Menyimpan..." : "Simpan Siswa"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PREVIEW RAPOR */}
        {isPreviewOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                    Pratinjau Rapor Siswa
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Minggu Ke-{weekNumber} • {activeRombelName}
                  </p>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800">
                  Ringkasan Perkembangan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="text-2xl font-black text-slate-900">
                      {pUH || "-"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                      UH
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="text-2xl font-black text-slate-900">
                      {pKehadiran || "-"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                      Kehadiran
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="text-2xl font-black text-slate-900">
                      {pTugas || "-"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                      Tugas
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="text-2xl font-black text-slate-900">
                      {pSikap || "-"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                      Sikap
                    </span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 col-span-2 sm:col-span-1">
                    <span className="text-2xl font-black text-emerald-700">
                      {pWeeklyAvg || "-"}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900 block mt-0.5">
                      Rata-Rata
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Rincian Indikator
                  </h4>
                </div>

                <div className="space-y-4">
                  {variables.map((variable) => {
                    const catList = categories.filter(
                      (c) => Number(c.variable_id) === Number(variable.id),
                    );
                    if (catList.length === 0) return null;

                    return (
                      <div
                        key={variable.id}
                        className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50"
                      >
                        <h5 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-1.5">
                          {variable.name}
                        </h5>

                        <div className="space-y-3">
                          {catList.map((cat) => {
                            const indList = indicators.filter(
                              (i) => Number(i.category_id) === Number(cat.id),
                            );
                            if (indList.length === 0) return null;

                            const catAvg = getPreviewCategoryAverage(cat.id);
                            const isTugas = cat.name
                              .toUpperCase()
                              .includes("TUGAS");

                            return (
                              <div
                                key={cat.id}
                                className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3"
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <h6 className="font-bold text-slate-800 uppercase text-xs">
                                    {cat.name}
                                  </h6>
                                  <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                    Rata-rata: {catAvg || "-"}
                                  </span>
                                </div>

                                {isTugas && (
                                  <div className="space-y-1.5 pt-1">
                                    <label className="text-xs font-bold text-slate-700">
                                      Pilih Mapel Preview:
                                    </label>
                                    <select
                                      value={previewActiveSubject}
                                      onChange={(e) =>
                                        setPreviewActiveSubject(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
                                    >
                                      {Object.entries(SUBJECT_GROUPS).map(
                                        ([groupName, subjects]) => (
                                          <optgroup
                                            key={groupName}
                                            label={groupName}
                                          >
                                            {subjects.map((sub) => (
                                              <option key={sub} value={sub}>
                                                {sub}
                                              </option>
                                            ))}
                                          </optgroup>
                                        ),
                                      )}
                                    </select>
                                  </div>
                                )}

                                <div className="space-y-2 mt-2">
                                  {indList.map((ind, iIdx) => {
                                    const targetSub = isTugas
                                      ? previewActiveSubject
                                      : "Umum";
                                    const info = getPreviewScoreInfo(
                                      ind.id,
                                      targetSub,
                                    );

                                    return (
                                      <div
                                        key={ind.id}
                                        className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                                      >
                                        <span className="font-medium text-slate-800">
                                          {iIdx + 1}. {ind.name}
                                        </span>
                                        <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded border border-slate-200">
                                          Nilai:{" "}
                                          {info.score !== null
                                            ? info.score
                                            : "-"}
                                        </span>
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

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FORM INPUT NILAI */}
        {step === 4 && selectedStudent && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Evaluasi Siswa • Minggu Ke-{weekNumber}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {selectedStudent.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleOpenPreview}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Lihat Rapor Siswa
                </button>

                <button
                  onClick={handleSaveStudent}
                  disabled={saving}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />{" "}
                  {saving ? "Menyimpan..." : "Simpan Penilaian"}
                </button>
              </div>
            </div>

            <div className="space-y-8 pt-4">
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
                    <div className="border-b-2 border-emerald-500 pb-2 flex justify-between items-center">
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

                        const isTugas = cat.name
                          .toUpperCase()
                          .includes("TUGAS");
                        const isUH =
                          cat.name.toUpperCase().includes("UH") ||
                          cat.name.toUpperCase().includes("ULANGAN");

                        return (
                          <div
                            key={cat.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                              <div className="flex items-center space-x-2">
                                <FolderOpen className="w-5 h-5 text-emerald-600" />
                                <h4 className="font-bold text-slate-800 uppercase text-sm tracking-wider">
                                  {cat.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {isTugas && (
                                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                    Mapel Aktif: {activeSubject}
                                  </span>
                                )}
                                {/* TOMBOL TAMBAH UH KHUSUS DI KATEGORI UH */}
                                {isUH && (
                                  <button
                                    onClick={() => handleAddUHIndicator(cat.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Tambah UH
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* DROPDOWN MAPEL */}
                            {isTugas && (
                              <div className="space-y-2 pt-2 pb-2">
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

                            <div className="space-y-3">
                              {indList.map((ind, iIdx) => {
                                const targetSub = isTugas
                                  ? activeSubject
                                  : "Umum";
                                const current = pointDetails[targetSub]?.[
                                  ind.id
                                ] || { score: 100, notes: "" };

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
                                              targetSub,
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
                                        placeholder={`Ketik catatan untuk ${ind.name}${isTugas ? ` (${targetSub})` : ""}...`}
                                        value={current.notes}
                                        onChange={(e) =>
                                          handleNoteChange(
                                            targetSub,
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
