import {useEffect,useState} from "react";

const css=`*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#0b1120;color:#eef4ff}.page{min-height:100vh;background:#0b1120}.wrap{max-width:1100px;margin:auto;padding:34px 24px}.back{background:#141f31;color:#dce6f5;border:1px solid #40516d;padding:9px 13px;border-radius:8px;cursor:pointer}.kicker{font-size:11px;letter-spacing:1.7px;color:#49a2ff;font-weight:900;margin-top:28px}.head{display:flex;justify-content:space-between;align-items:end;margin:6px 0 24px}.head h1{font-size:32px;margin:0}.head p{color:#8e9bb2;margin:7px 0 0}.count{color:#8e9bb2;font-size:13px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{background:linear-gradient(145deg,#151f32,#101827);border:1px solid #263650;border-radius:13px;padding:18px;min-height:150px}.badge{display:inline-block;padding:4px 9px;border-radius:999px;background:#123222;color:#63d391;font-size:10px;font-weight:900}.card h3{margin:15px 0 16px;font-size:19px}.btn{background:#318cf0;color:#fff;border:0;border-radius:8px;padding:11px 15px;font-weight:800;cursor:pointer}.btn:hover{background:#2583d8}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:550px){.grid{grid-template-columns:1fr}.wrap{padding:24px 16px}}`;

export default function ComputerMocks(){
 const [attempted,setAttempted]=useState({});
 useEffect(()=>{
  const a={};
  for(let i=1;i<=17;i++){
   try{a[i]=!!localStorage.getItem(`dm_computer_mock_${i}_attempt`)}catch(e){}
  }
  setAttempted(a);
 },[]);
 return <div className="page"><style>{css}</style><div className="wrap">
  <button className="back" onClick={()=>window.location.href="/paired-home"}>← Back to Mock Tests</button>
  <div className="kicker">COMPUTER AWARENESS</div>
  <div className="head">
   <div><h1>Computer Mock Tests</h1><p>17 mixed-topic mocks • 40 questions each • 15 minutes • 0.25 negative marking</p></div>
   <div className="count">17 Mocks · 680 Questions</div>
  </div>
  <div className="grid">
   {Array.from({length:17},(_,i)=>{
    const n=i+1,done=attempted[n];\n    const releaseAt=new Date(`2026-10-${String(n+1).padStart(2,"0")}T00:00:00+05:30`);\n    const locked=new Date()<releaseAt;\n    const releaseLabel=releaseAt.toLocaleDateString("en-IN",{day:"numeric",month:"short",timeZone:"Asia/Kolkata"});
    return <div className="card" key={n}>
     <span className="badge">{locked?"COMING SOON":done?"ATTEMPTED":"AVAILABLE"}</span>
     <h3>Mock Test {n}</h3>
     {comingSoon
      ? <button className="btn" disabled style={{opacity:.55,cursor:"not-allowed"}}>Coming Soon</button>
      : <button className="btn" onClick={()=>window.location.href="/computer-mock-"+n}>{done?"View Analysis →":"Start Mock →"}</button>}
    </div>;
   })}
  </div>
 </div></div>;
}
