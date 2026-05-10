export interface Message {
  id: string;
  content: string;
  senderIP: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  timestamp: Date;
  country?: string;
  city?: string;
  region?: string;
}

// In-memory store (in production, use a database)
export const messages: Message[] = [];

export function addMessage(message: Message) {
  messages.unshift(message);
  return message;
}

export function getMessages() {
  return messages;
}

export function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  let browser = "Bilinmiyor";
  let os = "Bilinmiyor";
  let device = "Masaüstü";

  // Browser detection
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Device detection
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobil";
  } else if (ua.includes("iPad") || ua.includes("Tablet")) {
    device = "Tablet";
  }

  return { browser, os, device };
}
