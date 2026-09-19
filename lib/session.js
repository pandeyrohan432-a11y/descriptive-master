import { Pool } from "pg";
import crypto from "crypto";

let pool;
function getPool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if(!pool) pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:3});
  return pool;
}
export function cleanPhone(v){return String(v||"").replace(/\D/g,"");}
export function hashPassword(password){
  const salt=crypto.randomBytes(16).toString("hex");
  const hash=crypto.scryptSync(password,salt,64,{N:16384,r:8,p:1}).toString("hex");
  return "scrypt$"+salt+"$"+hash;
}
export function verifyPassword(password,stored){
  try{
    const parts=String(stored||"").split("$");
    const salt=parts[1],hex=parts[2];
    if(!salt||!hex)return false;
    const actual=crypto.scryptSync(password,salt,64,{N:16384,r:8,p:1});
    const expected=Buffer.from(hex,"hex");
    return expected.length===actual.length&&crypto.timingSafeEqual(actual,expected);
  }catch(e){return false;}
}
export async function ensureAuthTables(){
  const db=getPool();
  await db.query("CREATE TABLE IF NOT EXISTS dm_students (phone TEXT PRIMARY KEY,name TEXT,email TEXT,password_hash TEXT,exam_target TEXT NOT NULL DEFAULT 'Banking',state TEXT,first_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await db.query("ALTER TABLE dm_students ADD COLUMN IF NOT EXISTS email TEXT");
  await db.query("ALTER TABLE dm_students ADD COLUMN IF NOT EXISTS password_hash TEXT");
  await db.query("ALTER TABLE dm_students ADD COLUMN IF NOT EXISTS exam_target TEXT NOT NULL DEFAULT 'Banking'");
  await db.query("ALTER TABLE dm_students ADD COLUMN IF NOT EXISTS state TEXT");
  await db.query("CREATE UNIQUE INDEX IF NOT EXISTS dm_students_email_idx ON dm_students(LOWER(email)) WHERE email IS NOT NULL");
  await db.query("CREATE TABLE IF NOT EXISTS dm_sessions (token_hash TEXT PRIMARY KEY,phone TEXT NOT NULL REFERENCES dm_students(phone) ON DELETE CASCADE,expires_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await db.query("CREATE INDEX IF NOT EXISTS dm_sessions_phone_idx ON dm_sessions(phone)");
  // One-time migration: the old OTP-only registration data had no password.
  // The owner requested a clean start for the new password-based registration system.
  await db.query("CREATE TABLE IF NOT EXISTS dm_auth_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  const reset=await db.query("SELECT 1 FROM dm_auth_migrations WHERE name='password-auth-clean-start' LIMIT 1");
  if(!reset.rowCount){
    await db.query("TRUNCATE TABLE dm_sessions, dm_attempts, dm_chat_messages, dm_students RESTART IDENTITY CASCADE");
    try{ await db.query("TRUNCATE TABLE dm_access_requests RESTART IDENTITY CASCADE"); }catch(e){}
    await db.query("INSERT INTO dm_auth_migrations(name) VALUES('password-auth-clean-start')");
  }
  return db;
}
function parseCookies(req){
  const raw=req.headers.cookie||"";
  return Object.fromEntries(raw.split(";").map(x=>x.trim()).filter(Boolean).map(x=>{
    const i=x.indexOf("="); return i<0?[x,""]: [x.slice(0,i),decodeURIComponent(x.slice(i+1))];
  }));
}
function hashToken(v){return crypto.createHash("sha256").update(v+(process.env.SESSION_SECRET||"descriptive-master-session-secret")).digest("hex");}
export async function createSession(res,phone){
  const db=await ensureAuthTables();
  const raw=crypto.randomBytes(32).toString("hex");
  const expires=new Date(Date.now()+30*24*60*60*1000);
  await db.query("INSERT INTO dm_sessions(token_hash,phone,expires_at) VALUES($1,$2,$3)",[hashToken(raw),phone,expires]);
  res.setHeader("Set-Cookie","dm_session="+encodeURIComponent(raw)+"; Path=/; HttpOnly; Secure="+(process.env.NODE_ENV==="production")+"; SameSite=Lax; Max-Age="+(30*24*60*60));
}
export async function getSessionUser(req){
  const db=await ensureAuthTables();
  const raw=parseCookies(req).dm_session;
  if(!raw)return null;
  const r=await db.query("SELECT s.phone,s.name,s.email,s.exam_target,s.state FROM dm_sessions x JOIN dm_students s ON s.phone=x.phone WHERE x.token_hash=$1 AND x.expires_at>NOW() LIMIT 1",[hashToken(raw)]);
  return r.rows[0]||null;
}
export async function clearSession(req,res){
  const db=await ensureAuthTables();
  const raw=parseCookies(req).dm_session;
  if(raw)await db.query("DELETE FROM dm_sessions WHERE token_hash=$1",[hashToken(raw)]);
  res.setHeader("Set-Cookie","dm_session=; Path=/; HttpOnly; Secure="+(process.env.NODE_ENV==="production")+"; SameSite=Lax; Max-Age=0");
}
