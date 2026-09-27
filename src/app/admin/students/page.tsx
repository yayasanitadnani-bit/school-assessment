"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  GraduationCap,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Search, // <-- Tambahan ikon pencarian
} from "lucide-react";

type Student = {
  id: string;
  nisn: string;
  name: string;
  gender: string;
  rombel_id: string;
  rombels?: {
    name: string;
    level: number;
  };
};

type Rombel = {
  id: string;
  name: string;
  level: number;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk form tambah siswa
  const [nisn, setNisn] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("L");
  const [selectedRombel, setSelectedRombel] = useState("");

  // State untuk pencarian dan notifikasi
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Ambil data rombel untuk pilihan form
    const { data: rombelData, error: rombelError } = await supabase
      .from("rombels")
      .select("*")
      .order("level", { ascending: true });
    if (rombelError) {
      setError(rombelError.message);
      setLoading(false);
      return;
    }
    setRombels(rombelData || []);
    if (rombelData && rombelData.length > 0 && !selectedRombel) {
      setSelectedRombel(rombelData[0].id);
    }

    // 2. Ambil data siswa
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (studentError) {
      setError(studentError.message);
    } else {
      const formattedStudents = (studentData || []).map((s) => {
        const r = rombelData?.find((item) => item.id === s.rombel_id);
        return {
          ...s,
          name: s.name,
          rombels: r ? { name: r.name, level: r.level } : undefined,
        };
      });
      setStudents(formattedStudents);
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

    if (!selectedRombel) {
      setError("Silakan pilih rombel terlebih dahulu.");
      return;
    }

    const { error: insertError } = await supabase.from("students").insert([
      {
        nisn,
        name: fullName,
        gender,
        rombel_id: parseInt(selectedRombel),
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Data siswa berhasil ditambahkan.");
      setNisn("");
      setFullName("");
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) return;

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setSuccess("Data siswa berhasil dihapus.");
      fetchData();
    }
  };

  // 👇 Fungsi untuk menyaring data siswa berdasarkan kolom pencarian
  const filteredStudents = students.filter(
    (student) =>
      (student.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nisn || "").includes(searchQuery),
  );
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Data Induk Siswa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data siswa dan penempatan rombel.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
          <GraduationCap className="w-6 h-6" />
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
        {/* Form Tambah Siswa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Tambah Siswa Baru
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                NISN
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 0123456789"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Ahmad Fauzi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rombel / Kelas
              </label>
              <select
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {rombels.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (Kelas {r.level})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Siswa</span>
            </button>
          </form>
        </div>

        {/* Daftar Siswa */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          {/* Header dan Kolom Pencarian */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Daftar Seluruh Siswa
              <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredStudents.length} Siswa
              </span>
            </h3>

            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-center text-slate-500 py-6">
              Memuat data...
            </p>
          ) : students.length === 0 ? (
            <p className="text-sm text-center text-slate-500 py-6">
              Belum ada data siswa terdaftar.
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="text-sm text-center text-slate-500 py-6 border border-dashed border-slate-200 rounded-xl">
              Tidak ada siswa yang cocok dengan pencarian "{searchQuery}".
            </p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
              {filteredStudents.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        NISN: {item.nisn}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {item.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </div>
                    {item.rombels && (
                      <p className="text-xs text-slate-500">
                        Rombel: {item.rombels.name} (Kelas {item.rombels.level})
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
