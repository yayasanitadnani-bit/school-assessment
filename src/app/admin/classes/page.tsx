"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Layers, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";

type Rombel = {
  id: string;
  name: string;
  level: number;
  academic_year_id: string;
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
  const [name, setName] = useState("");
  const [level, setLevel] = useState("1");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
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

    // Set default ke tahun ajaran aktif jika ada
    const activeAY = ayData?.find((item) => item.is_active);
    if (activeAY && !selectedAcademicYear) {
      setSelectedAcademicYear(activeAY.id);
    }

    // 2. Ambil data rombel secara independen
    const { data: rombelData, error: rombelError } = await supabase
      .from("rombels")
      .select("*")
      .order("level", { ascending: true });

    if (rombelError) {
      setError(rombelError.message);
    } else {
      // Gabungkan data rombel dengan tahun ajaran secara manual untuk menghindari error relasi cache
      const formattedRombels = (rombelData || []).map((r) => {
        const ay = ayData?.find((a) => a.id === r.academic_year_id);
        return {
          ...r,
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
      setError(
        "Pilih tahun ajaran terlebih dahulu atau pastikan ada tahun ajaran yang aktif.",
      );
      return;
    }

    const { error: insertError } = await supabase.from("rombels").insert([
      {
        name,
        level: parseInt(level),
        academic_year_id: targetAY,
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
            Kelola tingkat kelas dan rombel siswa.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Rombel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Tambah Rombel Baru
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

        {/* Daftar Rombel dengan Kotak Scroll Sendiri */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Daftar Rombel & Kelas
          </h3>

          {loading ? (
            <p className="text-sm text-slate-500">Memuat data...</p>
          ) : rombels.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data rombel.</p>
          ) : (
            /* Di sinilah pembatasan tinggi dan scroll bar diterapkan */
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
              {rombels.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                        Tingkat Kelas {item.level}
                      </span>
                    </div>
                    {item.academic_years && (
                      <p className="text-xs text-slate-500">
                        Tahun Ajaran: {item.academic_years.name} (
                        {item.academic_years.semester})
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
