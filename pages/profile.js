import {useEffect,useRef,useState} from 'react';

const KEY='dm_profile';
const blank={email:'',city:'',state:'',targetExam:'IBPS PO',about:''};

export default function Profile(){
  const [logged,setLogged]=useState(true),[name,setName]=useState(''),[phone,setPhone]=useState('');
  const [form,setForm]=useState(blank),[photo,setPhoto]=useState(''),[saved,setSaved]=useState(false);
  const inputRef=useRef(null);

  useEffect(()=>{
    try{
      const ok=localStorage.getItem('dm_logged')==='1';
      setLogged(ok);
      if(!ok)return;
      setName(localStorage.getItem('dm_name')||'Student');
      setPhone((localStorage.getItem('dm_phone')||'').replace(/\D/g,''));
      const p=JSON.parse(localStorage.getItem(KEY)||'{}');
      setForm({...blank,...p});
      setPhoto(localStorage.getItem(KEY+'_photo')||'');
    }catch{}
  },[]);

  const save=()=>{
    const cleanName=name.trim()||'Student';
    setName(cleanName);
    localStorage.setItem('dm_name',cleanName);
    localStorage.setItem(KEY,JSON.stringify(form));
    if(photo)localStorage.setItem(KEY+'_photo',photo); else localStorage.removeItem(KEY+'_photo');
    setSaved(true);setTimeout(()=>setSaved(false),2200);
    try{
      if(phone.length===10) fetch('/api/students',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,name:cleanName})}).catch(()=>{});
    }catch{}
  };

  const handlePhoto=e=>{
    const file=e.target.files?.[0]; if(!file)return;
    if(!file.type.startsWith('image/'))return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        const size=320,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
        const ctx=canvas.getContext('2d');
        const scale=Math.max(size/img.width,size/img.height),w=img.width*scale,h=img.height*scale;
        ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
        setPhoto(canvas.toDataURL('image/jpeg',0.82));
      };
      img.src=String(ev.target?.result||'');
    };
    reader.readAsDataURL(file);
  };

  if(!logged)return <div style={S.center}><div style={S.card}><div style={S.logo}>D</div><h2>Login required</h2><p>Please login first to create your student profile.</p><a href="/" style={S.primary}>Go to Home</a></div></div>;

  return <div style={S.page}>
    <header style={S.top}><a href="/" style={S.brand}>DESCRIPTIVE MASTER</a><div style={S.topTitle}>My Profile</div><a href="/" style={S.back}>← Home</a></header>
    <main style={S.wrap}>
      <div style={S.profileHero}>
        <div style={S.avatarWrap}>
          <div style={S.avatar}>{photo?<img src={photo} alt="Profile" style={S.photo}/>:<span>{(name||'S').charAt(0).toUpperCase()}</span>}</div>
          <button style={S.photoBtn} onClick={()=>inputRef.current?.click()}>📷 Change photo</button>
          <input ref={inputRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:'none'}} />
        </div>
        <div><div style={S.eyebrow}>STUDENT ACCOUNT</div><h1 style={{margin:'4px 0 6px'}}>{name||'Student'}</h1><p style={S.muted}>Your study profile on Descriptive Master</p></div>
      </div>

      <section style={S.cardWide}><h2 style={S.h2}>Basic Details</h2><div style={S.grid}>
        <Field label="Full Name" value={name} onChange={setName} placeholder="Enter your name" />
        <Field label="Mobile Number" value={phone} disabled onChange={()=>{}} />
        <Field label="Email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} placeholder="your@email.com" />
        <Field label="City" value={form.city} onChange={v=>setForm(f=>({...f,city:v}))} placeholder="Your city" />
        <Field label="State" value={form.state} onChange={v=>setForm(f=>({...f,state:v}))} placeholder="Your state" />
        <div><label style={S.label}>Target Exam</label><select style={S.input} value={form.targetExam} onChange={e=>setForm(f=>({...f,targetExam:e.target.value}))}><option>SBI PO</option><option>IBPS PO</option><option>SBI Clerk</option><option>IBPS Clerk</option><option>IBPS RRB PO</option><option>IBPS RRB Clerk</option><option>NICL Assistant</option><option>Other</option></select></div>
      </div>
      <div style={{marginTop:4}}><label style={S.label}>About / Study Goal</label><textarea style={{...S.input,minHeight:110,resize:'vertical'}} value={form.about} onChange={e=>setForm(f=>({...f,about:e.target.value}))} placeholder="Tell us about your preparation or target..." /></div>
      <div style={S.actions}><button style={S.primary} onClick={save}>Save Profile</button>{saved&&<span style={S.saved}>✓ Profile saved</span>}</div>
      </section>
    </main>
  </div>;
}

function Field({label,value,onChange,placeholder,disabled}){return <div><label style={S.label}>{label}</label><input style={{...S.input,background:disabled?'#f4f6f8':'#fff'}} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} /></div>}

const S={page:{minHeight:'100vh',background:'#f5f7fb',fontFamily:'Arial,Helvetica,sans-serif',color:'#18253b'},top:{height:66,background:'#fff',borderBottom:'1px solid #dfe5ed',display:'flex',alignItems:'center',padding:'0 24px',position:'sticky',top:0,zIndex:10},brand:{textDecoration:'none',fontWeight:900,color:'#173b6b'},topTitle:{margin:'0 auto',fontWeight:800,fontSize:18},back:{textDecoration:'none',color:'#45607e',fontWeight:700},wrap:{maxWidth:980,margin:'0 auto',padding:'30px 18px 60px'},profileHero:{background:'linear-gradient(135deg,#173b6b,#315d9b)',color:'#fff',borderRadius:18,padding:24,display:'flex',gap:22,alignItems:'center',boxShadow:'0 10px 28px rgba(25,45,80,.12)'},avatarWrap:{textAlign:'center',flexShrink:0},avatar:{width:112,height:112,borderRadius:'50%',background:'#fff',color:'#173b6b',display:'grid',placeItems:'center',fontSize:42,fontWeight:900,overflow:'hidden',border:'4px solid rgba(255,255,255,.85)'},photo:{width:'100%',height:'100%',objectFit:'cover'},photoBtn:{marginTop:9,border:'1px solid rgba(255,255,255,.5)',background:'rgba(255,255,255,.12)',color:'#fff',padding:'8px 10px',borderRadius:8,cursor:'pointer',fontWeight:700},eyebrow:{fontSize:12,letterSpacing:1.2,opacity:.8,fontWeight:800},muted:{color:'inherit',opacity:.8},card:{background:'#fff',border:'1px solid #dfe5ed',borderRadius:16,padding:28,boxShadow:'0 6px 20px rgba(30,55,90,.05)'},cardWide:{background:'#fff',border:'1px solid #dfe5ed',borderRadius:16,padding:28,boxShadow:'0 6px 20px rgba(30,55,90,.05)',marginTop:18},logo:{width:54,height:54,borderRadius:12,background:'#173b6b',color:'#fff',display:'grid',placeItems:'center',fontWeight:900,fontSize:26,margin:'0 auto 14px'},center:{minHeight:'100vh',display:'grid',placeItems:'center',background:'#f5f7fb',fontFamily:'Arial,Helvetica,sans-serif'},h2:{fontSize:18,margin:'0 0 18px'},grid:{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:16},label:{display:'block',fontSize:13,fontWeight:800,color:'#455468',marginBottom:6},input:{width:'100%',padding:'12px 13px',border:'1px solid #cbd5e1',borderRadius:9,outline:'none',fontSize:14},actions:{display:'flex',alignItems:'center',gap:12,marginTop:18},primary:{display:'inline-block',background:'#315d9b',color:'#fff',border:0,borderRadius:9,padding:'11px 17px',fontWeight:800,textDecoration:'none',cursor:'pointer'},saved:{color:'#1b7a4b',fontWeight:800,fontSize:14}};
<style jsx global>{`@media(max-width:650px){.profileHero{flex-direction:column;text-align:center}.grid{grid-template-columns:1fr!important}.cardWide{padding:20px!important}.topTitle{font-size:16px!important}.wrap{padding-left:12px!important;padding-right:12px!important}}`}</style>