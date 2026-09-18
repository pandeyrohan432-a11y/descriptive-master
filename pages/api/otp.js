function cleanPhone(v){return String(v||"").replace(/\D/g,"");}
function e164(v){const p=cleanPhone(v);return p.length===10?`+91${p}`:null}
function auth(){return Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}

async function twilio(path,body){
  const r=await fetch(`https://verify.twilio.com/v2/Services/${encodeURIComponent(process.env.TWILIO_VERIFY_SERVICE_SID)}${path}`,{
    method:"POST",
    headers:{"Authorization":`Basic ${auth()}`,"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams(body)
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(d?.message||"SMS verification service failed");
  return d;
}

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  if(!process.env.TWILIO_ACCOUNT_SID||!process.env.TWILIO_AUTH_TOKEN||!process.env.TWILIO_VERIFY_SERVICE_SID)
    return res.status(503).json({error:"Real OTP is not configured yet. Add Twilio Verify credentials in Vercel."});
  try{
    const {action,phone,code}=req.body||{};
    const to=e164(phone);
    if(!to) return res.status(400).json({error:"Enter a valid 10-digit Indian mobile number"});
    if(action==="send"){
      const d=await twilio("/Verifications",{To:to,Channel:"sms"});
      return res.status(200).json({sent:d.status==="pending",status:d.status});
    }
    if(action==="verify"){
      if(!/^\d{4,10}$/.test(String(code||""))) return res.status(400).json({error:"Enter the OTP sent to your phone"});
      const d=await twilio("/VerificationCheck",{To:to,Code:String(code)});
      if(d.status!=="approved") return res.status(401).json({verified:false,error:"Invalid or expired OTP"});
      return res.status(200).json({verified:true});
    }
    return res.status(400).json({error:"Invalid OTP action"});
  }catch(e){
    console.error("OTP service error",e.message);
    return res.status(502).json({error:e.message||"Could not process OTP"});
  }
}
