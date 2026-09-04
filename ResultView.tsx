 "use client";
import {useEffect,useState} from "react";

export default function ResultView({attempt}:{attempt:any}){
 const [evaluation,setEvaluation]=useState<any>(attempt.evaluation); const [busy,setBusy]=useState(!attempt.evaluation); const [error,setError]=useState("");
 const [showSolutions,setShowSolutions]=useState(false);
 useEffect(()=>{(async()=>{
   try{
    if(!attempt.evaluation){
      const test=attempt.test||{};
      const r=await fetch(`/api/ai-evaluate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
       essayTopic:test.essayPrompt||test.essayTopic||"",
       essay:attempt.essayAnswer||"",
       passage:test.passage||"",
       questions:(test.questions||[]).map((q:any)=>q.prompt||q.question||q),
       compAnswers:attempt.compAnswers||[]
      })});
      const j=await r.json(); if(r.ok)setEvaluation(j.evaluation); else setError(j.error||"AI evaluation failed.");
    }
   }catch(e){setError("Unable to connect to the AI evaluator.")}
   finally{setBusy(false)}
 })()},[attempt.id,attempt.evaluation]);
 if(busy)return <div style={{padding:40,fontFamily:"Arial",textAlign:"center"}}><h2>Evaluating your answers with AI…</h2><p style={{color:"#667085"}}>Checking content, relevance, structure, grammar and each comprehension answer.</p></div>;
 if(!evaluation)return <div style={{padding:40,fontFamily:"Arial"}}><h2>Evaluation unavailable</h2><p>{error}</p></div>;
 const e=evaluation.essay||{}; const b=e.breakdown||{}; const comp=evaluation.comprehension||[];
 return <div style={{fontFamily:"Inter,Arial,sans-serif",background:"#f5f7fb",minHeight:"100vh"}}>
   <div style={{background:"#3f517b",color:"#fff",padding:16}}><b>DESCRIPTIVE MASTER</b> · Test {attempt.test?.testNo||"—"}</div>
   <main style={{maxWidth:1100,margin:"0 auto",padding:28}}>
    <h1>Your Performance</h1><p style={{color:"#667085"}}>AI evaluation completed. Every answer has been checked individually.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      <Score title="Total Score" value={`${evaluation.totalScore}/25`} />
      <Score title="Essay" value={`${evaluation.essayScore}/15`} />
      <Score title="Comprehension" value={`${evaluation.comprehensionScore}/10`} />
    </div>

    <section style={panel}><h2>Essay Evaluation — {e.score}/15</h2>
      <div style={grid}>
       <Metric label="Relevance" value={`${b.relevance??0}/4`} /><Metric label="Structure & Coherence" value={`${b.structure??0}/3`} /><Metric label="Arguments / Depth" value={`${b.arguments??0}/3`} /><Metric label="Grammar & Language" value={`${b.grammar??0}/3`} /><Metric label="Vocabulary / Expression" value={`${b.vocabulary??0}/2`} />
      </div>
      <Block title="What you did well" items={e.whatWasGood}/>
      <Block title="What went wrong / where marks were lost" items={e.whatWasWrong}/>
      <Block title="What you can do better next time" items={e.improvements}/>
    </section>

    <section style={panel}><h2>Comprehension — Question-wise Evaluation</h2>
      {comp.map((x:any,i:number)=><div key={i} style={{borderTop:"1px solid #e5e7eb",padding:"20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:15}}><h3 style={{margin:"0 0 8px"}}>Question {i+1}</h3><b style={{fontSize:18}}>{x.score}/2</b></div>
        <p style={label}>Your answer <span style={badge}>{x.wordCount} words</span></p>
        <div style={answer}>{x.studentAnswer||"No answer attempted."}</div>
        <p style={label}>What was correct</p><p>{x.whatWasRight||"—"}</p>
        <p style={label}>What was wrong / missing</p><p>{x.whatWasWrong||"—"}</p>
        <p style={label}>What should have been written</p><div style={solution}>{x.idealAnswer||"—"}</div>
        <small style={{color:"#667085"}}>{x.wordLimitStatus}</small>
      </div>)}
    </section>

    <section style={panel}><h2>Overall Feedback</h2><p>{evaluation.overallFeedback}</p><Block title="Key improvements for your next test" items={evaluation.keyImprovements}/></section>

    <section style={panel}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:15}}><div><h2 style={{margin:"0 0 5px"}}>Complete Solutions</h2><p style={{margin:0,color:"#667085"}}>See the model essay and ideal answers for all 5 comprehension questions.</p></div><button style={btn} onClick={()=>setShowSolutions(!showSolutions)}>{showSolutions?"Hide Solutions":"View Solutions"}</button></div>
      {showSolutions&&<div style={{marginTop:22}}><h3>Model Essay</h3><div style={solution}>{e.modelAnswer||"Model essay not available."}</div><h3 style={{marginTop:25}}>Comprehension Solutions</h3>{comp.map((x:any,i:number)=><div key={i} style={{margin:"18px 0"}}><b>Q{i+1}. Ideal Answer</b><div style={{...solution,marginTop:8}}>{x.idealAnswer}</div></div>)}</div>}
    </section>
    <a href="/" style={{display:"inline-block",background:"#3f78c3",color:"#fff",padding:"11px 17px",borderRadius:8,textDecoration:"none"}}>Back to Dashboard</a>
   </main>
 </div>
}
function Score({title,value}:{title:string,value:string}){return <div style={box}><span style={{color:"#667085"}}>{title}</span><strong style={{display:"block",fontSize:28,marginTop:8}}>{value}</strong></div>}
function Metric({label,value}:{label:string,value:string}){return <div style={{background:"#f8fafc",border:"1px solid #e5e7eb",borderRadius:10,padding:13}}><span style={{color:"#667085",fontSize:13}}>{label}</span><b style={{display:"block",marginTop:5}}>{value}</b></div>}
function Block({title,items}:{title:string,items:any[]}){return <div style={{marginTop:18}}><h3>{title}</h3><ul>{(items||[]).map((x:any,i:number)=><li key={i} style={{margin:"9px 0",lineHeight:1.5}}>{x}</li>)}</ul></div>}
const box={background:"#fff",border:"1px solid #dde3eb",borderRadius:12,padding:18};
const panel={...box,marginTop:18};
const grid={display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,margin:"15px 0 10px"};
const answer={background:"#fafafa",border:"1px solid #e5e7eb",borderRadius:9,padding:14,lineHeight:1.6,whiteSpace:"pre-wrap" as const};
const solution={background:"#f7f9fc",borderLeft:"4px solid #3f517b",borderRadius:6,padding:15,lineHeight:1.65,whiteSpace:"pre-wrap" as const};
const label={fontWeight:700,marginBottom:7};
const badge={fontWeight:600,fontSize:12,background:"#eef2ff",padding:"3px 8px",borderRadius:999,marginLeft:8};
const btn={border:0,borderRadius:8,padding:"11px 16px",fontWeight:700,background:"#3f78c3",color:"#fff",cursor:"pointer"};
