 "use client";
import { useState } from "react";
export default function ProfileForm({initialName="",initialExam="IBPS PO"}:{initialName?:string;initialExam?:string}){
 const [name,setName]=useState(initialName),[exam,setExam]=useState(initialExam),[msg,setMsg]=useState("");
 async function save(){
  const r=await fetch("/api/profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,examTarget:exam})});
  if(!r.ok){const j=await r.json();return setMsg(j.error||"Unable to save")}
  location.reload();
 }
 return <div className="login"><h1>Complete Profile</h1><label>Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /><label>Exam Target</label><input className="input" value={exam} onChange={e=>setExam(e.target.value)} /><button className="btn primary" style={{width:"100%"}} onClick={save}>Continue to Dashboard</button>{msg&&<p className="muted">{msg}</p>}</div>
}