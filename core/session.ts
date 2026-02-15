import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export type SessionData = {
  userId?: string;
};

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || "en-az-32-karakter-uzunlugunda-bir-sifre!!",
  cookieName: "cms_admin_session",
  ttl: 60 * 60 * 24 * 7, // 7 gün
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export { SESSION_OPTIONS };
