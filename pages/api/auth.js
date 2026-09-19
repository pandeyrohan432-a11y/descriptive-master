import { ensureAuthTables, cleanPhone, hashPassword, verifyPassword, createSession, getSessionUser, clearSession } from "../../lib/session";

const STATES=["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh","Other"];

export default async function handler(req,res){
  try{
    const db=await ensureAuthTables();
    if(req.method==="GET"){
      const user=await getSessionUser(req);
      return res.status(200).json({authenticated:!!user,user:user||null});
    }
    if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
    const action=String(req.body?.action||"");
    if(action==="logout"){await clearSession(req,res);return res.status(200).json({ok:true});}
    if(action==="signup"){
      const name=String(req.body?.name||"").trim().slice(0,100);
      const phone=cleanPhone(req.body?.phone);
      const email=String(req.body?.email||"").trim().toLowerCase().slice(0,200);
      const password=String(req.body?.password||"");
      const examTarget=String(req.body?.examTarget||"Banking").trim().slice(0,80)||"Banking";
      const state=String(req.body?.state||"").trim().slice(0,80);
      if(name.length<2)return res.status(400).json({error:"Name is required"});
      if(phone.length!==10)return res.status(400).json({error:"Enter a valid 10-digit mobile number"});
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:"Enter a valid email address"});
      if(password.length<6)return res.status(400).json({error:"Password must be at least 6 characters"});
      if(!examTarget)return res.status(400).json({error:"Exam preparation is required"});
      if(!STATES.includes(state))return res.status(400).json({error:"Please select your state"});
      const exists=await db.query("SELECT phone,email FROM dm_students WHERE phone=$1 OR LOWER(email)=LOWER($2) LIMIT 1",[phone,email]);
      if(exists.rowCount){
        const row=exists.rows[0];
        return res.status(409).json({error:row.phone===phone?"This mobile number is already registered. Please Sign In.":"This email is already registered. Please Sign In."});
      }
      await db.query("INSERT INTO dm_students(phone,name,email,password_hash,exam_target,state) VALUES($1,$2,$3,$4,$5,$6)",[phone,name,email,hashPassword(password),examTarget,state]);
      await createSession(res,phone);
      return res.status(201).json({ok:true,user:{phone,name,email,exam_target:examTarget,state}});
    }
    if(action==="signin"){
      const phone=cleanPhone(req.body?.phone);
      const password=String(req.body?.password||"");
      if(phone.length!==10||!password)return res.status(400).json({error:"Enter your mobile number and password"});
      const r=await db.query("SELECT phone,name,email,password_hash,exam_target,state FROM dm_students WHERE phone=$1 LIMIT 1",[phone]);
      if(!r.rowCount||!r.rows[0].password_hash||!verifyPassword(password,r.rows[0].password_hash))return res.status(401).json({error:"Invalid mobile number or password"});
      await db.query("UPDATE dm_students SET last_login_at=NOW() WHERE phone=$1",[phone]);
      await createSession(res,phone);
      const u=r.rows[0]; delete u.password_hash;
      return res.status(200).json({ok:true,user:{phone:u.phone,name:u.name,email:u.email,exam_target:u.exam_target,state:u.state}});
    }
    return res.status(400).json({error:"Invalid auth action"});
  }catch(e){
    console.error("auth API error",e);
    return res.status(503).json({error:"Authentication service is unavailable. Please check DATABASE_URL."});
  }
}
