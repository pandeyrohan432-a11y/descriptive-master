import crypto from "crypto";
import { db } from "./prisma";

function otpHash(phone: string, code: string) {
  return crypto.createHash("sha256")
    .update(phone + ":" + code + ":" + process.env.OTP_PEPPER)
    .digest("hex");
}

export async function issueOtp(phone: string) {
  const recent = await db.otpCode.count({
    where: {
      phone,
      createdAt: { gt: new Date(Date.now() - 60_000) }
    }
  });
  if (recent >= 1) throw new Error("Please wait before requesting another OTP.");

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.otpCode.create({
    data: {
      phone,
      codeHash: otpHash(phone, code),
      expiresAt: new Date(Date.now() + 5 * 60_000)
    }
  });

  // Development only. In production, replace this with an SMS provider call.
  return process.env.OTP_MODE === "dev" ? code : null;
}

export async function verifyOtp(phone: string, code: string) {
  const item = await db.otpCode.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" }
  });
  if (!item || item.expiresAt < new Date() || item.attempts >= 5) return false;
  await db.otpCode.update({
    where: { id: item.id },
    data: { attempts: { increment: 1 } }
  });
  return item.codeHash === otpHash(phone, code);
}