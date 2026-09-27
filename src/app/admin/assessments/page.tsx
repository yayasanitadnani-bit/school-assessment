"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

type AssessmentVariable = {
  id: string;
  name: string;
  description: string;
};

type AssessmentCategory = {
  id: string;
  name: string;
  variable_id: string;
  assessment_variables?: { name: string };
};

type AssessmentIndicator = {
  id: string;
  name: string;
  category_id: string;
  assessment_categories?: { name: string };
};

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState<
    "variables" | "categories" | "indicators"
  >("variables");

  const [variables, setVariables] = useState<AssessmentVariable[]>([]);
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [indicators, setIndicators] = useState<AssessmentIndicator[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [varName, setVarName] = useState("");
  const [varDesc, setVarDesc] = useState("");

  const [catName, setCatName] = useState("");
  const [selectedVarId, setSelectedVarId] = useState("");

  const [indName, setIndName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Fetch Variables
    const { data: varData, error: varError } = await supabase
      .from("assessment_variables")
      .select("*")
      .order("name");
    if (varError) setError(varError.message);
    else {
      setVariables(varData || []);
      if (varData && varData.length > 0 && !selectedVarId)
        setSelectedVarId(varData[0].id);
    }

    // 2. Fetch Categories
    const { data: catData, error: catError } = await supabase
      .from("assessment_categories")
      .select("*")
      .order("name");
    if (catError) setError(catError.message);
    else {
      const formattedCats = (catData || []).map((c) => {
        const v = varData?.find((item) => item.id === c.variable_id);
        return { ...c, assessment_variables: v ? { name: v.name } : undefined };
      });
      setCategories(formattedCats);
      if (catData && catData.length > 0 && !selectedCatId)
        setSelectedCatId(catData[0].id);
    }

    // 3. Fetch Indicators
    const { data: indData, error: indError } = await supabase
      .from("assessment_indicators")
      .select("*")
      .order("name");
    if (indError) setError(indError.message);
    else {
      const formattedInds = (indData || []).map((i) => {
        const c = catData?.find((item) => item.id === i.category_id);
        return {
          ...i,
          assessment_categories: c ? { name: c.name } : undefined,
        };
      });
      setIndicators(formattedInds);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers Add
  const handleAddVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { error } = await supabase
      .from("assessment_variables")
      .insert([{ name: varName, description: varDesc }]);
    if (error) setError(error.message);
    else {
      setSuccess("Variabel berhasil ditambahkan.");
      setVarName("");
      setVarDesc("");
      fetchData();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedVarId) {
      setError("Pilih variabel induk terlebih dahulu.");
      return;
    }

    const { error } = await supabase
      .from("assessment_categories")
      .insert([{ name: catName, variable_id: selectedVarId }]);
    if (error) setError(error.message);
    else {
      setSuccess("Kategori berhasil ditambahkan.");
      setCatName("");
      fetchData();
    }
  };

  const handleAddIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedCatId) {
      setError("Pilih kategori induk terlebih dahulu.");
      return;
    }

    const { error } = await supabase
      .from("assessment_indicators")
      .insert([{ name: indName, category_id: selectedCatId }]);
    if (error) setError(error.message);
    else {
      setSuccess("Indikator berhasil ditambahkan.");
      setIndName("");
      fetchData();
    }
  };

  // Handlers Delete
  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(error.message);
    else {
      setSuccess("Data berhasil dihapus.");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Variabel & Indikator Penilaian
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola struktur hierarki penilaian mingguan siswa.
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl">
          <FileText className="w-6 h-6" />
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

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("variables")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "variables"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          1. Variabel Aspek ({variables.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "categories"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          2. Kategori ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("indicators")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "indicators"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          3. Indikator Poin ({indicators.length})
        </button>
      </div>

      {/* TAB 1: VARIABLES */}
      {activeTab === "variables" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Tambah Variabel Baru
            </h3>
            <form onSubmit={handleAddVariable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Variabel
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Keagamaan / Kedisiplinan"
                  value={varName}
                  onChange={(e) => setVarName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  placeholder="Keterangan singkat variabel..."
                  value={varDesc}
                  onChange={(e) => setVarDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Variabel</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Daftar Variabel Penilaian
            </h3>
            {loading ? (
              <p className="text-sm text-slate-500">Memuat data...</p>
            ) : variables.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada variabel terdaftar.
              </p>
            ) : (
              <div className="space-y-3">
                {variables.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleDelete("assessment_variables", item.id)
                      }
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Tambah Kategori Baru
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Induk Variabel
                </label>
                <select
                  value={selectedVarId}
                  onChange={(e) => setSelectedVarId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {variables.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sholat Berjamaah / Hafalan Surat Pendek"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Kategori</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Daftar Kategori Penilaian
            </h3>
            {loading ? (
              <p className="text-sm text-slate-500">Memuat data...</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada kategori terdaftar.
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">
                          {item.name}
                        </span>
                      </div>
                      {item.assessment_variables && (
                        <p className="text-xs text-indigo-600 font-medium mt-0.5 flex items-center space-x-1">
                          <span>
                            Variabel: {item.assessment_variables.name}
                          </span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleDelete("assessment_categories", item.id)
                      }
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INDICATORS */}
      {activeTab === "indicators" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Tambah Indikator Penilaian
            </h3>
            <form onSubmit={handleAddIndicator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Induk Kategori
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Indikator / Butir Penilaian
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Melaksanakan Sholat Dzuhur Tepat Waktu"
                  value={indName}
                  onChange={(e) => setIndName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Indikator</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Daftar Indikator / Butir Penilaian
            </h3>
            {loading ? (
              <p className="text-sm text-slate-500">Memuat data...</p>
            ) : indicators.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada indikator terdaftar.
              </p>
            ) : (
              <div className="space-y-3">
                {indicators.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{item.name}</h4>
                      {item.assessment_categories && (
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          Kategori: {item.assessment_categories.name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleDelete("assessment_indicators", item.id)
                      }
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
