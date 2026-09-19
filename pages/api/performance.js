import {getSessionUser} from "../../lib/session";

const MODEL=process.env.GEMINI_EVAL_MODEL||"gemini-3.6-flash";

export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:"AI analysis is not configured."});
  const user=await getSessionUser(req);
  if(!user)return res.status(401).json({error:"Please sign in."});
  const list=Array.isArray(req.body?.attempts)?req.body.attempts.slice(0,20):[];
  if(list.length<2)return res.status(400).json({error:"Complete at least 2 mocks first."});
  const clean=list.map((a,i)=>({testNo:a.testNo||i+1,score:Number(a.score)||0,essayScore:Number(a.essayScore)||0,compScore:Number(a.compScore)||0,feedback:String(a.feedback||"").slice(0,700),keyImprovements:Array.isArray(a.keyImprovements)?a.keyImprovements.slice(0,5):[]})).sort((a,b)=>Number(a.testNo)-Number(b.testNo));
  const prompt="You are an AI performance coach for a banking descriptive mock platform. Analyze ONLY the student's completed mock data below. Do not invent scores or trends. Explain whether there is evidence of improvement, whether performance is consistent, the strongest areas, recurring weaknesses, and 3 practical next steps. If scores are too sparse or mixed to establish a clear trend, say that clearly. Keep it concise and student-friendly.\n\nStudent mock data:\n"+JSON.stringify(clean)+"\n\nReturn plain text with these headings:\nGrowth status:\nScore trend:\nStrengths:\nRecurring gaps:\nNext 3 steps:";
  try{
    const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const rr=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.2,maxOutputTokens:1200}})});
    const data=await rr.json();
    if(!rr.ok)return res.status(rr.status).json({error:data?.error?.message||"AI analysis failed."});
    const analysis=data?.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("").trim();
    if(!analysis)return res.status(502).json({error:"AI returned no analysis."});
    return res.status(200).json({analysis});
  }catch(e){return res.status(500).json({error:"AI analysis failed."});}
}