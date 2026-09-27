"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  Filter,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

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

type Indicator = {
  id: number;
  name: string;
  category_id: string;
};

type PointData = {
  score: number | ""; // Mengizinkan string kosong untuk input awal
  notes: string;
};

export default function AssessmentInputPage() {
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [selectedRombel, setSelectedRombel] = useState<string>("");
  const [weekNumber, setWeekNumber] = useState<number>(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [pointDetails, setPointDetails] = useState<Record<string, PointData>>(
    {},
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchRombels = async () => {
      const { data } = await supabase
        .from("rombels")
        .select("*")
        .order("level");
      if (data && data.length > 0) {
        setRombels(data);
        setSelectedRombel(data[0].id.toString());
      }
    };
    fetchRombels();
  }, []);

  useEffect(() => {
    if (!selectedRombel) return;

    const fetchDataByRombel = async () => {
      setLoading(true);
      setError(null);

      // 1. Ambil siswa
      const { data: studentData } = await supabase
        .from("students")
        .select("id, name, nisn")
        .eq("rombel_id", parseInt(selectedRombel))
        .order("name");

      setStudents(studentData || []);

      // 2. Ambil indikator
      const { data: indData } = await supabase
        .from("assessment_indicators")
        .select("*");

      setIndicators(indData || []);

      // 3. Ambil nilai & catatan tersimpan
      const { data: existingScores } = await supabase
        .from("assessment_points")
        .select("student_id, indicator_id, score, notes")
        .eq("rombel_id", parseInt(selectedRombel))
        .eq("week_number", weekNumber);

      const detailsMap: Record<string, PointData> = {};
      if (existingScores) {
        existingScores.forEach((item) => {
          detailsMap[`${item.student_id}-${item.indicator_id}`] = {
            score: item.score ?? 0,
            notes: item.notes ?? "",
          };
        });
      }
      setPointDetails(detailsMap);
      setLoading(false);
    };

    fetchDataByRombel();
  }, [selectedRombel, weekNumber]);

  // Ubah nilai skor angka
  const handleScoreChange = (
    studentId: string,
    indicatorId: number,
    val: string,
  ) => {
    if (val === "") {
      setPointDetails((prev) => ({
        ...prev,
        [`${studentId}-${indicatorId}`]: {
          score: "",
          notes: prev[`${studentId}-${indicatorId}`]?.notes || "",
        },
      }));
      return;
    }

    const numVal = parseInt(val);
    const cleanVal = Math.max(0, Math.min(100, isNaN(numVal) ? 0 : numVal));
    setPointDetails((prev) => ({
      ...prev,
      [`${studentId}-${indicatorId}`]: {
        score: cleanVal,
        notes: prev[`${studentId}-${indicatorId}`]?.notes || "",
      },
    }));
  };

  // Ubah catatan deskripsi kualitatif
  const handleNoteChange = (
    studentId: string,
    indicatorId: number,
    text: string,
  ) => {
    setPointDetails((prev) => ({
      ...prev,
      [`${studentId}-${indicatorId}`]: {
        score: prev[`${studentId}-${indicatorId}`]?.score ?? "",
        notes: text,
      },
    }));
  };

  // Simpan ke database
  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const upsertData: any[] = [];

      students.forEach((student) => {
        indicators.forEach((indicator) => {
          const key = `${student.id}-${indicator.id}`;
          const current = pointDetails[key];

          upsertData.push({
            student_id: student.id,
            indicator_id: indicator.id,
            rombel_id: parseInt(selectedRombel),
            week_number: weekNumber,
            score:
              current?.score === "" || current?.score === undefined
                ? 0
                : current.score,
            notes: current?.notes || "",
          });
        });
      });

      // Hapus data minggu ini untuk rombel ini, lalu insert data baru
      await supabase
        .from("assessment_points")
        .delete()
        .eq("rombel_id", parseInt(selectedRombel))
        .eq("week_number", weekNumber);

      const { error: insertError } = await supabase
        .from("assessment_points")
        .insert(upsertData);

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(
          "Penilaian dan catatan mingguan berhasil disimpan secara lengkap!",
        );
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Input Nilai & Catatan Mingguan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Berikan nilai angka (1-100) beserta deskripsi/alasan penilaian
            siswa.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
          <ClipboardCheck className="w-6 h-6" />
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

      {/* Filter Kontrol & Panduan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center space-y-3 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                Pilih Rombel:
              </span>
              <select
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
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
                Minggu Ke-:
              </span>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
                  (w) => (
                    <option key={w} value={w}>
                      Minggu {w}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            * Data bersifat spesifik per minggu dan direset otomatis untuk
            minggu baru. Wali kelas dapat mengisi atau merevisi kapan saja
            secara fleksibel.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
          <div className="font-bold text-slate-800 flex items-center space-x-1">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Panduan Rentang Nilai:</span>
          </div>
          <p>
            • <b>85 - 100</b>: Sangat Baik / Mandiri
          </p>
          <p>
            • <b>70 - 84</b>: Baik / Perlu Sedikit Bimbingan
          </p>
          <p>
            • <b>&lt; 70</b>: Perlu Perhatian Khusus / Bimbingan
          </p>
        </div>
      </div>

      {/* Tabel Penilaian dengan Catatan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Memuat data siswa dan indikator...
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Belum ada siswa di rombel ini. Silakan tambahkan data siswa terlebih
            dahulu.
          </div>
        ) : indicators.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Belum ada indikator penilaian. Silakan buat indikator di menu
            Variabel & Indikator.
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-4">Nama Siswa</th>
                    {indicators.map((ind, idx) => (
                      <th
                        key={ind.id}
                        className="p-4 min-w-[220px]"
                        title={ind.name}
                      >
                        <div className="font-bold text-slate-800">
                          Indikator {idx + 1}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal normal-case mt-0.5">
                          {ind.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-900 whitespace-nowrap align-top">
                        {student.name}
                        <div className="text-xs text-slate-400 font-normal">
                          NISN: {student.nisn}
                        </div>
                      </td>
                      {indicators.map((indicator) => {
                        const key = `${student.id}-${indicator.id}`;
                        const currentData = pointDetails[key] || {
                          score: "",
                          notes: "",
                        };
                        return (
                          <td
                            key={indicator.id}
                            className="p-4 align-top space-y-2 border-l border-slate-100"
                          >
                            {/* Input Nilai Angka */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="0"
                                value={currentData.score}
                                onChange={(e) =>
                                  handleScoreChange(
                                    student.id,
                                    indicator.id,
                                    e.target.value,
                                  )
                                }
                                className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center"
                              />
                              <span className="text-xs font-medium">
                                {currentData.score === "" ||
                                currentData.score === 0 ? (
                                  <span className="text-slate-400">-</span>
                                ) : Number(currentData.score) >= 85 ? (
                                  <span className="text-emerald-600">
                                    Sangat Baik
                                  </span>
                                ) : Number(currentData.score) >= 70 ? (
                                  <span className="text-blue-600">Baik</span>
                                ) : (
                                  <span className="text-amber-600">
                                    Perlu Bimbingan
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Input Catatan / Alasan Mengapa Nilai Segini */}
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>
                              <input
                                type="text"
                                placeholder="Tulis alasan/catatan nilai..."
                                value={currentData.notes}
                                onChange={(e) =>
                                  handleNoteChange(
                                    student.id,
                                    indicator.id,
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-7 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                * Pastikan menekan tombol simpan agar nilai dan catatan
                kualitatif tersimpan ke database.
              </span>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Semua Nilai & Catatan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
