"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  content: string;
  senderIP: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  timestamp: string;
  country?: string;
  city?: string;
  region?: string;
}

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: "Bearer admin123" },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Yanlış şifre!");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const generateShareImage = async (msg: Message) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Instagram story dimensions (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background - dark gray
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card dimensions
    const cardX = 70;
    const cardY = 380;
    const cardWidth = canvas.width - 140;
    const cardHeight = 580;
    const borderRadius = 50;

    // Draw rounded rectangle card with gradient header
    ctx.save();

    // Create clipping path for rounded corners
    ctx.beginPath();
    ctx.moveTo(cardX + borderRadius, cardY);
    ctx.lineTo(cardX + cardWidth - borderRadius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + borderRadius);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - borderRadius);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - borderRadius, cardY + cardHeight);
    ctx.lineTo(cardX + borderRadius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - borderRadius);
    ctx.lineTo(cardX, cardY + borderRadius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + borderRadius, cardY);
    ctx.closePath();
    ctx.clip();

    // Gradient header (pink to orange)
    const gradientHeight = 200;
    const gradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY);
    gradient.addColorStop(0, "#ec4899"); // pink-500
    gradient.addColorStop(1, "#f97316"); // orange-500
    ctx.fillStyle = gradient;
    ctx.fillRect(cardX, cardY, cardWidth, gradientHeight);

    // Header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("bana anonim olarak mesajlar", canvas.width / 2, cardY + 80);
    ctx.fillText("gonder!", canvas.width / 2, cardY + 130);

    // White section
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cardX, cardY + gradientHeight, cardWidth, cardHeight - gradientHeight);

    ctx.restore();

    // Message text (red color like in the image)
    ctx.fillStyle = "#dc2626"; // red-600
    ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";

    // Word wrap for message
    const maxWidth = cardWidth - 100;
    const lineHeight = 60;
    const words = msg.content.split(' ');
    let line = '';
    let y = cardY + gradientHeight + 120;
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Center the text block vertically in white area
    const textBlockHeight = lines.length * lineHeight;
    const startY = cardY + gradientHeight + ((cardHeight - gradientHeight) / 2) - (textBlockHeight / 2) + 30;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], canvas.width / 2, startY + (i * lineHeight));
    }

    // NGL Logo at bottom
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 80px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NGL", canvas.width / 2, cardY + cardHeight + 180);

    // Subtitle
    ctx.fillStyle = "#666666";
    ctx.font = "36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("anonim soru ve cevap", canvas.width / 2, cardY + cardHeight + 240);

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ngl-message-${msg.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
            <p className="text-gray-400 mt-2">Giriş yapmak için şifreyi girin</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 mb-4"
            />
            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Giriş Yap
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-4">
            Demo şifre: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <canvas ref={canvasRef} className="hidden" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                📬
              </span>
              Admin Paneli
            </h1>
            <p className="text-gray-400 mt-1">
              Gelen anonim mesajları ve gönderen bilgilerini görüntüle
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
              <span className="text-gray-400 text-sm">Toplam Mesaj:</span>
              <span className="text-white font-bold ml-2">{messages.length}</span>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-4">Mesajlar yükleniyor...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
            <span className="text-6xl">📭</span>
            <h2 className="text-xl font-bold text-white mt-4">Henüz mesaj yok</h2>
            <p className="text-gray-400 mt-2">
              Gelen mesajlar burada görünecek
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-pink-500/50 transition-colors fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Message Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-pink-400 text-sm font-medium">
                        #{messages.length - index}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-white text-lg leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Share Button */}
                    <button
                      onClick={() => generateShareImage(msg)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                      Instagram'da Paylaş
                    </button>
                  </div>

                  {/* Sender Info */}
                  <div className="lg:w-80 bg-gray-900/50 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Gönderen Bilgileri
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs">IP Adresi</span>
                        <span className="text-orange-400 font-mono">{msg.senderIP}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Konum</span>
                        <span className="text-cyan-400">
                          {msg.city && msg.country
                            ? `${msg.city}${msg.region ? `, ${msg.region}` : ''}, ${msg.country}`
                            : "Bilinmiyor"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Tarayıcı</span>
                        <span className="text-blue-400">{msg.browser}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">İşletim Sistemi</span>
                        <span className="text-green-400">{msg.os}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Cihaz</span>
                        <span className="text-purple-400">{msg.device}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Zaman</span>
                        <span className="text-yellow-400 text-xs">{formatDate(msg.timestamp)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-gray-500 block text-xs mb-1">User Agent</span>
                      <p className="text-gray-400 text-xs font-mono break-all leading-relaxed">
                        {msg.userAgent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
