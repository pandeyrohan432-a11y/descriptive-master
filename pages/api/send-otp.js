import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';

const bodySchema = z.object({ phone: z.string().regex(/^\d{10}$/) });

function hash(value) {
  return crypto.createHash('sha256').update(`${value}:${process.env.OTP_SECRET || 'change-me'}`).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });

  const phone = parsed.data.phone;
  const student = await prisma.student.upsert({ where: { phone }, update: {}, create: { phone } });
  const recent = await prisma.otpCode.count({ where: { studentId: student.id, createdAt: { gt: new Date(Date.now() - 60_000) } } });
  if (recent >= 1) return res.status(429).json({ error: 'Please wait 60 seconds before requesting another OTP.' });

  const code = String(crypto.randomInt(100000, 1000000));
  await prisma.otpCode.create({ data: { studentId: student.id, codeHash: hash(code), expiresAt: new Date(Date.now() + 5 * 60_000) } });

  // SMS gateway integration is intentionally environment-driven. Until credentials are added,
  // development mode returns the code so the site can be tested without sending real SMS.
  if (process.env.OTP_DEV_MODE === 'true') return res.status(200).json({ ok: true, devOtp: code });

  if (!process.env.SMS_API_URL || !process.env.SMS_AUTH_TOKEN) {
    return res.status(503).json({ error: 'SMS service is not configured yet. Add SMS_API_URL and SMS_AUTH_TOKEN in Vercel Environment Variables.' });
  }

  const response = await fetch(process.env.SMS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SMS_AUTH_TOKEN}` },
    body: JSON.stringify({ phone, message: `Your Descriptive Master OTP is ${code}. It is valid for 5 minutes.` })
  });
  if (!response.ok) return res.status(502).json({ error: 'Could not send OTP. Please try again.' });
  return res.status(200).json({ ok: true });
}
