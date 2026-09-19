import { getSessionUser } from "../../lib/session";
import { Pool } from "pg";

let pool;
function getPool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if(!pool) pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:3});
  return pool;
}

async function ensureTable(){
  const db=getPool();
  await db.query("CREATE TABLE IF NOT EXISTS dm_reviews (phone TEXT PRIMARY KEY REFERENCES dm_students(phone) ON DELETE CASCADE,name TEXT,rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),comment TEXT NOT NULL DEFAULT '',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await db.query("CREATE INDEX IF NOT EXISTS dm_reviews_date_idx ON dm_reviews(updated_at DESC)");
}

export default async function handler(req,res){
  try{
    const user=await getSessionUser(req);
    if(!user) return res.status(401).json({error:"Please sign in first."});
    const db=getPool();
    await ensureTable();

    if(req.method==="GET"){
      const r=await db.query("SELECT name,rating,comment,updated_at FROM dm_reviews ORDER BY updated_at DESC LIMIT 12");
      const mine=await db.query("SELECT rating,comment FROM dm_reviews WHERE phone=$1 LIMIT 1",[user.phone]);
      const avg=await db.query("SELECT ROUND(AVG(rating)::numeric,1) AS average,COUNT(*)::int AS count FROM dm_reviews");
      return res.status(200).json({reviews:r.rows,mine:mine.rows[0]||null,average:avg.rows[0]?.average||null,count:avg.rows[0]?.count||0});
    }

    if(req.method==="POST"){
      const rating=Number(req.body?.rating);
      const comment=String(req.body?.comment||"").trim().slice(0,500);
      if(!Number.isInteger(rating)||rating<1||rating>5) return res.status(400).json({error:"Please choose a rating from 1 to 5 stars."});
      if(comment.length<3) return res.status(400).json({error:"Please write a short review."});
      const r=await db.query("INSERT INTO dm_reviews(phone,name,rating,comment) VALUES($1,$2,$3,$4) ON CONFLICT(phone) DO UPDATE SET name=EXCLUDED.name,rating=EXCLUDED.rating,comment=EXCLUDED.comment,updated_at=NOW() RETURNING name,rating,comment,updated_at",[user.phone,user.name||"Student",rating,comment]);
      return res.status(200).json({review:r.rows[0]});
    }
    return res.status(405).json({error:"Method not allowed"});
  }catch(e){
    console.error("reviews API error",e);
    return res.status(503).json({error:"Review service is unavailable. Please try again later."});
  }
}
