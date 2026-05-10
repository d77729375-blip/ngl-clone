import { NextRequest, NextResponse } from "next/server";
import { addMessage, getMessages, parseUserAgent } from "@/lib/store";

// Function to get location from IP using ip-api.com (free service)
async function getLocationFromIP(ip: string): Promise<{ country: string; city: string; region: string }> {
  try {
    // Skip for local/private IPs
    if (ip === "::1" || ip === "127.0.0.1" || ip === "Bilinmiyor" || ip.startsWith("192.168") || ip.startsWith("10.")) {
      return { country: "Yerel", city: "Localhost", region: "" };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName`);
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country || "Bilinmiyor",
        city: data.city || "Bilinmiyor",
        region: data.regionName || ""
      };
    }
  } catch (error) {
    console.error("Error fetching location:", error);
  }
  return { country: "Bilinmiyor", city: "Bilinmiyor", region: "" };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Mesaj boş olamaz" }, { status: 400 });
    }

    // Get sender IP - Netlify and other CDN/proxy headers
    const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare
    const xNfClientConnectionIP = request.headers.get("x-nf-client-connection-ip"); // Netlify
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const trueClientIP = request.headers.get("true-client-ip"); // Akamai/Cloudflare

    // Priority: Netlify > Cloudflare > x-forwarded-for > x-real-ip
    let senderIP = xNfClientConnectionIP ||
                   cfConnectingIP ||
                   trueClientIP ||
                   (forwardedFor?.split(",")[0]?.trim()) ||
                   realIP ||
                   "Bilinmiyor";

    const userAgent = request.headers.get("user-agent") || "Bilinmiyor";
    const { browser, os, device } = parseUserAgent(userAgent);

    // Get location from IP
    const location = await getLocationFromIP(senderIP);

    const message = addMessage({
      id: Math.random().toString(36).substring(2, 15),
      content: content.trim(),
      senderIP,
      userAgent,
      browser,
      os,
      device,
      country: location.country,
      city: location.city,
      region: location.region,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Simple auth check (in production use proper auth)
  if (authHeader !== "Bearer admin123") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const messages = getMessages();
  return NextResponse.json({ messages });
}
