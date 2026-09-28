import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Lock,
  Sparkles,
  Cpu,
  Database,
  Layers,
  Zap,
  CheckCircle2,
  Bot,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Pattern (Modern Grid & Glows) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300/30 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-teal-200/40 blur-[150px] pointer-events-none rounded-full" />

      {/* Floating Navbar */}
      <div className="fixed top-0 inset-x-0 z-50 p-4 sm:p-6 flex justify-center">
        <header className="w-full max-w-6xl flex justify-between items-center bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-3xl px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-5 h-5 font-black" />
            </div>
            <div>
              <span className="block font-black text-slate-900 text-sm sm:text-base tracking-tight leading-none">
                SD S 117 IT Adnani
              </span>
            </div>
          </div>

          <Link
            href="/guru"
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all rounded-xl shadow-md flex items-center space-x-2 group"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal Guru</span>
            <span className="sm:hidden">Masuk</span>
          </Link>
        </header>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16 sm:pt-40 sm:pb-24 flex flex-col lg:flex-row items-center gap-16 lg:gap-8 w-full min-h-screen">
        {/* Left Column: Hero Text */}
        <div className="flex-1 space-y-8 text-center lg:text-left pt-10 lg:pt-0">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistem Akademik Pintar</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Evaluasi <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Terintegrasi
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
            Platform manajemen nilai bertingkat dan pemantauan perkembangan
            karakter anak didik secara presisi untuk lingkungan belajar modern
            yang lebih transparan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link
              href="/guru"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-3 group text-sm"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all text-sm flex items-center justify-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-emerald-500" />
              <span>Lihat Infrastruktur</span>
            </a>
          </div>

          <div className="pt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Data Real-time</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Aman & Enkripsi</span>
            </div>
          </div>
        </div>

        {/* Right Column: Decorative UI Mockups (Bento Style) */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
          <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square">
            {/* Center Main Card */}
            <div className="absolute inset-0 m-auto w-3/4 h-3/4 bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl p-6 flex flex-col justify-between z-20 hover:-translate-y-2 transition-transform duration-500">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="h-2 w-12 bg-emerald-100 rounded-full"></div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Performa Rombel
                  </h3>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-end space-x-2">
                  <span className="text-5xl font-black text-slate-900">89</span>
                  <span className="text-emerald-500 font-bold mb-1">+4.2%</span>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[89%] rounded-full relative">
                      <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    Rata-rata Nilai Semester Ini
                  </p>
                </div>
              </div>
            </div>

            {/* Top Right Floating Card */}
            <div
              className="absolute top-4 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-30 animate-bounce"
              style={{ animationDuration: "3s" }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Status
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    Sangat Baik
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Left Floating Card */}
            <div className="absolute bottom-8 left-[-5%] w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center border border-slate-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Siswa Terdaftar
                  </p>
                  <p className="text-base font-bold text-white tracking-wide">
                    640{" "}
                    <span className="text-xs text-emerald-400 font-normal">
                      Aktif
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section
        id="fitur"
        className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:py-20"
      >
        <div className="bg-white border border-slate-200 rounded-[3rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
            <h2 className="text-3xl font-black text-slate-900">
              Arsitektur Modular Terpadu
            </h2>
            <p className="text-slate-500 mt-4 text-sm">
              Dirancang dengan presisi untuk memenuhi standar administrasi
              pendidikan modern yang cepat, akurat, dan aman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition-colors group">
              <Zap className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Penilaian Instan
              </h3>
              <p className="text-sm text-slate-500">
                Sinkronisasi nilai seketika dari guru ke database pusat,
                menghilangkan redundansi input manual.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-teal-50 hover:border-teal-200 transition-colors group">
              <Layers className="w-8 h-8 text-teal-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Manajemen Rombel
              </h3>
              <p className="text-sm text-slate-500">
                Sistem hierarki kelas cerdas untuk pemetaan guru, siswa, dan
                mata pelajaran yang rapi.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-cyan-50 hover:border-cyan-200 transition-colors group">
              <Database className="w-8 h-8 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                Cloud Database
              </h3>
              <p className="text-sm text-slate-500">
                Infrastruktur Supabase berkinerja tinggi, menjamin data
                tersimpan aman dan dapat diakses kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 text-center text-xs text-slate-400 font-medium">
        <p>&copy; 2026 SD S 117 Islam Terpadu Adnani. Hak Cipta Dilindungi.</p>
      </footer>

      {/* Floating AI Assistant Button */}
      <Link
        href="/ai-assistant"
        className="fixed bottom-6 right-6 z-50 group flex items-center space-x-3 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl shadow-slate-900/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-slate-700"
        title="Tanya Asisten AI"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="w-6 h-6 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
        </div>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[120px] transition-all duration-500 ease-in-out font-bold text-xs uppercase tracking-wider text-emerald-400">
          Asisten AI
        </span>
      </Link>
    </div>
  );
}
