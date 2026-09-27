"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, School } from "lucide-react";

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

      // 2. Cek role user di tabel public.users berdasarkan EMAIL (lebih aman & pasti ketemu)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", email.trim().toLowerCase())
        .single();

      // Jika email belum ada di tabel users, kita tentukan otomatis berdasarkan email-nya
      let userRole = userData?.role;

      if (!userRole) {
        // Fallback cerdas jika belum terdaftar di tabel users
        userRole =
          email.trim().toLowerCase() === "yayasanitadnani@gmail.com"
            ? "admin"
            : "teacher";
      }

      // 3. Simpan sesi ke localStorage untuk referensi aplikasi
      localStorage.setItem("user_role", userRole);
      localStorage.setItem("user_email", email.trim());

      // 4. Redirect berdasarkan role
      if (userRole === "admin") {
        router.push("/admin/academic");
      } else {
        router.push("/teacher/assessments");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
        {/* Header Logo / Judul */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sistem Penilaian Siswa SD
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Masuk menggunakan akun Admin atau Wali Kelas
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-r-lg">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                placeholder="nama@sekolah.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Memproses...
              </>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
          Gunakan akun yang telah didaftarkan oleh Administrator sekolah.
        </div>
      </div>
    </div>
  );
}
