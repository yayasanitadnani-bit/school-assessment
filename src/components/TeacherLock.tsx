"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherLock({
  initialLocked,
}: {
  initialLocked: boolean;
}) {
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleLock = async () => {
    setLoading(true);
    const newStatus = !isLocked;

    // Update ke database
    await supabase
      .from("app_settings")
      .update({ is_teacher_locked: newStatus })
      .eq("id", 1);

    setIsLocked(newStatus);
    setLoading(false);
    router.refresh(); // Segarkan data di server
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-500">
          Akses Login Wali Kelas
        </h3>
        <p className="text-lg font-bold text-slate-800 mt-1">
          {isLocked ? "Terkunci (Hanya Sabtu-Minggu)" : "Terbuka (Bebas)"}
        </p>
      </div>
      <button
        onClick={toggleLock}
        disabled={loading}
        className={`p-3 rounded-xl flex items-center gap-2 text-white transition-colors disabled:opacity-50 ${
          isLocked
            ? "bg-red-500 hover:bg-red-600"
            : "bg-emerald-500 hover:bg-emerald-600"
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
