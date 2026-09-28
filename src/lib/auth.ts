import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "pahsampah-default-secret-key-12345";
const COOKIE_NAME = "pahsampah_session";

// Pure JavaScript Base64url Encoder/Decoder (to bypass Node Buffer dependency in Edge runtime)
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function stringToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Async HMAC SHA-256 using standard Web Crypto API (natively supported in both Node and Edge)
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    messageData
  );

  return arrayBufferToBase64Url(signature);
}

// Async JWT signing
export async function signJwt(payload: any, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = stringToBase64Url(JSON.stringify(header));
  const encodedPayload = stringToBase64Url(JSON.stringify(payload));
  const signature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Async JWT verification
export async function verifyJwt(token: string, secret: string): Promise<any | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  
  const expectedSignature = await hmacSha256(`${encodedHeader}.${encodedPayload}`, secret);
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  points?: number;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyJwt(token, JWT_SECRET);
  if (!payload) return null;

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}

export async function createSession(user: { id: string; name: string; email: string; role: string }) {
  const expiryTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours
  const token = await signJwt(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: expiryTime,
    },
    JWT_SECRET
  );

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiryTime * 1000),
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
