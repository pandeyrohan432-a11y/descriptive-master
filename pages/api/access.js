import { Pool } from "pg";

let pool;
function getPool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if(!pool) pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:3});
  return pool;
}
async function ensureTable(){
  await getPool().query(`CREATE TABLE IF NOT EXISTS dm_access_requests (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    name TEXT,
    test_no INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS dm_access_phone_idx ON dm_access_requests(phone);
  CREATE INDEX IF NOT EXISTS dm_access_status_idx ON dm_access_requests(status);`);
}
function isAdmin(req){return /(?:^|;\s*)dm_admin=1(?:;|$)/.test(req.headers.cookie||"");}

export default async function handler(req,res){
  try{
    await ensureTable();
    const db=getPool();

    if(req.method==="GET"){
      if(req.query.admin==="1"){
        if(!isAdmin(req)) return res.status(401).json({error:"Unauthorized"});
        const r=await db.query(`SELECT id,phone,name,test_no,status,created_at,updated_at FROM dm_access_requests ORDER BY created_at DESC LIMIT 100`);
        return res.status(200).json({requests:r.rows});
      }
      const phone=String(req.query.phone||"").replace(/\D/g,"");
      if(phone.length!==10) return res.status(400).json({error:"Invalid phone"});
      const r=await db.query(`SELECT status FROM dm_access_requests WHERE phone=$1 ORDER BY created_at DESC LIMIT 1`,[phone]);
      const status=r.rows[0]?.status||null;
      return res.status(200).json({status,accessGranted:status==="approved"});
    }

    if(req.method==="POST"){
      if(req.body?.adminAction){
        if(!isAdmin(req)) return res.status(401).json({error:"Unauthorized"});
        const {id,action}=req.body;
        if(!id || !["approve","reject"].includes(action)) return res.status(400).json({error:"Invalid request"});
        const status=action==="approve"?"approved":"rejected";
        const r=await db.query(`UPDATE dm_access_requests SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *`,[status,id]);
        if(!r.rowCount) return res.status(404).json({error:"Request not found"});
        return res.status(200).json({request:r.rows[0]});
      }

      const phone=String(req.body?.phone||"").replace(/\D/g,"");
      const name=String(req.body?.name||"Student").trim().slice(0,100);
      const testNo=Number(req.body?.testNo||3);
      if(phone.length!==10) return res.status(400).json({error:"Invalid phone"});
      if(testNo<3 || testNo>10) return res.status(400).json({error:"Invalid test number"});

      const existing=await db.query(`SELECT status FROM dm_access_requests WHERE phone=$1 ORDER BY created_at DESC LIMIT 1`,[phone]);
      if(existing.rows[0]?.status==="approved") return res.status(200).json({status:"approved",accessGranted:true});
      if(existing.rows[0]?.status==="pending") return res.status(200).json({status:"pending",accessGranted:false});

      const id=`req_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
      const r=await db.query(`INSERT INTO dm_access_requests(id,phone,name,test_no,status) VALUES($1,$2,$3,$4,'pending') RETURNING *`,[id,phone,name,testNo]);
      return res.status(201).json({status:"pending",accessGranted:false,request:r.rows[0]});
    }
    return res.status(405).json({error:"Method not allowed"});
  }catch(e){
    console.error("access API error",e);
    return res.status(503).json({error:"Payment access service is unavailable. Please configure DATABASE_URL."});
  }
}
