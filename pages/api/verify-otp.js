import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';

const bodySchema = z.object({ phone: z.string().regex(/^\d{10}$/), otp: z.string().regex(/^\d{6}$/) });

function hash(value) {
  return crypto.createHash('sha256').update(`${value}:${process.env.OTP_SECRET || 'change-me'}`).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid phone or OTP.' });

  const { phone, otp } = parsed.data;
  const student = await prisma.student.findUnique({ where: { phone } });
  if (!student) return res.status(404).json({ error: 'Student not found. Request a new OTP.' });

  const record = await prisma.otpCode.findFirst({ where: { studentId: student.id, used: false, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
  if (!record) return res.status(400).json({ error: 'OTP expired. Request a new OTP.' });
  if (record.attempts >= 5) return res.status(429).json({ error: 'Too many attempts. Request a new OTP.' });

  if (record.codeHash !== hash(otp)) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return res.status(400).json({ error: 'Incorrect OTP.' });
  }

  await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
  return res.status(200).json({ ok: true, student: { id: student.id, phone: student.phone, name: student.name, examTarget: student.examTarget } });
}
