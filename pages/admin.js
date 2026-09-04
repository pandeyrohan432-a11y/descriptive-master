import {useEffect,useMemo,useState} from "react";

const TESTS=[
  "Digital payments and financial inclusion in India","UPI at scale: convenience, inclusion and risks","Cybersecurity in banking and customer trust","Responsible Artificial Intelligence in banking","Digital lending and borrower protection","Deepfakes and financial fraud","Green finance and India's transition","Financial literacy in a digital-first economy","India's economic outlook and structural reforms","Fintech-led financial inclusion without new exclusion"
];
const RELEASES=["4 Sep 2026","6 Sep 2026","8 Sep 2026","10 Sep 2026","12 Sep 2026","14 Sep 2026","16 Sep 2026","18 Sep 2026","20 Sep 2026","22 Sep 2026"];

function readAttempts(){
  if(typeof window==='undefined') return [];
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i); if(!key) continue;
    try{
      const value=JSON.parse(localStorage.getItem(key));
      if(value && typeof value==='object' && (value.total!==undefined || value.score!==undefined || value.essay!==undefined || value.answers!==undefined || value.testIndex!==undefined || value.testId!==undefined)) out.push({key,...value});
    }catch{}
  }
  return out;
}

export default function Admin(){
  const [pass,setPass]=useState('');
  const [ok,setOk]=useState(false);
  const [attempts,setAttempts]=useState([]);
  const [selected,setSelected]=useState(0);
  const [notice,setNotice]=useState('');
  const refresh=()=>setAttempts(readAttempts());
  useEffect(()=>{refresh()},[]);
  const stats=useMemo(()=>({users:new Set(attempts.map(a=>a.phone||a.mobile||a.user?.phone||a.name||a.user?.name||a.key)).size,attempts:attempts.length,scored:attempts.filter(a=>a.total!==undefined||a.score!==undefined).length}),[attempts]);
  if(!ok) return <main className="login"><div className="brand">DESCRIPTIVE MASTER</div><h1>Admin Panel</h1><p>Private administrator area.</p><label>Admin passcode</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter passcode"/><button onClick={()=>{if(pass===process.env.NEXT_PUBLIC_ADMIN_PASS){setOk(true);setNotice('')}}else setNotice('Invalid admin passcode')}}>Login as Admin</button>{notice&&<div className="err">{notice}</div>}<p className="hint">Admin access is controlled separately from student login.</p><style jsx>{styles}</style></main>;
  return <>
    <header><strong>DESCRIPTIVE MASTER — ADMIN</strong><button className="ghost" onClick={()=>setOk(false)}>Logout</button></header>
    <main className="wrap">
      <div className="bar"><div><h1>Admin Dashboard</h1><p>Manage test visibility, inspect available attempt data and preview every mock before release.</p></div><button onClick={()=>{refresh();setNotice('Refreshed')}}>Refresh Data</button></div>
      {notice&&<div className="notice">{notice}</div>}
      <section className="stats"><div><b>{stats.users}</b><span>Students detected</span></div><div><b>{stats.attempts}</b><span>Attempts detected</span></div><div><b>{stats.scored}</b><span>Scored attempts</span></div></section>
      <section className="panel"><h2>Test Control & Preview</h2><div className="tests">{TESTS.map((topic,i)=><div className="test" key={topic}><div><b>Test {i+1}</b><small>Release: {RELEASES[i]}</small><small>{topic}</small></div><span className="adminOpen">ADMIN PREVIEW</span><button onClick={()=>setSelected(i)}>Open</button></div>)}</div></section>
      <section className="panel"><h2>Student Attempts</h2>{attempts.length===0?<div className="empty">No attempt records are available in this browser yet. The current student build stores its session data locally; persistent cross-device analytics will need the database layer.</div>:<div className="tableWrap"><table><thead><tr><th>Student</th><th>Test</th><th>Marks</th><th>Date</th><th>Source</th></tr></thead><tbody>{attempts.map((a,i)=><tr key={i}><td>{a.name||a.user?.name||a.phone||a.mobile||'—'}</td><td>Test {(Number(a.testIndex??a.testId??0)+1)||'—'}</td><td>{a.total??a.score??'—'} / 25</td><td>{a.submittedAt||a.date||a.updatedAt||'—'}</td><td>{a.key}</td></tr>)}</tbody></table></div>}</section>
      <section className="panel"><h2>Admin Preview</h2><div className="preview"><div className="previewHead"><b>Test {selected+1}</b><span>Locked for students until {RELEASES[selected]}</span></div><h3>{TESTS[selected]}</h3><p>Admin preview is intentionally available regardless of the student release date.</p><div className="previewBox">Use this area to verify the complete Test {selected+1} content before publishing. Student access remains controlled by the scheduled release date.</div></div></section>
    </main>
    <style jsx>{styles}</style>
  </>;
}
const styles=`*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;color:#172033}button,input{font:inherit}button{cursor:pointer;border:0;border-radius:8px;padding:11px 16px;font-weight:700;background:#40537d;color:#fff}.login{max-width:430px;margin:90px auto;background:#fff;border:1px solid #d9e0ea;border-radius:16px;padding:30px;box-shadow:0 15px 50px #17203318}.brand{font-weight:800;color:#40537d;letter-spacing:.4px}.login h1{margin:10px 0}.login label{display:block;font-weight:700;margin:22px 0 6px}.login input{width:100%;padding:12px;border:1px solid #cbd3df;border-radius:8px;margin-bottom:12px}.err{margin-top:14px;color:#a52727;background:#fff0f0;padding:10px;border-radius:8px}.hint{font-size:12px;color:#687387}header{height:64px;background:#40537d;color:#fff;padding:0 24px;display:flex;align-items:center;justify-content:space-between}.ghost{background:transparent;border:1px solid #ffffff66}.wrap{max-width:1200px;margin:auto;padding:28px}.bar{display:flex;justify-content:space-between;align-items:center;gap:20px}.bar h1{margin:0 0 5px}.bar p{margin:0;color:#667085}.notice{margin:16px 0;padding:11px 14px;background:#edf7ef;border:1px solid #c9e5ce;border-radius:8px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:22px 0}.stats div,.panel{background:#fff;border:1px solid #d8dfe9;border-radius:14px;padding:20px}.stats b{font-size:28px;display:block}.stats span{color:#687387;font-size:13px}.panel{margin:18px 0}.panel h2{margin-top:0}.tests{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.test{border:1px solid #e0e4eb;border-radius:10px;padding:14px;display:flex;align-items:center;gap:12px}.test>div{flex:1}.test b{display:block}.test small{display:block;color:#687387;margin-top:4px}.adminOpen{font-size:10px;font-weight:800;color:#16753b;background:#e8f7ed;padding:5px 7px;border-radius:999px}.empty{padding:18px;background:#f6f8fb;border-radius:10px;color:#667085}.tableWrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;border-bottom:1px solid #e4e7ec;padding:11px 8px;font-size:13px}.previewHead{display:flex;justify-content:space-between;color:#687387}.preview h3{margin-bottom:8px}.previewBox{padding:24px;background:#f6f8fb;border-radius:10px;color:#4b5565}@media(max-width:800px){.tests,.stats{grid-template-columns:1fr}.bar{align-items:flex-start;flex-direction:column}}`;
