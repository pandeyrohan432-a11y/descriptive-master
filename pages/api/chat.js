import { Pool } from "pg";

let pool;
function getPool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if(!pool) pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:3});
  return pool;
}
function isAdmin(req){return /(?:^|;\s*)dm_admin=1(?:;|$)/.test(req.headers.cookie||"");}
function cleanPhone(v){return String(v||"").replace(/\D/g,"");}
async function ensureTable(){
  const db=getPool();
  await db.query(`CREATE TABLE IF NOT EXISTS dm_chat_messages (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('student','admin')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await db.query(`CREATE INDEX IF NOT EXISTS dm_chat_phone_idx ON dm_chat_messages(phone,created_at)`);
}
async function approved(db,phone){
  const r=await db.query(`SELECT 1 FROM dm_access_requests WHERE phone=$1 AND status='approved' LIMIT 1`,[phone]);
  return !!r.rowCount;
}
export default async function handler(req,res){
  try{
    const db=getPool(); await ensureTable();
    const admin=isAdmin(req);
    if(req.method==="GET"){
      if(admin){
        const phone=cleanPhone(req.query.phone);
        if(phone){
          if(!(await approved(db,phone))) return res.status(403).json({error:"Student does not have approved access"});
          const r=await db.query(`SELECT id,phone,sender,message,created_at FROM dm_chat_messages WHERE phone=$1 ORDER BY created_at ASC LIMIT 300`,[phone]);
          return res.status(200).json({messages:r.rows});
        }
        // Keep students in a stable order. New messages must NOT reorder the list.
        const r=await db.query(`SELECT a.phone,MAX(a.name) AS name,MAX(m.created_at) AS last_message,(array_agg(m.sender ORDER BY m.created_at DESC))[1] AS last_sender,COUNT(m.id)::int AS message_count FROM dm_access_requests a LEFT JOIN dm_chat_messages m ON m.phone=a.phone WHERE a.status='approved' GROUP BY a.phone ORDER BY MAX(a.name) ASC NULLS LAST, a.phone ASC LIMIT 100`);
        return res.status(200).json({students:r.rows});
      }
      const phone=cleanPhone(req.query.phone);
      if(phone.length!==10) return res.status(400).json({error:"Invalid phone"});
      if(!(await approved(db,phone))) return res.status(403).json({error:"Chat is available after access approval"});
      const r=await db.query(`SELECT id,phone,sender,message,created_at FROM dm_chat_messages WHERE phone=$1 ORDER BY created_at ASC LIMIT 300`,[phone]);
      return res.status(200).json({messages:r.rows});
    }
    if(req.method==="POST"){
      const message=String(req.body?.message||"").trim().slice(0,2000);
      if(!message) return res.status(400).json({error:"Message is required"});
      let phone=cleanPhone(req.body?.phone);
      let sender=admin?"admin":"student";
      if(admin){
        if(phone.length!==10) return res.status(400).json({error:"Invalid student phone"});
      }else{
        if(phone.length!==10 || !(await approved(db,phone))) return res.status(403).json({error:"Chat is available after access approval"});
      }
      if(!(await approved(db,phone))) return res.status(403).json({error:"Student does not have approved access"});
      const id=`msg_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
      const r=await db.query(`INSERT INTO dm_chat_messages(id,phone,sender,message) VALUES($1,$2,$3,$4) RETURNING id,phone,sender,message,created_at`,[id,phone,sender,message]);
      return res.status(201).json({message:r.rows[0]});
    }
    return res.status(405).json({error:"Method not allowed"});
  }catch(e){
    console.error("chat API error",e);
    return res.status(503).json({error:"Chat service is unavailable. Please configure DATABASE_URL."});
  }
}
