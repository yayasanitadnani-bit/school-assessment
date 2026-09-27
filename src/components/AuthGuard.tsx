"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      // Izinkan akses ke halaman login
      if (pathname === "/login" || pathname === "/") {
        setIsChecking(false);
        return;
      }

      // Cek sesi login di Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // TENDANGAN PAKSA (Hard Redirect)
        window.location.replace("/login");
      } else {
        setIsChecking(false);
      }
    };

    checkUser();
  }, [pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-bold text-slate-500 animate-pulse">
          Memeriksa keamanan akses...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
