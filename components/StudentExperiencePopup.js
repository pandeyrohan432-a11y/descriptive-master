import {useEffect,useState} from 'react';

const STORIES=[
  {name:'Aman Verma',exam:'IBPS PO Mains',score:'20/25',place:'Patna, Bihar',study:'B.Tech (CSE)',avatar:'👨🏽‍💻',quote:'Regular descriptive practice helped me structure essays better and track where I was losing marks.'},
  {name:'Sneha Singh',exam:'IBPS PO Mains',score:'18/25',place:'Lucknow, Uttar Pradesh',study:'B.A. (Hons)',avatar:'👩🏻‍💻',quote:'Consistent practice improved my confidence in essay writing and helped me manage the time better.'},
  {name:'Rahul Mehta',exam:'IBPS PO Mains',score:'17/25',place:'Jaipur, Rajasthan',study:'B.Com',avatar:'👨🏻‍💼',quote:'The practice topics and analysis format made it easier to identify mistakes and improve writing.'},
  {name:'Priya Sharma',exam:'Banking Descriptive',score:'19/25',place:'New Delhi',study:'M.Com',avatar:'👩🏽‍🎓',quote:'Having a fixed writing routine made descriptive preparation feel much more manageable.'}
];

export default function StudentExperiencePopup(){
  const [open,setOpen]=useState(false);
  const [index,setIndex]=useState(0);

  useEffect(()=>{
    if(typeof window==='undefined' || window.location.pathname!=='/') return;
    let dismissed=false;
    try{dismissed=sessionStorage.getItem('dm_student_stories_seen')==='1';}catch{}
    if(dismissed)return;
    const t=setTimeout(()=>setOpen(true),6500);
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    if(!open)return;
    const t=setInterval(()=>setIndex(i=>(i+1)%STORIES.length),7000);
    return()=>clearInterval(t);
  },[open]);

  const close=()=>{
    setOpen(false);
    try{sessionStorage.setItem('dm_student_stories_seen','1');}catch{}
  };
  const story=STORIES[index];

  if(!open)return null;
  return <div style={S.overlay}>
    <style jsx global>{`@media(max-width:700px){.storyModal{width:calc(100vw - 24px)!important;padding:20px!important}.storyTop{font-size:22px!important}.storyMeta{grid-template-columns:1fr!important}.storyNav{display:none!important}}`}</style>
    <div className="storyModal" style={S.modal} role="dialog" aria-modal="true" aria-label="Illustrative student experiences">
      <button onClick={close} aria-label="Close" style={S.close}>×</button>
      <div style={S.kicker}>STUDENT EXPERIENCES</div>
      <h2 className="storyTop" style={S.title}>What learners are working towards</h2>
      <p style={S.sub}>Illustrative examples of how regular descriptive practice can build confidence, structure and score awareness.</p>

      <div style={S.storyCard}>
        <div style={S.profileRow}>
          <div style={S.avatar}>{story.avatar}</div>
          <div style={{minWidth:0}}><div style={S.name}>{story.name}</div><div style={S.exam}>{story.exam}</div></div>
          <div style={S.score}><b>{story.score}</b><span>Sample score</span></div>
        </div>
        <div style={S.quote}>“{story.quote}”</div>
        <div className="storyMeta" style={S.meta}>
          <span>⌖ {story.place}</span><span>🎓 {story.study}</span>
        </div>
      </div>

      <div className="storyNav" style={S.nav}>
        <button onClick={()=>setIndex(i=>(i-1+STORIES.length)%STORIES.length)} style={S.navBtn}>‹</button>
        <div style={S.dots}>{STORIES.map((_,i)=><button key={i} onClick={()=>setIndex(i)} style={{...S.dot,...(i===index?S.dotOn:{})}} aria-label={'Story '+(i+1)}/>)}</div>
        <button onClick={()=>setIndex(i=>(i+1)%STORIES.length)} style={S.navBtn}>›</button>
      </div>
      <div style={S.disclaimer}>ⓘ Illustrative sample — not a claim of an actual student result.</div>
    </div>
  </div>;
}

const S={
  overlay:{position:'fixed',inset:0,background:'rgba(10,22,42,.58)',backdropFilter:'blur(3px)',display:'grid',placeItems:'center',zIndex:10000,padding:12},
  modal:{position:'relative',width:'min(620px,calc(100vw - 24px))',background:'#f8fbff',border:'1px solid #d9e4f0',borderRadius:20,padding:26,boxShadow:'0 28px 90px rgba(0,0,0,.28)',color:'#172a45',fontFamily:'Arial,Helvetica,sans-serif'},
  close:{position:'absolute',top:12,right:13,width:34,height:34,borderRadius:'50%',border:'1px solid #d7e0ea',background:'#fff',fontSize:25,lineHeight:1,cursor:'pointer',color:'#40506a'},
  kicker:{fontSize:11,fontWeight:900,letterSpacing:1.4,color:'#2d72bf',marginBottom:6},
  title:{margin:'0',fontSize:27,fontWeight:900,lineHeight:1.15,paddingRight:34},
  sub:{margin:'8px 0 18px',color:'#69778b',fontSize:14,lineHeight:1.5},
  storyCard:{background:'#fff',border:'1px solid #dce5ef',borderRadius:15,padding:17,boxShadow:'0 7px 22px rgba(45,76,115,.08)'},
  profileRow:{display:'flex',alignItems:'center',gap:12},
  avatar:{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#d8e7fb,#eef4fb)',display:'grid',placeItems:'center',fontSize:34,flexShrink:0,border:'3px solid #fff',boxShadow:'0 4px 12px rgba(45,76,115,.12)'},
  name:{fontWeight:900,fontSize:18},
  exam:{fontSize:12,color:'#718096',marginTop:4},
  score:{marginLeft:'auto',background:'#eaf2ff',color:'#1f67b3',borderRadius:12,padding:'8px 12px',textAlign:'center',minWidth:82},
  quote:{fontSize:15,lineHeight:1.6,fontStyle:'italic',marginTop:15,color:'#2d3c52'},
  meta:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,borderTop:'1px solid #edf0f4',marginTop:14,paddingTop:12,fontSize:12,color:'#667085'},
  nav:{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:16},
  navBtn:{width:34,height:34,borderRadius:'50%',border:'1px solid #d1dbe7',background:'#fff',fontSize:22,color:'#315d9b',cursor:'pointer'},
  dots:{display:'flex',gap:7},
  dot:{width:8,height:8,padding:0,border:0,borderRadius:'50%',background:'#cbd8e8',cursor:'pointer'},
  dotOn:{background:'#2f78c7',width:22,borderRadius:10},
  disclaimer:{marginTop:12,textAlign:'center',fontSize:11,color:'#7a8798',background:'#eef4fb',borderRadius:999,padding:'7px 12px'}
};