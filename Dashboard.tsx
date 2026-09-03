import Link from "next/link";
import { db } from "../lib/prisma";
import LogoutButton from "./LogoutButton";

export default async function Dashboard({user}:{user:any}){
 const tests=await db.test.findMany({where:{published:true},orderBy:{testNo:"asc"}});
 const attempts=await db.attempt.findMany({where:{userId:user.id},orderBy:{startedAt:"desc"},take:10,include:{test:true}});
 return <div className="shell"><div className="top"><div className="brand">DESCRIPTIVE MASTER</div><div>{user.name||"Student"} <LogoutButton/></div></div>
 <div className="hero"><div className="wide"><h1>Descriptive Test</h1><p className="muted">IBPS PO • Essay + Comprehension • 25 Marks • 30 Minutes</p></div></div>
 <div className="wrap wide"><div className="grid">{tests.map((t,i)=><div className="card" key={t.id}><h3>Descriptive Test No {i+1}</h3><div>IBPS PO</div><div className="meta"><div>❔ 2 Qs</div><div>✓ 25 Marks</div><div>◷ 30 Mins</div><div>◉ English</div></div><Link className="btn primary" style={{display:"block",textAlign:"center",textDecoration:"none"}} href={`/test/${t.testNo}`}>Start Test</Link></div>)}</div>
 <h2 style={{marginTop:35}}>Recent Attempts</h2>{attempts.length===0?<p className="muted">No attempts yet.</p>:attempts.map(a=><div className="card" style={{marginBottom:10}} key={a.id}>Test {a.test.testNo} • {a.status} • {new Date(a.startedAt).toLocaleString()}</div>)}
 </div></div>
}