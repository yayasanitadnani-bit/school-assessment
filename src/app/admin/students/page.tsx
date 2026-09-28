"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  GripVertical,
} from "lucide-react";

type Student = {
  id: string;
  nisn: string;
  name: string;
  gender: string;
  rombel_id: string;
  sort_order?: number;
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

  // State untuk form tambah/edit siswa
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nisn, setNisn] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("L");
  const [selectedRombel, setSelectedRombel] = useState("");

  // State untuk filter daftar siswa dan pencarian
  const [filterRombelId, setFilterRombelId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State untuk melacak item yang sedang digeser (drag)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Ambil data rombel
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
      .order("sort_order", { ascending: true, nullsFirst: true })
      .order("name", { ascending: true });

    if (studentError) {
      setError(studentError.message);
    } else {
      const formattedStudents = (studentData || []).map((s, idx) => {
        const r = rombelData?.find(
          (item) => item.id.toString() === s.rombel_id?.toString(),
        );
        return {
          ...s,
          sort_order: s.sort_order ?? idx,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedRombel) {
      setError("Silakan pilih rombel terlebih dahulu.");
      return;
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("students")
        .update({
          nisn,
          name: fullName,
          gender,
          rombel_id: parseInt(selectedRombel),
        })
        .eq("id", editingId);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess("Data siswa berhasil diperbarui.");
        resetForm();
        fetchData();
      }
    } else {
      const currentRombelStudents = students.filter(
        (s) => s.rombel_id?.toString() === selectedRombel,
      );
      const nextOrder = currentRombelStudents.length;

      const { error: insertError } = await supabase.from("students").insert([
        {
          nisn,
          name: fullName,
          gender,
          rombel_id: parseInt(selectedRombel),
          sort_order: nextOrder,
        },
      ]);

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess("Data siswa berhasil ditambahkan.");
        resetForm();
        fetchData();
      }
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingId(student.id);
    setNisn(student.nisn);
    setFullName(student.name);
    setGender(student.gender);
    setSelectedRombel(student.rombel_id?.toString() || rombels[0]?.id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setNisn("");
    setFullName("");
    setGender("L");
    if (rombels.length > 0) setSelectedRombel(rombels[0].id);
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

  // 👇 Logika Drag and Drop dengan efek animasi perpindahan
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = () => {
    setOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const currentStudent = filteredStudents[draggedIndex];
    const targetStudent = filteredStudents[targetIndex];

    const updatedStudents = [...students];
    const origIndex1 = updatedStudents.findIndex(
      (s) => s.id === currentStudent.id,
    );
    const origIndex2 = updatedStudents.findIndex(
      (s) => s.id === targetStudent.id,
    );

    // Tukar nilai sort_order
    const tempOrder = updatedStudents[origIndex1].sort_order;
    updatedStudents[origIndex1].sort_order =
      updatedStudents[origIndex2].sort_order;
    updatedStudents[origIndex2].sort_order = tempOrder;

    // Tukar posisi di array utama
    const temp = updatedStudents[origIndex1];
    updatedStudents[origIndex1] = updatedStudents[origIndex2];
    updatedStudents[origIndex2] = temp;

    setStudents(updatedStudents);
    setDraggedIndex(null);

    // Simpan urutan baru ke database Supabase
    await supabase
      .from("students")
      .update({ sort_order: updatedStudents[origIndex1].sort_order })
      .eq("id", updatedStudents[origIndex1].id);

    await supabase
      .from("students")
      .update({ sort_order: updatedStudents[origIndex2].sort_order })
      .eq("id", updatedStudents[origIndex2].id);
  };

  // Filter siswa berdasarkan rombel dan pencarian
  const filteredStudents = students.filter((student) => {
    const matchesRombel =
      filterRombelId === "all" ||
      student.rombel_id?.toString() === filterRombelId;
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nisn || "").includes(searchQuery);
    return matchesRombel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Data Induk Siswa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data siswa, rombel, urutan absen, dan pembaruan data secara
            terstruktur.
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
        {/* Form Tambah / Edit Siswa */}
        <div
          className={`p-6 rounded-2xl border shadow-sm h-fit transition-all ${editingId ? "bg-amber-50/40 border-amber-300" : "bg-white border-slate-100"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}
            </h3>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
              >
                <X className="w-3.5 h-3.5" /> Batal
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
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
                onChange={(e) => {
                  // Mengubah setiap huruf pertama di awal kata menjadi kapital secara otomatis
                  const formattedName = e.target.value.replace(/\b\w/g, (l) =>
                    l.toUpperCase(),
                  );
                  setFullName(formattedName);
                }}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
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
              className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-white rounded-xl text-sm font-medium transition-colors shadow-sm ${
                editingId
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {editingId ? (
                <Edit2 className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{editingId ? "Perbarui Data Siswa" : "Simpan Siswa"}</span>
            </button>
          </form>
        </div>

        {/* Daftar Siswa dengan Animasi Geser (Drag and Drop) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daftar Siswa Per Rombel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tahan ikon pegangan, lalu geser kartu untuk melihat animasi
                perpindahan posisi secara langsung.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterRombelId}
                onChange={(e) => setFilterRombelId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">Semua Rombel ({students.length})</option>
                {rombels.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (Kelas {r.level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
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
              Tidak ada siswa yang ditemukan pada rombel/pencarian ini.
            </p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
              {filteredStudents.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-4 rounded-xl border bg-white flex items-center justify-between transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    draggedIndex === index
                      ? "opacity-30 scale-95 border-dashed border-emerald-500 bg-emerald-50"
                      : ""
                  } ${
                    overIndex === index && draggedIndex !== index
                      ? "border-t-2 border-t-emerald-600 -translate-y-1 shadow-md bg-emerald-50/40"
                      : ""
                  } ${
                    editingId === item.id
                      ? "border-amber-400 bg-amber-50/25 shadow-sm"
                      : "border-slate-200 hover:border-emerald-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-slate-400 hover:text-slate-600 cursor-grab">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {index + 1}
                        </span>
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
                        <p className="text-xs font-semibold text-emerald-600 ml-8">
                          Rombel: {item.rombels.name} (Kelas{" "}
                          {item.rombels.level})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Siswa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Siswa"
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
