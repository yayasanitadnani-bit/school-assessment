"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, School, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Autentikasi email dan password via Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) throw authError;

      // 2. Cek role user di tabel public.users berdasarkan EMAIL
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", email.trim().toLowerCase())
        .single();

      // Jika email belum ada di tabel users, kita tentukan otomatis
      let userRole = userData?.role;

      if (!userRole) {
        userRole =
          email.trim().toLowerCase() === "yayasanitadnani@gmail.com"
            ? "admin"
            : "teacher";
      }

      // --- MULAI FITUR KUNCI LOGIN WALI KELAS ---
      if (userRole === "teacher" || userRole === "guru") {
        const { data: settings } = await supabase
          .from("app_settings")
          .select("is_teacher_locked")
          .eq("id", 1)
          .single();

        const isLocked = settings?.is_teacher_locked ?? true;

        const currentDay = new Date().getDay();
        const isWeekend = currentDay === 0 || currentDay === 6;

        if (isLocked && !isWeekend) {
          await supabase.auth.signOut();
          throw new Error(
            "Akses ditolak: Login Wali Kelas hanya dibuka pada hari Sabtu dan Minggu.",
          );
        }
      }
      // --- AKHIR FITUR KUNCI ---

      // 3. Simpan sesi ke localStorage
      localStorage.setItem("user_role", userRole);
      localStorage.setItem("user_email", email.trim());

      // 4. Redirect berdasarkan role
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/teacher");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Soft Glows (Senada dengan Landing Page) */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-200/40 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-teal-200/40 blur-[150px] pointer-events-none rounded-full" />

      {/* Tombol Kembali ke Beranda */}
      <Link
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors z-20 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="relative z-10 max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        {/* Header Logo / Judul */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 shadow-sm">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Portal Edukasi
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            SD S 117 Islam Terpadu Adnani
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600 rounded-2xl flex items-start space-x-3">
            <span className="font-bold text-red-500 mt-0.5">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Login */}
        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Pengguna
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                placeholder="nama@sekolah.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Memverifikasi...
              </>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>
        </form>

        <div className="text-center text-xs font-medium text-slate-400 pt-6 border-t border-slate-100">
          Gunakan akun yang telah didaftarkan oleh Administrator sekolah.
        </div>
      </div>
    </div>
  );
}
