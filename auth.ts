import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./prisma";

const COOKIE = "dm_session";
const SESSION_DAYS = 30;

function hash(value: string) {
  return crypto.createHash("sha256")
    .update(value + process.env.SESSION_SECRET)
    .digest("hex");
}

export async function createSession(userId: string) {
  const raw = crypto.randomBytes(32).toString("hex");
  const id = hash(raw);
  await db.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } });
  await db.session.create({
    data: {
      id,
      userId,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000)
    }
  });
  const jar = await cookies();
  jar.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400
  });
}

export async function getCurrentUser() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const session = await db.session.findUnique({
    where: { id: hash(raw) },
    include: { user: true }
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function clearSession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw) await db.session.deleteMany({ where: { id: hash(raw) } });
  jar.delete(COOKIE);
}