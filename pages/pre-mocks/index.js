import {useEffect,useState} from 'react';
import {loadSbiClerk2025} from '../../data/pre_mock_data';

export default function PreMocks(){
  const [ready,setReady]=useState(false);
  useEffect(()=>{loadSbiClerk2025().then(()=>setReady(true)).catch(()=>{});},[]);
  return <main style={{minHeight:'100vh',background:'#f5f8fc',padding:'32px 18px',fontFamily:'Arial,sans-serif'}}>
    <div style={{maxWidth:900,margin:'0 auto'}}>
      <a href="/" style={{color:'#315d9b',textDecoration:'none',fontWeight:700}}>← Back to Descriptive Master</a>
      <div style={{background:'#fff',borderRadius:20,padding:'30px',marginTop:18,boxShadow:'0 10px 35px rgba(30,55,90,.10)'}}>
        <div style={{display:'inline-block',background:'#eaf1ff',color:'#315d9b',padding:'7px 12px',borderRadius:999,fontWeight:800,fontSize:12}}>PRE MOCKS</div>
        <h1 style={{margin:'14px 0 8px',color:'#17233c'}}>SBI Clerk 2025 Memory Based Paper</h1>
        <p style={{color:'#5d687a',fontSize:16,lineHeight:1.6}}>Full-length prelims mock based on the uploaded memory-based paper. 100 questions • 60 minutes • English + Numerical Ability + Reasoning.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'20px 0'}}>
          {['100 Questions','60 Minutes','+1 Correct','−0.25 Wrong','Detailed Solutions'].map(x=><span key={x} style={{background:'#f1f4f8',padding:'9px 12px',borderRadius:10,fontSize:13,fontWeight:700,color:'#3c4658'}}>{x}</span>)}
        </div>
        <div style={{background:'#fff8e7',border:'1px solid #f1d58a',padding:14,borderRadius:12,color:'#6b5317',fontSize:13,lineHeight:1.5,marginBottom:20}}><b>Note:</b> This is a recollected paper. The source PDF's answer key is used for scoring, and a few recollected items may contain source/key inconsistencies.</div>
        <a href="/pre-mocks/sbi-clerk-2025" style={{display:'inline-block',background:'#315d9b',color:'#fff',padding:'13px 22px',borderRadius:12,textDecoration:'none',fontWeight:800}}>{ready?'Start Mock →':'Start Mock →'}</a>
      </div>
    </div>
  </main>;
}
