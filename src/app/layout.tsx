import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard"; // 👈 1. Import penjaganya di sini

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Penilaian Siswa SD",
  description: "Aplikasi penilaian dan pemantauan perkembangan siswa SD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* 👇 2. Kurung {children} dengan AuthGuard 👇 */}
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
