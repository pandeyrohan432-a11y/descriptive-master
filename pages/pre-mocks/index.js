import {useState} from 'react';

const exams=[
  {id:'sbi-clerk',name:'SBI Clerk',sub:'Prelims'},
  {id:'ibps-clerk',name:'IBPS Clerk',sub:'Prelims'},
  {id:'rrb-clerk',name:'IBPS RRB Clerk',sub:'Prelims'},
  {id:'rrb-po',name:'IBPS RRB PO',sub:'Prelims'},
  {id:'nicl-assistant',name:'NICL Assistant',sub:'Prelims'}
];

export default function PreMocks(){
  const [selected,setSelected]=useState('sbi-clerk');
  const exam=exams.find(x=>x.id===selected)||exams[0];
  const mocks=Array.from({length:8},(_,i)=>({
    n:i+1,
    title:selected==='sbi-clerk' && i===0?'SBI Clerk 2025 Memory Based Paper':`${exam.name} Prelims Mock ${i+1}`,
    active:selected==='sbi-clerk' && i===0
  }));

  return <main style={{minHeight:'100vh',background:'#f5f8fc',fontFamily:'Arial,sans-serif',color:'#17233c'}}>
    <header style={{height:70,background:'#fff',borderBottom:'1px solid #e5eaf0',display:'flex',alignItems:'center',padding:'0 28px',position:'sticky',top:0,zIndex:10}}>
      <a href="/" style={{textDecoration:'none',fontWeight:900,fontSize:20,color:'#17345f'}}>Descriptive Master</a>
      <div style={{marginLeft:24,height:28,width:1,background:'#dfe5ec'}}/>
      <span style={{marginLeft:20,fontWeight:800,color:'#315d9b'}}>PRE MOCKS</span>
      <a href="/" style={{marginLeft:'auto',color:'#536176',textDecoration:'none',fontWeight:700}}>← Home</a>
    </header>

    <div style={{maxWidth:1250,margin:'0 auto',padding:'30px 20px 60px'}}>
      <div style={{marginBottom:22}}>
        <div style={{fontSize:13,fontWeight:800,color:'#315d9b',letterSpacing:1}}>BANKING & INSURANCE</div>
        <h1 style={{fontSize:30,margin:'8px 0 6px'}}>Prelims Mock Tests</h1>
        <p style={{margin:0,color:'#697588',fontSize:15}}>Choose your exam and practice with focused mock tests.</p>
      </div>

      <section style={{background:'#fff',borderRadius:18,padding:'20px 18px',boxShadow:'0 8px 28px rgba(30,55,90,.07)',marginBottom:24}}>
        <h2 style={{fontSize:17,margin:'0 0 16px'}}>Choose Exam</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10}}>
          {exams.map(x=><button key={x.id} onClick={()=>setSelected(x.id)} style={{border:selected===x.id?'2px solid #315d9b':'1px solid #e1e7ee',background:selected===x.id?'#eef4ff':'#fff',borderRadius:13,padding:'13px 10px',cursor:'pointer',textAlign:'left'}}>
            <div style={{fontWeight:800,fontSize:14,color:'#24344f'}}>{x.name}</div>
            <div style={{fontSize:11,color:selected===x.id?'#315d9b':'#8792a2',marginTop:4}}>{x.sub}</div>
          </button>)}
        </div>
      </section>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div><h2 style={{fontSize:21,margin:0}}>{exam.name} — {exam.sub}</h2><div style={{fontSize:13,color:'#788496',marginTop:4}}>Showing first 8 mocks</div></div>
        <span style={{background:'#eaf1ff',color:'#315d9b',padding:'7px 11px',borderRadius:999,fontSize:12,fontWeight:800}}>8 MOCKS</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:16}}>
        {mocks.map(m=><div key={m.n} style={{background:'#fff',borderRadius:16,padding:20,border:'1px solid #e6ebf1',boxShadow:'0 5px 18px rgba(30,55,90,.05)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,fontWeight:800,color:'#315d9b',background:'#eef4ff',padding:'6px 9px',borderRadius:8}}>MOCK {m.n}</span>
            {m.active?<span style={{fontSize:11,fontWeight:800,color:'#1d7b4f'}}>AVAILABLE</span>:<span style={{fontSize:11,fontWeight:800,color:'#8a95a5'}}>COMING SOON</span>}
          </div>
          <h3 style={{fontSize:16,lineHeight:1.35,margin:'16px 0 8px'}}>{m.title}</h3>
          <div style={{fontSize:12,color:'#748093',marginBottom:18}}>100 Questions • 60 Minutes • Prelims</div>
          {m.active?<a href="/pre-mocks/sbi-clerk-2025" style={{display:'block',textAlign:'center',background:'#315d9b',color:'#fff',padding:'11px 12px',borderRadius:10,textDecoration:'none',fontWeight:800,fontSize:14}}>Start Mock →</a>:<button disabled style={{width:'100%',background:'#f0f2f5',color:'#9aa4b2',border:0,padding:'11px 12px',borderRadius:10,fontWeight:800,fontSize:14}}>Locked / Coming Soon</button>}
        </div>)}
      </div>
    </div>
  </main>;
}
