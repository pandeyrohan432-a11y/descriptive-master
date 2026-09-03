 "use client";
import {useState} from "react";

type Q={number:number,prompt:string,marks:number};
type T={id:string,testNo:number,title:string,exam:string,durationMin:number,maxMarks:number,essayPrompt:string,passage:string,published:boolean,questions:Q[]};

export default function AdminPanel({initialTests}:{initialTests:T[]}){
 const [tests,setTests]=useState(initialTests);
 const [selected,setSelected]=useState<T|null>(null);
 const [msg,setMsg]=useState("");

 function newTest(){
   const next=(tests.at(-1)?.testNo||0)+1;
   setSelected({id:"",testNo:next,title:`Descriptive Test No ${next}`,exam:"IBPS PO",durationMin:30,maxMarks:25,essayPrompt:"",passage:"",published:false,questions:[
     {number:1,prompt:"What is the central idea of the passage?",marks:2},
     {number:2,prompt:"What major challenge or risk does the passage identify?",marks:2},
     {number:3,prompt:"What approach does the passage suggest for addressing the challenge?",marks:2},
     {number:4,prompt:"Why is the issue important for customers or the wider financial system?",marks:2},
     {number:5,prompt:"What broader lesson can be drawn from the passage?",marks:2}
   ]});
 }
 async function save(){
   if(!selected)return;
   setMsg("Saving...");
   const r=await fetch("/api/admin/tests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(selected)});
   const j=await r.json();
   if(!r.ok){setMsg(j.error||"Save failed");return}
   setTests(j.tests); setSelected(j.test); setMsg("Saved successfully.");
 }
 async function remove(id:string){
   if(!confirm("Delete this test? This cannot be undone."))return;
   const r=await fetch(`/api/admin/tests/${id}`,{method:"DELETE"});
   const j=await r.json();
   if(r.ok){setTests(j.tests);setSelected(null);setMsg("Deleted.");} else setMsg(j.error||"Delete failed");
 }
 function patch<K extends keyof T>(k:K,v:T[K]){if(selected)setSelected({...selected,[k]:v})}
 return <div style={{fontFamily:"Inter,Arial,sans-serif",background:"#f5f7fb",minHeight:"100vh",color:"#18202f"}}>
  <div style={{background:"#3f517b",color:"#fff",padding:"16px 24px",display:"flex",justifyContent:"space-between"}}>
   <b>DESCRIPTIVE MASTER — ADMIN</b><a href="/" style={{color:"#fff"}}>Student Dashboard</a>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"300px 1fr",minHeight:"calc(100vh - 57px)"}}>
   <aside style={{background:"#fff",borderRight:"1px solid #ddd",padding:20}}>
    <button onClick={newTest} style={{width:"100%",padding:12,border:0,borderRadius:8,background:"#3978c7",color:"#fff",fontWeight:700}}>+ Create New Test</button>
    <h3>Tests</h3>
    {tests.map(t=><button key={t.id} onClick={()=>setSelected(t)} style={{display:"block",width:"100%",textAlign:"left",padding:13,margin:"7px 0",border:"1px solid #d7dce5",borderRadius:8,background:selected?.id===t.id?"#eef3fb":"#fff"}}>
      <b>Test {t.testNo}</b><div style={{fontSize:12,color:"#6d7686"}}>{t.published?"Published":"Draft"}</div>
    </button>)}
   </aside>
   <main style={{padding:28,maxWidth:1000}}>
    {!selected?<><h1>Content Management</h1><p style={{color:"#667085"}}>Create, edit and publish descriptive tests without changing code.</p></>:
    <div style={{background:"#fff",border:"1px solid #dde3eb",borderRadius:14,padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h1 style={{marginTop:0}}>Test {selected.testNo}</h1><label>Published <input type="checkbox" checked={selected.published} onChange={e=>patch("published",e.target.checked)}/></label></div>
      <label>Essay Topic</label><textarea value={selected.essayPrompt} onChange={e=>patch("essayPrompt",e.target.value)} style={{width:"100%",minHeight:90,margin:"7px 0 18px"}}/>
      <label>Comprehension Passage</label><textarea value={selected.passage} onChange={e=>patch("passage",e.target.value)} style={{width:"100%",minHeight:260,margin:"7px 0 18px"}}/>
      <h3>5 Questions</h3>
      {selected.questions.map((q,i)=><div key={q.number} style={{marginBottom:14}}><label>Q{i+1}</label><textarea value={q.prompt} onChange={e=>{
         const qs=selected.questions.map(x=>x.number===q.number?{...x,prompt:e.target.value}:x);setSelected({...selected,questions:qs})
      }} style={{width:"100%",minHeight:70,marginTop:5}}/></div>)}
      <div style={{display:"flex",gap:10,alignItems:"center"}}><button onClick={save} style={{padding:"11px 18px",border:0,borderRadius:8,background:"#3978c7",color:"#fff",fontWeight:700}}>Save Test</button>{selected.id&&<button onClick={()=>remove(selected.id)} style={{padding:"11px 18px",border:"1px solid #d85a3f",borderRadius:8,background:"#fff",color:"#bd442b",fontWeight:700}}>Delete</button>}<span style={{color:"#667085"}}>{msg}</span></div>
    </div>}
   </main>
  </div>
 </div>
}