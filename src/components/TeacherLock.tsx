"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Lock, Unlock, Loader2 } from "lucide-react";

export default function TeacherLock({
  initialLocked,
}: {
  initialLocked: boolean;
}) {
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const toggleLock = async () => {
    setLoading(true);
    const newStatus = !isLocked;

    // Ubah status di database Supabase
    const { error } = await supabase
      .from("app_settings")
      .update({ is_teacher_locked: newStatus })
      .eq("id", 1);

    if (error) {
      alert("Gagal mengubah status kunci: " + error.message);
      setLoading(false);
    } else {
      // Muat ulang halaman secara otomatis agar tampilan sinkron 100% dengan database
      window.location.reload();
    }
  };

  return (
    <div className="bg-white/45 backdrop-blur-[2px] p-6 rounded-2xl border border-white/40 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-600">
          Akses Login Wali Kelas
        </h3>
        <p className="text-lg font-bold text-slate-900 mt-1">
          {isLocked ? "Terkunci (Hanya Sabtu-Minggu)" : "Terbuka (Bebas)"}
        </p>
      </div>
      <button
        onClick={toggleLock}
        disabled={loading}
        className={`p-3 rounded-xl flex items-center gap-2 text-white font-bold transition-colors disabled:opacity-50 shadow-sm backdrop-blur-sm ${
          isLocked
            ? "bg-red-500 hover:bg-red-600"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isLocked ? (
          <Lock className="w-5 h-5" />
        ) : (
          <Unlock className="w-5 h-5" />
        )}
        {isLocked ? "Buka Akses" : "Kunci Akses"}
      </button>
    </div>
  );
}
