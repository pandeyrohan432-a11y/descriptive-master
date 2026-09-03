 "use client";
import {useEffect,useState} from "react";

export default function ResultView({attempt}:{attempt:any}){
 const [evaluation,setEvaluation]=useState<any>(attempt.evaluation); const [busy,setBusy]=useState(!attempt.evaluation); const [error,setError]=useState("");
 const [rank,setRank]=useState<number|null>(null); const [percentile,setPercentile]=useState<number|null>(null);
 useEffect(()=>{(async()=>{
   if(!attempt.evaluation){
     const r=await fetch(`/api/attempts/${attempt.id}/evaluate`,{method:"POST"});
     const j=await r.json(); if(r.ok)setEvaluation(j.evaluation); else setError(j.error||"Evaluation failed.");
   }
   const r2=await fetch(`/api/leaderboard/${attempt.testId}`); if(r2.ok){const j=await r2.json();const me=j.entries.find((x:any)=>x.attemptId===attempt.id);if(me){setRank(me.rank);setPercentile(me.percentile)}}
   setBusy(false);
 })()},[attempt.id,attempt.evaluation,attempt.testId]);
 if(busy)return <div style={{padding:40,fontFamily:"Arial"}}><h2>Generating your analysis...</h2><p>This demo uses a transparent format/content heuristic. A production AI provider can replace it later.</p></div>;
 if(!evaluation)return <div style={{padding:40}}>Unable to generate result. {error}</div>;
 const feedback=evaluation.feedback||{};
 return <div style={{fontFamily:"Inter,Arial,sans-serif",background:"#f5f7fb",minHeight:"100vh"}}>
   <div style={{background:"#3f517b",color:"#fff",padding:16}}><b>DESCRIPTIVE MASTER</b> · Test {attempt.test.testNo}</div>
   <main style={{maxWidth:1050,margin:"0 auto",padding:28}}>
    <h1>Your Performance</h1><p style={{color:"#667085"}}>Your response has been evaluated and saved.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
      <div style={box}>Total Score<strong>{evaluation.totalScore}/25</strong></div>
      <div style={box}>Essay<strong>{evaluation.essayScore}/15</strong></div>
      <div style={box}>Comprehension<strong>{evaluation.comprehensionScore}/10</strong></div>
      <div style={box}>Rank<strong>{rank?`#${rank}`:"—"}</strong></div>
    </div>
    <div style={{...panel,marginTop:18}}><h2>Writing Analysis</h2>
      <div style={row}><span>Grammar & language</span><b>{evaluation.grammarScore}/5</b></div>
      <div style={row}><span>Relevance</span><b>{evaluation.relevanceScore}/5</b></div>
      <div style={row}><span>Structure</span><b>{evaluation.structureScore}/5</b></div>
    </div>
    <div style={{...panel,marginTop:18}}><h2>Feedback</h2><ul>{(feedback.strengths||[]).map((x:string,i:number)=><li key={i} style={{margin:"10px 0"}}>{x}</li>)}</ul><p>{feedback.essay}</p><p>{feedback.comprehension}</p></div>
    <div style={{...panel,marginTop:18}}><h2>Leaderboard</h2><p>Your percentile: <b>{percentile??"—"}</b></p><a href="/" style={{display:"inline-block",background:"#3f78c3",color:"#fff",padding:"11px 17px",borderRadius:8,textDecoration:"none"}}>Back to Dashboard</a></div>
   </main>
 </div>
}
const box={background:"#fff",border:"1px solid #dde3eb",borderRadius:12,padding:16};
const panel={background:"#fff",border:"1px solid #dde3eb",borderRadius:12,padding:22};
const row={display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #eee"};