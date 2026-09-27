"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Calendar, Plus, CheckCircle, AlertCircle, Trash2 } from "lucide-react";

type AcademicYear = {
  id: string;
  name: string;
  semester: string;
  is_active: boolean;
};

export default function AcademicPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("Ganjil");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAcademicYears = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("academic_years")
      .select("*")
      .order("name", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setAcademicYears(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase
      .from("academic_years")
      .insert([{ name, semester, is_active: false }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Tahun ajaran berhasil ditambahkan.");
      setName("");
      fetchAcademicYears();
    }
  };

  const handleSetActive = async (id: string) => {
    setError(null);
    setSuccess(null);

    // Nonaktifkan semua terlebih dahulu
    await supabase
      .from("academic_years")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Aktifkan yang dipilih
    const { error: updateError } = await supabase
      .from("academic_years")
      .update({ is_active: true })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Tahun ajaran aktif berhasil diperbarui.");
      fetchAcademicYears();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tahun ajaran ini?")) return;

    const { error: deleteError } = await supabase
      .from("academic_years")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setSuccess("Tahun ajaran berhasil dihapus.");
      fetchAcademicYears();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tahun Ajaran & Semester
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola periode tahun akademik sekolah.
          </p>
        </div>
        <div className="bg-purple-50 text-purple-700 p-3 rounded-xl">
          <Calendar className="w-6 h-6" />
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
        {/* Form Tambah */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Tambah Tahun Ajaran
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Tahun Ajaran
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 2026/2027"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Tahun Ajaran</span>
            </button>
          </form>
        </div>

        {/* Daftar Tahun Ajaran */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Daftar Tahun Ajaran
          </h3>
          {loading ? (
            <p className="text-sm text-slate-500">Memuat data...</p>
          ) : academicYears.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada data tahun ajaran.
            </p>
          ) : (
            <div className="space-y-3">
              {academicYears.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    item.is_active
                      ? "border-emerald-500 bg-emerald-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        Semester {item.semester}
                      </span>
                      {item.is_active && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!item.is_active && (
                      <button
                        onClick={() => handleSetActive(item.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Jadikan Aktif
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
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
