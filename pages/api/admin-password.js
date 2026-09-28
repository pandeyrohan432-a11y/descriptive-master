import { Pool } from "pg";
import { hashPassword } from "../../lib/session";

let pool;
function getPool(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if(!pool) pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:3});
  return pool;
}
function isAdmin(req){return /(?:^|;\s*)dm_admin=1(?:;|$)/.test(req.headers.cookie||"");}
function cleanPhone(v){return String(v||"").replace(/\D/g,"");}

export default async function handler(req,res){
  if(!isAdmin(req)) return res.status(401).json({error:"Admin authorization required"});
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try{
    const phone=cleanPhone(req.body?.phone);
    const password=String(req.body?.password||"");
    if(phone.length!==10) return res.status(400).json({error:"Invalid student phone"});
    if(password.length<6) return res.status(400).json({error:"Password must be at least 6 characters"});
    const db=getPool();
    const r=await db.query("UPDATE dm_students SET password_hash=$1 WHERE phone=$2 RETURNING phone,name",[hashPassword(password),phone]);
    if(!r.rowCount) return res.status(404).json({error:"Student not found"});
    return res.status(200).json({ok:true,student:r.rows[0]});
  }catch(e){
    console.error("admin password API error",e);
    return res.status(503).json({error:"Could not update student password"});
  }
}
