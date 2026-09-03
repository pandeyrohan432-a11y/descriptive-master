 "use client";
import { useState } from "react";

export default function Landing(){
 const [phone,setPhone]=useState(""); const [otp,setOtp]=useState(""); const [sent,setSent]=useState(false); const [msg,setMsg]=useState("");
 async function send(){
   setMsg("");
   const r=await fetch("/api/auth/send-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone})});
   const j=await r.json(); if(!r.ok)return setMsg(j.error||"Unable to send OTP");
   setSent(true); setMsg(j.devOtp?`Development OTP: ${j.devOtp}`:"OTP sent to your mobile.");
 }
 async function verify(){
   const r=await fetch("/api/auth/verify-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,otp})});
   const j=await r.json(); if(!r.ok)return setMsg(j.error||"Invalid OTP");
   location.reload();
 }
 return <div className="login"><div className="brand" style={{color:"#3f517b"}}>DESCRIPTIVE MASTER</div><h1>Student Login</h1><p className="muted">IBPS PO Descriptive Practice</p>
   <label>Mobile Number</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number"/>
   {!sent?<button className="btn primary" style={{width:"100%"}} onClick={send}>Send OTP</button>:
   <><label>OTP</label><input className="input" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Enter OTP"/><button className="btn primary" style={{width:"100%"}} onClick={verify}>Verify & Continue</button></>}
   {msg&&<p className="muted" style={{marginTop:12}}>{msg}</p>}
 </div>
}