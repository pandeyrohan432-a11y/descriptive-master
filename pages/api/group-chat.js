import { Pool } from "pg";

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3
  });
  return pool;
}

function isAdmin(req) {
  return /(?:^|;\s*)dm_admin=1(?:;|$)/.test(req.headers.cookie || "");
}

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "");
}

async function ensureTables(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS dm_students (
    phone TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    city TEXT,
    state TEXT,
    exam_target TEXT DEFAULT 'IBPS PO',
    about TEXT,
    first_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS dm_group_messages (
    id TEXT PRIMARY KEY,
    phone TEXT,
    name TEXT,
    sender TEXT NOT NULL CHECK(sender IN ('student','admin')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await db.query(`ALTER TABLE dm_students ADD COLUMN IF NOT EXISTS chat_blocked BOOLEAN NOT NULL DEFAULT FALSE`);
  await db.query(`CREATE INDEX IF NOT EXISTS dm_group_messages_date_idx ON dm_group_messages(created_at)`);
}

async function getStudent(db, phone) {
  const result = await db.query(
    `SELECT phone,name,COALESCE(chat_blocked,FALSE) AS chat_blocked FROM dm_students WHERE phone=$1 LIMIT 1`,
    [phone]
  );
  return result.rows[0] || null;
}

export default async function handler(req, res) {
  try {
    const db = getPool();
    await ensureTables(db);
    const admin = isAdmin(req);

    if (req.method === "GET") {
      let student = null;
      if (!admin) {
        const phone = cleanPhone(req.query.phone);
        if (phone.length !== 10) return res.status(403).json({ error: "Group chat is available for logged-in students" });
        student = await getStudent(db, phone);
        if (!student) return res.status(403).json({ error: "Group chat is available for logged-in students" });
      }

      const result = await db.query(
        `SELECT id,phone,name,sender,message,created_at FROM dm_group_messages ORDER BY created_at ASC LIMIT 500`
      );

      if (admin) {
        const members = await db.query(
          `SELECT phone,name,COALESCE(chat_blocked,FALSE) AS chat_blocked FROM dm_students ORDER BY name ASC NULLS LAST,phone ASC`
        );
        return res.status(200).json({ messages: result.rows, members: members.rows });
      }

      return res.status(200).json({
        messages: result.rows,
        chatBlocked: Boolean(student.chat_blocked)
      });
    }

    if (req.method === "POST") {
      if (admin && ["block", "unblock"].includes(String(req.body?.action || ""))) {
        const target = cleanPhone(req.body?.phone);
        if (target.length !== 10) return res.status(400).json({ error: "Invalid student phone" });
        const blocked = req.body.action === "block";
        const updated = await db.query(
          `UPDATE dm_students SET chat_blocked=$1 WHERE phone=$2 RETURNING phone,name,chat_blocked`,
          [blocked, target]
        );
        if (!updated.rowCount) return res.status(404).json({ error: "Student not found" });
        return res.status(200).json({ member: updated.rows[0] });
      }

      const message = String(req.body?.message || "").trim().slice(0, 2000);
      if (!message) return res.status(400).json({ error: "Message is required" });

      let phone;
      let name;
      let sender;

      if (admin) {
        phone = "ADMIN";
        name = "Admin";
        sender = "admin";
      } else {
        phone = cleanPhone(req.body?.phone);
        if (phone.length !== 10) return res.status(403).json({ error: "Group chat is available for logged-in students" });
        const student = await getStudent(db, phone);
        if (!student) return res.status(403).json({ error: "Group chat is available for logged-in students" });
        if (student.chat_blocked) return res.status(403).json({ error: "You have been blocked from the student group chat by the admin." });
        name = String(student.name || req.body?.name || "Student").trim().slice(0, 100);
        sender = "student";
      }

      const id = `group_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const inserted = await db.query(
        `INSERT INTO dm_group_messages(id,phone,name,sender,message)
         VALUES($1,$2,$3,$4,$5)
         RETURNING id,phone,name,sender,message,created_at`,
        [id, phone, name, sender, message]
      );
      return res.status(201).json({ message: inserted.rows[0] });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("group chat API error", error);
    return res.status(503).json({ error: "Group chat is unavailable. Please configure DATABASE_URL." });
  }
}
