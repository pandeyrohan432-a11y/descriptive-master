import { Pool } from "pg";

let pool;
function getPool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if(!pool) pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:3});
  return pool;
}
async function ensureTable(){
  const db=getPool();
  await db.query(`CREATE TABLE IF NOT EXISTS dm_students (
    phone TEXT PRIMARY KEY,
    name TEXT,
    first_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await db.query(`CREATE INDEX IF NOT EXISTS dm_students_last_login_idx ON dm_students(last_login_at DESC)`);
}
function isAdmin(req){return /(?:^|;\s*)dm_admin=1(?:;|$)/.test(req.headers.cookie||"");}
function cleanPhone(v){return String(v||"").replace(/\D/g,"");}

export default async function handler(req,res){
  try{
    const db=getPool();
    await ensureTable();
    if(req.method==="POST"){
      const phone=cleanPhone(req.body?.phone);
      const name=String(req.body?.name||"Student").trim().slice(0,100)||"Student";
      if(phone.length!==10) return res.status(400).json({error:"Invalid phone"});
      const r=await db.query(`INSERT INTO dm_students(phone,name) VALUES($1,$2)
        ON CONFLICT(phone) DO UPDATE SET name=CASE WHEN EXCLUDED.name<>'Student' THEN EXCLUDED.name ELSE dm_students.name END,last_login_at=NOW()
        RETURNING phone,name,first_login_at,last_login_at`,[phone,name]);
      return res.status(200).json({student:r.rows[0]});
    }
    if(req.method==="GET"){
      if(req.query.admin!=="1" || !isAdmin(req)) return res.status(401).json({error:"Unauthorized"});
      const r=await db.query(`SELECT phone,name,first_login_at,last_login_at FROM dm_students ORDER BY last_login_at DESC LIMIT 5000`);
      return res.status(200).json({students:r.rows});
    }
    return res.status(405).json({error:"Method not allowed"});
  }catch(e){
    console.error("students API error",e);
    return res.status(503).json({error:"Student tracking service is unavailable. Please configure DATABASE_URL."});
  }
}
