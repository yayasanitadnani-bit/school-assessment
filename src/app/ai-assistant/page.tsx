"use client";

import { Bot, Send, ArrowLeft, User, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function AiAssistantPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [
      {
        role: "assistant",
        content:
          "Halo, Bapak/Ibu Guru! Ada yang bisa saya bantu terkait evaluasi dan penilaian siswa hari ini?",
      },
    ],
  );
  const [isLoading, setIsLoading] = useState(false);

  // Ref untuk target auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Jalankan auto-scroll setiap kali pesan bertambah atau status loading berubah
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Tambahkan pertanyaan guru ke layar
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Mengirim pesan ke endpoint API chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      // Menampilkan balasan AI ke layar
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, gagal terhubung ke server AI." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden p-4 sm:p-8">
      {/* Background Soft Glows (Light Mode) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-200/40 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto w-full space-y-6 relative z-10 flex-1 flex flex-col">
        {/* Tombol Kembali & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-600 shadow-sm"
              title="Kembali ke halaman sebelumnya"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                  Cloud Intelligence
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 mt-1 tracking-tight">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                Asisten AI Guru
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 shadow-sm">
            <Cpu className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-medium">Ready for Evaluation Analysis</span>
          </div>
        </div>

        {/* Kotak Chat Utama (Clean & Professional Theme) */}
        <div className="bg-white border border-slate-200 rounded-3xl flex flex-col h-[600px] shadow-xl overflow-hidden flex-1">
          {/* Area Tampilan Pesan */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Ikon Profil */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-white border border-slate-200 text-emerald-600"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                {/* Balon Teks Chat */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl shadow-sm text-sm whitespace-pre-wrap max-w-[85%] sm:max-w-[75%] leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none font-medium shadow-emerald-600/20"
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Indikator Loading saat AI Mengetik */}
            {isLoading && (
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 bg-white border border-slate-200 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-200 text-sm text-slate-500 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                  <span className="text-xs text-slate-500 font-semibold ml-2">
                    AI sedang merumuskan jawaban...
                  </span>
                </div>
              </div>
            )}

            {/* Target Penanda Auto-Scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Kotak Ketik (Input Chat) */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Contoh: Bagaimana cara menilai siswa yang sering bolos?"
                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all shadow-inner"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Minimalis */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-8 text-center text-xs text-slate-400 font-medium">
        <p>
          &copy; 2026 SD S 117 Islam Terpadu Adnani. Powered by Advanced AI
          Engine.
        </p>
      </footer>
    </div>
  );
}
