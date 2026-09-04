export default function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({ok:false});
  const {passcode}=req.body||{};
  const expected=process.env.ADMIN_PASSCODE;
  if(!expected) return res.status(503).json({ok:false,error:"ADMIN_PASSCODE is not configured"});
  if(typeof passcode!=="string" || passcode!==expected) return res.status(401).json({ok:false,error:"Invalid admin passcode"});
  res.setHeader("Set-Cookie",`dm_admin=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return res.status(200).json({ok:true});
}
