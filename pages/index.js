import { useEffect, useState } from "react";

const TOPICS = [
  "Digital payments and financial inclusion in India",
  "UPI at scale: convenience, inclusion and risks",
  "Cybersecurity in banking and customer trust",
  "Responsible Artificial Intelligence in banking",
  "Digital lending and borrower protection",
  "Deepfakes and financial fraud",
  "Green finance and India's transition",
  "Financial literacy in a digital-first economy",
  "India's economic outlook and structural reforms",
  "Fintech-led financial inclusion without new exclusion"
];

const PASSAGE = `Digital financial services can expand access by reducing distance, time and transaction costs. Yet access alone does not guarantee meaningful inclusion. Users may still face digital illiteracy, poor connectivity, fraud risk or difficulty understanding financial products. A resilient system therefore combines technology with trust, accessible support, effective grievance redressal and responsible regulation. Banks and fintech firms need to design services for first-time users as well as experienced digital customers. The broader lesson is that convenience should reinforce, not weaken, safety and informed choice.`;
const Q = [
  "What is the central idea of the passage?",
  "What major challenge or risk does the passage identify?",
  "What approach does the passage suggest for addressing the challenge?",
  "Why is the issue important for customers or the wider financial system?",
  "What broader lesson can be drawn from the passage?"
];

// Test 1 is live now. Every following test opens on alternate days.
// Test 2: 6 Sep 2026, Test 3: 8 Sep 2026 ... Test 10: 22 Sep 2026.
const RELEASE_DATES = [
  "2026-09-04",
  "2026-09-06",
  "2026-09-08",
  "2026-09-10",
  "2026-09-12",
  "2026-09-14",
  "2026-09-16",
  "2026-09-18",
  "2026-09-20",
  "2026-09-22"
];

const styles = `
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;color:#172033}button,input,textarea{font:inherit}button{cursor:pointer}.top{height:64px;background:#40537d;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 22px}.brand{font-weight:800;letter-spacing:.2px}.wrap{max-width:1250px;margin:auto;padding:28px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{background:#fff;border:1px solid #c3d6ec;border-radius:16px;padding:20px;box-shadow:0 3px 12px rgba(25,45,80,.06)}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:17px 0;font-size:14px}.btn{border:0;border-radius:8px;padding:11px 17px;font-weight:700}.primary{background:#3d78c2;color:#fff}.primary:disabled{background:#b7c2d2;color:#fff;cursor:not-allowed}.outline{background:#fff;color:#34415f;border:1px solid #9eabc0}.login{max-width:430px;margin:70px auto;background:#fff;border:1px solid #dce2ea;border-radius:16px;padding:30px;box-shadow:0 18px 55px rgba(20,35,65,.1)}.input{width:100%;padding:12px;border:1px solid #cbd3df;border-radius:8px;margin:7px 0 15px}.release{margin-top:14px;padding:10px 12px;border-radius:9px;background:#f3f6fa;color:#4c5870;font-size:13px}.live{display:inline-block;background:#e8f7ed;color:#16753b;border:1px solid #bfe4cb;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800}.locked{display:inline-block;background:#f1f3f7;color:#687387;border:1px solid #d8dde5;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:800}.inst{background:#fff;min-height:100vh}.instTitle{background:#40537d;color:#fff;text-align:center;font-weight:700;padding:14px;font-size:19px}.instGrid{display:grid;grid-template-columns:1fr 270px}.instMain{padding:28px;border-right:1px solid #ddd}.table{border-collapse:collapse}.table td,.table th{border:1px solid #ccd2dc;padding:9px 15px}.examTop{height:50px;background:#40537d;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 18px}.examHead{height:60px;background:#fff;border-bottom:1px solid #d8dce4;display:flex;justify-content:space-between;align-items:center;padding:0 15px}.tabs{display:flex}.tab{border:1px solid #cbd1dc;background:#697691;color:#fff;padding:12px 18px}.tab.on{background:#40537d}.examGrid{display:grid;grid-template-columns:1fr 270px;min-height:calc(100vh - 110px)}.main{display:flex;flex-direction:column;background:#fff;border-right:1px solid #ccd1da}.qtitle{padding:14px;border-bottom:1px solid #ddd;font-weight:700}.body{padding:18px 28px;overflow:auto;flex:1}.essay{width:100%;min-height:440px;border:2px solid #333;padding:10px;resize:vertical}.wc{text-align:right;background:#eef0f4;padding:6px;font-size:12px}.passage{background:#fbfcfe;border:1px solid #e0e4eb;border-radius:7px;padding:15px;line-height:1.55}.cq{margin:20px 0}.cq textarea{width:100%;min-height:95px;margin-top:8px;padding:9px}.footer{display:flex;justify-content:space-between;padding:10px 15px;border-top:1px solid #ddd}.side{background:#fff}.candidate{text-align:center;padding:18px;border-bottom:1px solid #ddd}.avatar{width:82px;height:82px;border-radius:50%;background:#ddd;margin:auto;display:flex;align-items:center;justify-content:center;color:#666;font-size:34px}.legend{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px;font-size:12px}.sect{background:#40537d;color:#fff;padding:10px;text-align:center;font-weight:700}.pqs{padding:14px}.pq{width:42px;height:34px;border:0;background:#eee;border-radius:5px}.current{background:#ef6925;color:#fff}.modalBg{position:fixed;inset:0;background:rgba(0,0,0,.38);display:flex;align-items:center;justify-content:center;z-index:50}.modal{background:#fff;width:min(800px,92vw);border-radius:12px;padding:25px;box-shadow:0 30px 90px rgba(0,0,0,.25)}.center{text-align:center}.resultGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}@media(max-width:900px){.grid{grid-template-columns:1fr 1fr}.examGrid,.instGrid{grid-template-columns:1fr}.side{display:none}}@media(max-width:600px){.grid,.resultGrid{grid-template-columns:1fr}.wrap{padding:14px}.body,.instMain{padding:14px}.essay{min-height:340px}}
`;

const countWords = s => (s.trim() ? s.trim().split(/\s+/).length : 0);

function isAvailable(index){
  const today = new Date();
  today.setHours(0,0,0,0);
  const release = new Date(`${RELEASE_DATES[index]}T00:00:00`);
  return today >= release;
}

function formatReleaseDate(index){
  const d = new Date(`${RELEASE_DATES[index]}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

export default function Home(){
 const [view,setView]=useState("login");
 const [phone,setPhone]=useState("");
 const [otp,setOtp]=useState("");
 const [otpSent,setOtpSent]=useState(false);
 const [name,setName]=useState("");
 const [examTarget,setExamTarget]=useState("IBPS PO");
 const [test,setTest]=useState(1);
 const [section,setSection]=useState("essay");
 const [agree,setAgree]=useState(false);
 const [time,setTime]=useState(1800);
 const [essay,setEssay]=useState("");
 const [comp,setComp]=useState(["","","","",""]);
 const [summary,setSummary]=useState(false);
 const [now,setNow]=useState(Date.now());

 useEffect(()=>{
   if(typeof window!=="undefined" && localStorage.getItem("dm_logged")==="1"){
     setName(localStorage.getItem("dm_name")||"Student");
     setPhone(localStorage.getItem("dm_phone")||"");
     setView("dashboard");
   }
 },[]);
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(id)},[]);
 useEffect(()=>{if(view!=="exam")return;const id=setInterval(()=>setTime(x=>Math.max(0,x-1)),1000);return()=>clearInterval(id)},[view]);
 useEffect(()=>{if(view==="exam"&&time===0)setSummary(true)},[time,view]);

 function verify(){
   if(otp!=="123456")return alert("Demo OTP is 123456");
   setView("profile");
 }
 function saveProfile(){
   if(name.trim().length<2)return alert("Please enter your name");
   localStorage.setItem("dm_logged","1");localStorage.setItem("dm_name",name.trim());localStorage.setItem("dm_phone",phone);
   setView("dashboard");
 }
 function start(n){
   if(!isAvailable(n-1))return alert(`Test ${n} will be available on ${formatReleaseDate(n-1)}.`);
   setTest(n);setAgree(false);setSection("essay");setTime(1800);setEssay("");setComp(["","","","",""]);setView("instructions");
 }
 function begin(){if(!agree)return alert("Please tick the declaration before starting.");setView("exam")}
 const mm=String(Math.floor(time/60)).padStart(2,"0"),ss=String(time%60).padStart(2,"0");

 if(view==="login")return <><style>{styles}</style><div className="login"><div className="brand" style={{color:"#40537d"}}>DESCRIPTIVE MASTER</div><h1>Student Login</h1><p style={{color:"#697386"}}>IBPS PO Descriptive Practice</p><label>Mobile Number</label><input className="input" value={phone} maxLength={10} inputMode="numeric" onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit mobile number"/>{!otpSent?<button className="btn primary" style={{width:"100%"}} onClick={()=>{if(phone.length!==10)return alert("Enter valid 10-digit mobile number");setOtpSent(true)}}>Send OTP</button>:<><label>OTP</label><input className="input" value={otp} maxLength={6} inputMode="numeric" onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Enter OTP"/><p style={{fontSize:12,color:"#697386"}}>Demo OTP: 123456</p><button className="btn primary" style={{width:"100%"}} onClick={verify}>Verify & Continue</button></>}</div></>;

 if(view==="profile")return <><style>{styles}</style><div className="login"><div className="brand" style={{color:"#40537d"}}>DESCRIPTIVE MASTER</div><h1>Complete Profile</h1><label>Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/><label>Exam Target</label><input className="input" value={examTarget} onChange={e=>setExamTarget(e.target.value)} /><button className="btn primary" style={{width:"100%"}} onClick={saveProfile}>Continue to Dashboard</button></div></>;

 if(view==="dashboard")return <><style>{styles}</style><div className="top"><div className="brand">DESCRIPTIVE MASTER</div><div>{name||"Student"}</div></div><div className="wrap"><h1>Descriptive Test</h1><p style={{color:"#697386"}}>IBPS PO • Essay + Comprehension • 25 Marks • 30 Minutes</p><div className="grid">{Array.from({length:10},(_,i)=>{const available=isAvailable(i);return <div className="card" key={i}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><h3 style={{margin:0}}>Descriptive Test No {i+1}</h3>{available?<span className="live">AVAILABLE</span>:<span className="locked">LOCKED</span>}</div><div style={{marginTop:10}}>IBPS PO</div><div className="meta"><span>❔ 2 Qs</span><span>✓ 25 Marks</span><span>◷ 30 Mins</span><span>◉ English</span></div>{available?<div className="release">Available now</div>:<div className="release">Available on <b>{formatReleaseDate(i)}</b></div>}<button className="btn primary" style={{width:"100%",marginTop:12}} disabled={!available} onClick={()=>start(i+1)}>→ {available?(i===0?"Start Now":"Start Test"):"Locked"}</button></div>})}</div></div></>;

 if(view==="instructions")return <><style>{styles}</style><div className="inst"><div className="instTitle">Descriptive Test No {test}</div><div className="instGrid"><main className="instMain"><h2>Instructions</h2><h3>Duration & Auto-Submission</h3><ul><li>Total duration: <b>30 minutes</b>.</li><li>The timer shows remaining time.</li><li>At zero the test will be auto-submitted.</li></ul><h3>Test Structure</h3><table className="table"><tbody><tr><th>Section</th><th>Questions</th><th>Marks</th></tr><tr><td>Essay Writing</td><td>1</td><td>15</td></tr><tr><td>Comprehension</td><td>1</td><td>10</td></tr></tbody></table><h3>Declaration</h3><label><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/> I have read and understood the instructions.</label><div style={{display:"flex",justifyContent:"space-between",marginTop:25}}><button className="btn outline" onClick={()=>setView("dashboard")}>‹ Previous</button><button className="btn primary" onClick={begin}>I am ready to begin</button></div></main><aside className="candidate"><div className="avatar">●</div><h3>{name||"Student"}</h3><p>{phone}</p></aside></div></div></>;

 if(view==="exam")return <><style>{styles}</style><div className="examTop"><b>DESCRIPTIVE MASTER | IBPS PO</b><b>Time Left: {mm}:{ss}</b></div><div className="examHead"><div className="tabs"><button className={'tab '+(section==='essay'?'on':'')} onClick={()=>setSection('essay')}>Essay Writing ⓘ</button><button className={'tab '+(section==='comp'?'on':'')} onClick={()=>setSection('comp')}>Comprehension ⓘ</button></div><b>25 Marks</b></div><div className="examGrid"><main className="main"><div className="qtitle">Question No {section==='essay'?1:2}</div><div className="body">{section==='essay'?<><h3>Write an essay on - {TOPICS[test-1]}</h3><textarea className="essay" value={essay} onChange={e=>setEssay(e.target.value)} placeholder="Type your answer here..."/><div className="wc">Words: {countWords(essay)} / 350</div></>:<><h3>Directions: Read the following passage carefully and answer the questions.</h3><div className="passage">{PASSAGE}</div>{Q.map((q,i)=><div className="cq" key={i}><b>Q{i+1}. {q}</b><textarea value={comp[i]} onChange={e=>{const a=[...comp];a[i]=e.target.value;setComp(a)}} placeholder="Write your answer in 30–40 words..."/><div className="wc">Words: {countWords(comp[i])} / 40</div></div>)}</>}</div><div className="footer"><button className="btn outline" onClick={()=>section==='essay'?setEssay(""):setComp(["","","","",""])}>Clear Response</button><div><button className="btn outline" onClick={()=>setSection(section==='essay'?'comp':'essay')}>Save & Next</button><button className="btn primary" style={{marginLeft:8}} onClick={()=>setSummary(true)}>SUBMIT</button></div></div></main><aside className="side"><div className="candidate"><div className="avatar">●</div><b>{name||"Student"}</b></div><div className="legend"><span>🟩 Answered</span><span>🟧 Not Answered</span><span>⬜ Not Visited</span><span>🟪 Review</span></div><div className="sect">Essay Writing</div><div className="pqs"><button className={'pq '+(section==='essay'?'current':'')} onClick={()=>setSection('essay')}>1</button></div><div className="sect">Comprehension</div><div className="pqs"><button className={'pq '+(section==='comp'?'current':'')} onClick={()=>setSection('comp')}>2</button></div></aside></div>{summary&&<div className="modalBg"><div className="modal"><h2 className="center">Test Summary</h2><p className="center">Do you want to submit the test?</p><table className="table" style={{width:"100%"}}><tbody><tr><th>Section</th><th>Questions</th><th>Answered</th></tr><tr><td>Essay Writing</td><td>1</td><td>{essay.trim()?1:0}</td></tr><tr><td>Comprehension</td><td>1</td><td>{comp.some(Boolean)?1:0}</td></tr></tbody></table><div className="center"><button className="btn outline" onClick={()=>setSummary(false)}>Continue Test</button><button className="btn primary" style={{marginLeft:8}} onClick={()=>{setSummary(false);setView('result')}}>Submit</button></div></div></div>}</>;

 return <><style>{styles}</style><div className="top"><div className="brand">DESCRIPTIVE MASTER</div><div>Test {test} Result</div></div><main className="wrap"><div className="card"><h1>Your Result is Ready</h1><p style={{color:"#697386"}}>Your response has been saved successfully.</p><div className="resultGrid"><div className="card"><b>Essay Words</b><h2>{countWords(essay)}</h2><small>Target 250–350</small></div><div className="card"><b>Comprehension</b><h2>{comp.filter(Boolean).length}/5</h2><small>Answers attempted</small></div><div className="card"><b>Test</b><h2>{test}</h2><small>Descriptive Master</small></div></div><div style={{marginTop:18}}><button className="btn primary" onClick={()=>setView("dashboard")}>Back to Tests</button></div></div></main></>;
}
