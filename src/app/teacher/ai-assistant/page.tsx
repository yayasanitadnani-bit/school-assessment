"use client";

import { Bot, Send, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AiAssistantPage() {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Tambahkan pertanyaan guru ke layar
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Mengirim pesan ke endpoint API yang baru saja kita buat
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
    <div className="max-w-4xl mx-auto space-y-6 p-4 pt-8">
      {/* Tombol Kembali & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <Link
          href="/teacher"
          className="w-fit p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-blue-600" /> Asisten AI Guru
          </h1>
          <p className="text-sm text-slate-500">
            Tanyakan apapun seputar penilaian dan evaluasi siswa.
          </p>
        </div>
      </div>

      {/* Kotak Chat Utama */}
      <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[600px] shadow-sm overflow-hidden">
        {/* Area Tampilan Pesan */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50 flex flex-col space-y-5">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Ikon Profil */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-emerald-100" : "bg-blue-100"}`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-600" />
                )}
              </div>

              {/* Balon Teks Chat */}
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm whitespace-pre-wrap max-w-[85%] sm:max-w-[75%] leading-relaxed
                ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indikator Loading saat AI Mengetik */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 text-sm text-slate-500 shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>

        {/* Kotak Ketik (Input Chat) */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: Bagaimana cara menilai siswa yang sering bolos?"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
