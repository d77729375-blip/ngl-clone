"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const placeholders = [
  "Sonra mı?",
  "Bana bir şey sor...",
  "Ne düşünüyorsun?",
  "Söylemek istediğin bir şey var mı?",
  "Anonim mesajını yaz...",
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Generate random click count only on client side to avoid hydration mismatch
  useEffect(() => {
    setClickCount(Math.floor(Math.random() * 500) + 100);
    setMounted(true);
  }, []);

  const randomizePlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * placeholders.length);
    setPlaceholder(placeholders[randomIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (res.ok) {
        setSent(true);
        setMessage("");
        setTimeout(() => setSent(false), 3000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen ngl-gradient flex flex-col items-center justify-between px-4 py-8">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        <form onSubmit={handleSubmit} className="w-full">
          {/* Message Card */}
          <div className="message-card rounded-3xl p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://ext.same-assets.com/4212318113/1366649759.png"
                alt="Avatar"
                className="w-12 h-12 rounded-full bg-gray-200"
              />
              <div>
                <div className="font-bold text-gray-800">@cikti15cent</div>
                <div className="text-sm text-gray-600">
                  bana anonim olarak mesajlar gönder!
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                className="w-full h-32 bg-transparent text-gray-700 text-lg placeholder-gray-400 resize-none focus:outline-none"
                maxLength={500}
              />
              <button
                type="button"
                onClick={randomizePlaceholder}
                className="absolute bottom-2 right-2 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-xl hover:bg-white/70 transition-colors"
              >
                🎲
              </button>
            </div>
          </div>

          {/* Anonymous Badge */}
          <div className="text-center text-white/90 text-sm mt-3 flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>anonim soru ve cevap</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className={`w-full mt-4 py-4 rounded-full font-bold text-lg transition-all ${
              message.trim()
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-900/50 text-white/50 cursor-not-allowed"
            }`}
          >
            {sending ? "Gönderiliyor..." : sent ? "✓ Gönderildi!" : "Gönder!"}
          </button>
        </form>
      </div>

      {/* Bottom Section */}
      <div className="w-full max-w-md mx-auto mt-8">
        <p className="text-center text-white font-semibold mb-3">
          👇 <span>{mounted ? clickCount : "..."}</span> arkadaşlar az önce bastı👇
        </p>
        <button className="w-full bg-gray-900 text-white py-4 rounded-full font-bold text-lg pulse-animation hover:bg-gray-800 transition-colors">
          Kendi mesajlarını al!
        </button>
        <div className="flex justify-center gap-4 mt-4 text-white/70 text-sm">
          <a href="#" className="hover:text-white">Terms</a>
          <Link href="/admin" className="hover:text-white">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
