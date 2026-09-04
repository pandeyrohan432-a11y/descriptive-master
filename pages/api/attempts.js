import { Pool } from "pg";

let pool;
function getPool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if(!pool) pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:3});
  return pool;
}
async function ensureTable(){
  await getPool().query(`CREATE TABLE IF NOT EXISTS dm_attempts (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    name TEXT,
    test_no INTEGER NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    essay TEXT,
    comp_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluation JSONB,
    error TEXT
  );
  CREATE INDEX IF NOT EXISTS dm_attempts_phone_idx ON dm_attempts(phone);
  CREATE INDEX IF NOT EXISTS dm_attempts_test_idx ON dm_attempts(test_no);
  CREATE INDEX IF NOT EXISTS dm_attempts_date_idx ON dm_attempts(submitted_at DESC);`);
}
function isAdmin(req){return /(?:^|;\s*)dm_admin=1(?:;|$)/.test(req.headers.cookie||"");}
function cleanPhone(v){return String(v||"").replace(/\D/g,"");}

export default async function handler(req,res){
  try{
    await ensureTable();
    const db=getPool();

    if(req.method==="GET"){
      if(req.query.admin!=="1") return res.status(401).json({error:"Unauthorized"});
      if(!isAdmin(req)) return res.status(401).json({error:"Unauthorized"});
      const r=await db.query(`SELECT id,phone,name,test_no,submitted_at,essay,comp_answers,evaluation,error FROM dm_attempts ORDER BY submitted_at DESC LIMIT 1000`);
      return res.status(200).json({attempts:r.rows});
    }

    if(req.method==="POST"){
      const phone=cleanPhone(req.body?.phone);
      const name=String(req.body?.name||"Student").trim().slice(0,100);
      const testNo=Number(req.body?.testNo);
      const id=String(req.body?.id||"").slice(0,100);
      if(phone.length!==10) return res.status(400).json({error:"Invalid phone"});
      if(!id || !Number.isInteger(testNo) || testNo<1 || testNo>10) return res.status(400).json({error:"Invalid attempt"});
      const submittedAt=req.body?.submittedAt?new Date(req.body.submittedAt):new Date();
      if(Number.isNaN(submittedAt.getTime())) return res.status(400).json({error:"Invalid submittedAt"});
      const essay=String(req.body?.essay||"");
      const comp=Array.isArray(req.body?.compAnswers)?req.body.compAnswers.map(x=>String(x||"")):[];
      const evaluation=req.body?.evaluation??null;
      const error=req.body?.error?String(req.body.error).slice(0,1000):null;
      const r=await db.query(`INSERT INTO dm_attempts(id,phone,name,test_no,submitted_at,essay,comp_answers,evaluation,error)
        VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9)
        ON CONFLICT(id) DO UPDATE SET phone=EXCLUDED.phone,name=EXCLUDED.name,test_no=EXCLUDED.test_no,submitted_at=EXCLUDED.submitted_at,essay=EXCLUDED.essay,comp_answers=EXCLUDED.comp_answers,evaluation=EXCLUDED.evaluation,error=EXCLUDED.error
        RETURNING id,phone,name,test_no,submitted_at,essay,comp_answers,evaluation,error`,[id,phone,name,testNo,submittedAt,essay,JSON.stringify(comp),evaluation?JSON.stringify(evaluation):null,error]);
      return res.status(200).json({attempt:r.rows[0]});
    }
    return res.status(405).json({error:"Method not allowed"});
  }catch(e){
    console.error("attempts API error",e);
    return res.status(503).json({error:"Attempt tracking service is unavailable. Please configure DATABASE_URL."});
  }
}
