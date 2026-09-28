import { createClient } from "@/lib/supabase-server";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Calendar,
  Layers,
} from "lucide-react";
// Sesuaikan import ini dengan lokasi file TeacherLock.tsx yang Anda buat
import TeacherLock from "@/components/TeacherLock";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Mengambil ringkasan data dari database
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });
  const { count: teacherCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "guru");
  const { count: rombelCount } = await supabase
    .from("rombels")
    .select("*", { count: "exact", head: true });

  // Ambil tahun ajaran aktif
  const { data: activeYear } = await supabase
    .from("academic_years")
    .select("name")
    .eq("is_active", true)
    .single();

  // Ambil status pengunci login wali kelas
  const { data: settings } = await supabase
    .from("app_settings")
    .select("is_teacher_locked")
    .eq("id", 1)
    .single();

  const isLocked = settings?.is_teacher_locked ?? true;

  const stats = [
    {
      name: "Total Siswa",
      value: studentCount || 0,
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "Total Guru",
      value: teacherCount || 0,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "Jumlah Rombel",
      value: rombelCount || 0,
      icon: Layers,
      color: "bg-amber-50 text-amber-600",
    },
    {
      name: "Tahun Ajaran Aktif",
      value: activeYear?.name || "Belum diatur",
      icon: Calendar,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Selamat Datang */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Administrator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Selamat datang kembali di pusat pengelolaan sistem penilaian
            sekolah.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Akses Super Admin</span>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4"
            >
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.name}
                </p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                  {stat.value}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Komponen Pengunci Login Wali Kelas */}
      <TeacherLock initialLocked={isLocked} />

      {/* Informasi / Panduan Singkat */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Langkah Pengelolaan Sistem
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Gunakan menu navigasi di sebelah kiri (atau menu bar di atas untuk
          versi seluler) untuk mengelola data master sekolah, mulai dari tahun
          ajaran, tingkat kelas, rombongan belajar, data guru, hingga struktur
          indikator penilaian mingguan siswa.
        </p>
      </div>
    </div>
  );
}
