"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsAuthenticated(false);
        router.replace(`/guru?redirectTo=${encodeURIComponent(pathname)}`);
      } else {
        setIsAuthenticated(true);
      }
    };

    checkUser();
  }, [router, pathname, supabase]);

  // Selama status login masih dicek, tampilkan layar loading bersih (TIDAK ADA KEDIPAN HALAMAN)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Memeriksa Keamanan...
        </p>
      </div>
    );
  }

  // Jika belum login, jangan render apapun karena sedang proses redirect
  if (!isAuthenticated) {
    return null;
  }

  // Jika sudah login, tampilkan halaman aslinya secara mulus
  return <>{children}</>;
}
