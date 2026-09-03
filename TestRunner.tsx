 "use client";
import { useEffect, useMemo, useState } from "react";

export default function TestRunner({test}:{test:any}){
 const [section,setSection]=useState<"essay"|"comp">("essay");
 const [essay,setEssay]=useState(""); const [comp,setComp]=useState<string[]>(Array(test.questions.length).fill(""));
 const [time,setTime]=useState(test.durationMin*60); const [started,setStarted]=useState(false); const [show,setShow]=useState(false); const [submitted,setSubmitted]=useState(false); const [attemptId,setAttemptId]=useState("");
 const count=(s:string)=>s.trim()?s.trim().split(/\s+/).length:0;

 useEffect(()=>{(async()=>{
  const r=await fetch(`/api/attempts/${test.id}/start`,{method:"POST"}); const j=await r.json();
  if(!r.ok)return;
  setAttemptId(j.attempt.id); setEssay(j.attempt.essayAnswer||""); setComp(j.attempt.compAnswers||Array(test.questions.length).fill(""));
  setTime(Math.max(0,j.remainingSec)); setStarted(true);
 })()},[test.id]);

 useEffect(()=>{if(!started||submitted)return; const t=setInterval(()=>setTime(x=>Math.max(0,x-1)),1000);return()=>clearInterval(t)},[started,submitted]);

 useEffect(()=>{if(started&&!submitted&&time===0)submit(true)},[time,started,submitted]);

 useEffect(()=>{if(!attemptId||submitted)return; const t=setTimeout(()=>save(),1000);return()=>clearTimeout(t)},[essay,comp,attemptId]);

 async function save(){
  if(!attemptId)return;
  await fetch(`/api/attempts/${attemptId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({essayAnswer:essay,compAnswers:comp})});
 }
 async function submit(auto=false){
  await fetch(`/api/attempts/${attemptId}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({essayAnswer:essay,compAnswers:comp})});
  setSubmitted(true);
  if(auto) alert("Time is over. Your test has been auto-submitted.");
  else setShow(false);
 }
 const mm=String(Math.floor(time/60)).padStart(2,"0"), ss=String(time%60).padStart(2,"0");

 if(!started)return <div style={{padding:30}}>Loading your attempt...</div>;
 if(submitted)return <div className="login"><h1>Your Response is Submitted</h1><p className="muted">Your attempt has been saved. You can return to the dashboard.</p><a className="btn primary" href="/" style={{textDecoration:"none"}}>Back to Tests</a></div>;

 return <div className="examTop" style={{minHeight:"100vh",display:"block",padding:0}}>
 <div className="examTop"><div><b>DESCRIPTIVE MASTER</b> | IBPS PO</div><div>Time Left: <b>{mm}:{ss}</b></div></div>
 <div className="examLayout"><div className="main"><div className="qtitle">Descriptive Test No {test.testNo}</div>
 <div className="sectionTabs"><button className={`tab ${section==="essay"?"active":""}`} onClick={()=>setSection("essay")}>Essay Writing</button><button className={`tab ${section==="comp"?"active":""}`} onClick={()=>setSection("comp")}>Comprehension</button></div>
 <div className="body">{section==="essay"?<><h3>Question No 1</h3><p><b>Write an essay on - {test.essayPrompt}</b></p><textarea className="answer" value={essay} onChange={e=>setEssay(e.target.value)} /><div className="counter">Words: {count(essay)} / 350</div></>:<><h3>Question No 2</h3><div className="card"><b>Directions:</b> Read the following passage carefully and answer the questions in your own words.<p style={{whiteSpace:"pre-line",lineHeight:1.55}}>{test.passage}</p></div>{test.questions.map((q:any,i:number)=><div key={q.id} style={{margin:"20px 0"}}><p><b>Q{i+1}. {q.prompt}</b></p><textarea className="answer" style={{minHeight:120}} value={comp[i]||""} onChange={e=>{const x=[...comp];x[i]=e.target.value;setComp(x)}}/><div className="counter">Words: {count(comp[i]||"")} / 40</div></div>)}</>}</div>
 <div className="footer"><button className="btn outline" onClick={save}>Save Response</button><div><button className="btn outline" onClick={()=>setSection(section==="essay"?"comp":"essay")}>Save & Next</button><button className="btn primary" onClick={()=>setShow(true)} style={{marginLeft:8}}>Submit</button></div></div></div>
 <aside className="side"><div className="cand"><div className="avatar">●</div><div style={{fontWeight:700,marginTop:10}}>Student</div></div><div className="legend"><div className="sq"><span className="num green">0</span> Answered</div><div className="sq"><span className="num orange">1</span> Not Answered</div><div className="sq"><span className="num">1</span> Not Visited</div><div className="sq"><span className="num purple">0</span> Review</div></div><div className="sect">Essay Writing</div><div className="pqs"><button className={`pq ${section==="essay"?"current":""} ${essay.trim()?"done":""}`} onClick={()=>setSection("essay")}>1</button></div><div className="sect">Comprehension</div><div className="pqs"><button className={`pq ${section==="comp"?"current":""} ${comp.some(Boolean)?"done":""}`} onClick={()=>setSection("comp")}>2</button></div></aside></div>
 {show&&<div className="modal-bg"><div className="modal"><h2>Test Summary</h2><p className="muted">Do you want to submit the test?</p><table className="table"><tbody><tr><th>Section</th><th>Questions</th><th>Answered</th></tr><tr><td>Essay Writing</td><td>1</td><td>{essay.trim()?1:0}</td></tr><tr><td>Comprehension</td><td>1</td><td>{comp.every(Boolean)?1:0}</td></tr></tbody></table><div style={{textAlign:"center"}}><button className="btn outline" onClick={()=>setShow(false)}>Continue Test</button><button className="btn primary" onClick={()=>submit(false)} style={{marginLeft:10}}>Submit</button></div></div></div>}
 </div>
}