import { Pool } from "pg";
import { getSessionUser } from "../../lib/session";

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
    email TEXT,
    city TEXT,
    state TEXT,
    exam_target TEXT DEFAULT 'IBPS PO',
    about TEXT,
    first_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const columns=[
    ["email","TEXT"],
    ["city","TEXT"],
    ["state","TEXT"],
    ["exam_target","TEXT DEFAULT 'IBPS PO'"],
    ["about","TEXT"]
  ];
  for(const [name,type] of columns){
    await db.query(`ALTER TABLE dm_students ADD COLUMN IF NOT EXISTS ${name} ${type}`);
  }
  await db.query(`CREATE INDEX IF NOT EXISTS dm_students_last_login_idx ON dm_students(last_login_at DESC)`);
}
function isAdmin(req){return /(?:^|;\s*)dm_admin=1(?:;|$)/.test(req.headers.cookie||"");}
function cleanPhone(v){return String(v||"").replace(/\D/g,"");}
function cleanText(v,max=500){return String(v??"").trim().slice(0,max);}
function profileFields(body){
  return {
    name:cleanText(body?.name,100)||"Student",
    email:cleanText(body?.email,160),
    city:cleanText(body?.city,100),
    state:cleanText(body?.state,100),
    examTarget:cleanText(body?.examTarget,100)||"IBPS PO",
    about:cleanText(body?.about,1000)
  };
}

export default async function handler(req,res){
  try{
    const db=getPool();
    await ensureTable();

    if(req.method==="POST"){
      const sessionUser=await getSessionUser(req);
      if(!sessionUser) return res.status(401).json({error:"Unauthorized"});
      const phone=cleanPhone(req.body?.phone);
      if(phone.length!==10) return res.status(400).json({error:"Invalid phone"});
      if(sessionUser.phone!==phone) return res.status(403).json({error:"Forbidden"});
      const p=profileFields(req.body);
      const r=await db.query(`INSERT INTO dm_students(phone,name,email,city,state,exam_target,about)
        VALUES($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT(phone) DO UPDATE SET
          name=CASE WHEN EXCLUDED.name<>'Student' THEN EXCLUDED.name ELSE dm_students.name END,
          email=CASE WHEN EXCLUDED.email<>'' THEN EXCLUDED.email ELSE dm_students.email END,
          city=CASE WHEN EXCLUDED.city<>'' THEN EXCLUDED.city ELSE dm_students.city END,
          state=CASE WHEN EXCLUDED.state<>'' THEN EXCLUDED.state ELSE dm_students.state END,
          exam_target=CASE WHEN EXCLUDED.exam_target<>'' THEN EXCLUDED.exam_target ELSE dm_students.exam_target END,
          about=CASE WHEN EXCLUDED.about<>'' THEN EXCLUDED.about ELSE dm_students.about END,
          last_login_at=NOW()
        RETURNING phone,name,email,city,state,exam_target,about,first_login_at,last_login_at`,
        [phone,p.name,p.email,p.city,p.state,p.examTarget,p.about]);
      return res.status(200).json({student:r.rows[0]});
    }

    if(req.method==="GET"){
      if(req.query.phone){
        const phone=cleanPhone(req.query.phone);
        const sessionUser=await getSessionUser(req);
        if(phone.length!==10) return res.status(400).json({error:"Invalid phone"});
        if(!sessionUser || sessionUser.phone!==phone) return res.status(401).json({error:"Unauthorized"});
        const r=await db.query(`SELECT phone,name,email,city,state,exam_target,about,first_login_at,last_login_at
          FROM dm_students WHERE phone=$1 LIMIT 1`,[phone]);
        return res.status(200).json({exists:r.rowCount>0,student:r.rows[0]||null});
      }
      if(req.query.admin!=="1" || !isAdmin(req)) return res.status(401).json({error:"Unauthorized"});
      const r=await db.query(`
        SELECT
          COALESCE(s.phone,a.phone) AS phone,
          COALESCE(NULLIF(s.name,''),NULLIF(a.name,''),'Student') AS name,
          s.email,s.city,s.state,s.exam_target,s.about,
          s.first_login_at,
          COALESCE(s.last_login_at,a.updated_at,a.created_at) AS last_login_at
        FROM (
          SELECT DISTINCT ON (phone) phone,name,updated_at,created_at
          FROM dm_access_requests
          WHERE status='approved'
          ORDER BY phone,updated_at DESC
        ) a
        FULL OUTER JOIN dm_students s ON s.phone=a.phone
        ORDER BY COALESCE(s.last_login_at,a.updated_at,a.created_at) DESC NULLS LAST
        LIMIT 5000
      `);
      return res.status(200).json({students:r.rows});
    }

    return res.status(405).json({error:"Method not allowed"});
  }catch(e){
    console.error("students API error",e);
    return res.status(503).json({error:"Student tracking service is unavailable. Please configure DATABASE_URL."});
  }
}
