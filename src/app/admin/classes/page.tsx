"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  Layers,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Copy,
} from "lucide-react";

type Rombel = {
  id: string;
  name: string;
  level: number;
  academic_year_id: string;
  active_week: number;
  academic_years?: {
    name: string;
    semester: string;
  };
};

type AcademicYear = {
  id: string;
  name: string;
  semester: string;
  is_active: boolean;
};

export default function ClassesPage() {
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("1");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [sourceAcademicYear, setSourceAcademicYear] = useState("");

  // State untuk input massal dan nilai murni kalender
  const [globalWeek, setGlobalWeek] = useState("");
  const [calculatedAutoWeek, setCalculatedAutoWeek] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Ambil data tahun ajaran
    const { data: ayData, error: ayError } = await supabase
      .from("academic_years")
      .select("*")
      .order("name", { ascending: false });
    if (ayError) {
      setError(ayError.message);
      setLoading(false);
      return;
    }
    setAcademicYears(ayData || []);

    const activeAY = ayData?.find((item) => item.is_active);
    if (activeAY && !selectedAcademicYear) {
      setSelectedAcademicYear(activeAY.id);
    }
    if (ayData && ayData.length > 0 && !sourceAcademicYear) {
      setSourceAcademicYear(ayData[0].id);
    }

    // --- RUMUS OTOMATIS FINAL (ANTI MELESET ZONA WAKTU) ---
    let autoWeek = 1;
    if (activeAY) {
      const startYear = parseInt(activeAY.name.split("/")[0]);

      // Menggunakan new Date(Tahun, BulanIndex, Tanggal) -> Index 6 adalah Juli
      let semesterStartDate = new Date(startYear, 6, 13);
      if (activeAY.semester.toLowerCase().includes("genap")) {
        // Index 0 adalah Januari
        semesterStartDate = new Date(startYear + 1, 0, 4);
      }

      const today = new Date();
      // Kunci kedua tanggal ke jam 00:00:00 agar hitungan murni hari
      today.setHours(0, 0, 0, 0);
      semesterStartDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - semesterStartDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Tambah 2 hari agar siklus jatuh pas hari Sabtu
      autoWeek = Math.floor((diffDays + 2) / 7) + 1;

      if (autoWeek < 1) autoWeek = 1;
      if (autoWeek > 24) autoWeek = 24;
    }

    // Simpan hitungan murni ke dalam state
    setCalculatedAutoWeek(autoWeek);
    setGlobalWeek(autoWeek.toString());
    // -------------------------------------------------------------

    // 2. Ambil data rombel
    const { data: rombelData, error: rombelError } = await supabase
      .from("rombels")
      .select("*")
      .order("level", { ascending: true });

    if (rombelError) {
      setError(rombelError.message);
    } else {
      const formattedRombels = (rombelData || []).map((r) => {
        const ay = ayData?.find((a) => a.id === r.academic_year_id);
        return {
          ...r,
          active_week: r.active_week ?? 1, // Tetap biarkan nilai aslinya apa adanya
          academic_years: ay
            ? { name: ay.name, semester: ay.semester }
            : undefined,
        };
      });
      setRombels(formattedRombels);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const targetAY =
      selectedAcademicYear || academicYears.find((y) => y.is_active)?.id;

    if (!targetAY) {
      setError("Pilih tahun ajaran terlebih dahulu.");
      return;
    }

    const { error: insertError } = await supabase.from("rombels").insert([
      {
        name,
        level: parseInt(level),
        academic_year_id: targetAY,
        active_week: 1, // Angka 1 artinya = IKUTI SISTEM OTOMATIS
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Rombel berhasil ditambahkan.");
      setName("");
      fetchData();
    }
  };

  const handleDuplicateRombels = async () => {
    if (!sourceAcademicYear || !selectedAcademicYear) {
      setError("Pilih semester sumber dan semester tujuan terlebih dahulu.");
      return;
    }

    if (sourceAcademicYear === selectedAcademicYear) {
      setError("Semester sumber dan tujuan tidak boleh sama.");
      return;
    }

    const sourceAYName = academicYears.find(
      (y) => y.id === sourceAcademicYear,
    )?.semester;
    const targetAYName = academicYears.find(
      (y) => y.id === selectedAcademicYear,
    )?.semester;

    if (
      !confirm(
        `Apakah Anda yakin ingin menyalin semua rombel dan data siswa dari Semester ${sourceAYName} ke Semester ${targetAYName}?`,
      )
    ) {
      return;
    }

    setDuplicating(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: sourceRombels, error: fetchRombelErr } = await supabase
        .from("rombels")
        .select("*")
        .eq("academic_year_id", sourceAcademicYear);

      if (fetchRombelErr) throw fetchRombelErr;
      if (!sourceRombels || sourceRombels.length === 0) {
        throw new Error(
          "Tidak ada rombel ditemukan pada semester sumber tersebut.",
        );
      }

      let copiedCount = 0;

      for (const oldRombel of sourceRombels) {
        const { data: existingTarget } = await supabase
          .from("rombels")
          .select("id")
          .eq("name", oldRombel.name)
          .eq("academic_year_id", selectedAcademicYear)
          .single();

        let newRombelId = existingTarget?.id;

        if (!newRombelId) {
          const { data: newRombelData, error: insRombelErr } = await supabase
            .from("rombels")
            .insert([
              {
                name: oldRombel.name,
                level: oldRombel.level,
                academic_year_id: selectedAcademicYear,
                active_week: 1,
              },
            ])
            .select("id")
            .single();

          if (insRombelErr) continue;
          newRombelId = newRombelData.id;
        }

        const { data: sourceStudents } = await supabase
          .from("students")
          .select("name, nisn")
          .eq("rombel_id", oldRombel.id);

        if (sourceStudents && sourceStudents.length > 0) {
          for (const student of sourceStudents) {
            const { data: existingStudent } = await supabase
              .from("students")
              .select("id")
              .eq("nisn", student.nisn)
              .eq("rombel_id", newRombelId)
              .single();

            if (!existingStudent) {
              await supabase.from("students").insert([
                {
                  name: student.name,
                  nisn: student.nisn,
                  rombel_id: newRombelId,
                },
              ]);
            }
          }
        }
        copiedCount++;
      }

      setSuccess(
        `Berhasil menyalin ${copiedCount} rombel beserta data siswanya ke semester aktif!`,
      );
      fetchData();
    } catch (err: any) {
      setError(err.message || "Gagal menyalin rombel.");
    } finally {
      setDuplicating(false);
    }
  };

  const handleUpdateActiveWeek = async (
    rombelId: string,
    absoluteWeek: number,
  ) => {
    const newWeek = Math.max(1, Math.min(24, absoluteWeek));
    const { error: updateError } = await supabase
      .from("rombels")
      .update({ active_week: newWeek })
      .eq("id", rombelId);

    if (updateError) {
      setError(updateError.message);
    } else {
      fetchData();
    }
  };

  const handleSetAllWeeks = async () => {
    if (!selectedAcademicYear) {
      setError("Pilih tahun ajaran terlebih dahulu.");
      return;
    }

    const targetWeek = parseInt(globalWeek);
    if (isNaN(targetWeek) || targetWeek < 1 || targetWeek > 24) {
      setError("Masukkan angka minggu yang valid (1-24).");
      return;
    }

    if (
      !confirm(
        `Yakin ingin menerapkan nilai ${targetWeek} ke SEMUA kelas? (Pilih angka 1 untuk mengembalikan kelas ke mode Otomatis)`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetRombels = rombels.filter(
        (r) => r.academic_year_id === selectedAcademicYear,
      );

      const updatePromises = targetRombels.map((r) =>
        supabase
          .from("rombels")
          .update({ active_week: targetWeek })
          .eq("id", r.id),
      );

      await Promise.all(updatePromises);

      setSuccess(`Berhasil! Semua kelas telah diperbarui.`);
      fetchData();
    } catch (err: any) {
      setError("Gagal memperbarui minggu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rombel ini?")) return;

    const { error: deleteError } = await supabase
      .from("rombels")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setSuccess("Rombel berhasil dihapus.");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kelas & Rombongan Belajar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola tingkat kelas, rombel siswa, dan migrasi antar semester.
          </p>
        </div>
        <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
          <Layers className="w-6 h-6" />
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

      <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-emerald-900">
          <Copy className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold">
            Salin Rombel & Siswa ke Semester Baru
          </h3>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Mau pindah semester? Anda tidak perlu input ulang dari awal. Pilih
          semester sumber (semester lalu) dan semester tujuan (semester aktif
          saat ini), lalu klik tombol salin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-emerald-900 mb-1">
              Dari Semester (Sumber):
            </label>
            <select
              value={sourceAcademicYear}
              onChange={(e) => setSourceAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs bg-white focus:outline-none"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} ({ay.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-900 mb-1">
              Ke Semester (Tujuan Aktif):
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs bg-white focus:outline-none"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} ({ay.semester}) {ay.is_active ? "- [Aktif]" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleDuplicateRombels}
              disabled={duplicating}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2 h-[38px]"
            >
              <Copy className="w-4 h-4" />
              <span>
                {duplicating ? "Menyalin..." : "Salin Semua Rombel & Siswa"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Tambah Rombel Manual
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Rombel
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 1 Al Munawar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tingkat Kelas
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {[1, 2, 3, 4, 5, 6].map((l) => (
                  <option key={l} value={l}>
                    Kelas {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tahun Ajaran
              </label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} ({ay.semester}) {ay.is_active ? "- [Aktif]" : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Rombel</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Daftar Rombel & Kontrol Minggu Aktif
            </h3>

            <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700 pl-2 hidden sm:inline">
                Set Semua Kelas ke:
              </span>
              <span className="text-xs font-bold text-slate-700 pl-2 sm:hidden">
                Minggu ke:
              </span>
              <input
                type="number"
                min={1}
                max={24}
                value={globalWeek}
                onChange={(e) => setGlobalWeek(e.target.value)}
                className="w-16 px-2 py-1.5 border-2 border-slate-200 rounded-lg text-sm text-center font-black text-emerald-700 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleSetAllWeeks}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Terapkan
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Memuat data...</p>
          ) : rombels.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data rombel.</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
              {rombels.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base">
                        {item.name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                        Kelas {item.level}
                      </span>
                    </div>
                    {item.academic_years && (
                      <p className="text-xs text-slate-500">
                        Tahun Ajaran: {item.academic_years.name} (
                        {item.academic_years.semester})
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">
                        Minggu:
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        // JIKA DI DB NILAINYA 1, TAMPILKAN ANGKA OTOMATIS (calculatedAutoWeek). JIKA BUKAN 1, TAMPILKAN NILAI ASLI.
                        value={
                          item.active_week === 1
                            ? calculatedAutoWeek
                            : item.active_week
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setRombels((prev) =>
                            prev.map((r) =>
                              r.id === item.id
                                ? {
                                    ...r,
                                    active_week: isNaN(val) ? ("" as any) : val,
                                  }
                                : r,
                            ),
                          );
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          handleUpdateActiveWeek(item.id, val);
                        }}
                        className="w-16 h-8 px-1 text-center border-2 border-slate-200 rounded-lg text-sm font-black text-emerald-700 bg-white focus:border-emerald-500 focus:ring-0 shadow-sm hide-arrows"
                      />
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Rombel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
