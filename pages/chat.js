import {useEffect,useRef,useState} from "react";

export default function Chat(){
  const [phone,setPhone]=useState("");
  const [name,setName]=useState("Student");
  const [messages,setMessages]=useState([]);
  const [text,setText]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const bottom=useRef(null);

  useEffect(function(){
    if(typeof window==="undefined") return;
    var p=String(window.localStorage.getItem("dm_phone")||"").replace(/\D/g,"");
    var n=String(window.localStorage.getItem("dm_name")||"Student");
    if(p.length!==10){window.location.href="/";return;}
    setPhone(p);setName(n);
  },[]);

  useEffect(function(){
    if(phone.length!==10)return;
    var stopped=false;
    async function load(){
      try{
        var r=await fetch("/api/chat?phone="+encodeURIComponent(phone));
        var j=await r.json();
        if(stopped)return;
        if(!r.ok){setError(j.error||"Unable to load chat");return;}
        setMessages(Array.isArray(j.messages)?j.messages:[]);setError("");
      }catch(e){if(!stopped)setError("Unable to connect to chat");}
    }
    load();var id=setInterval(load,3000);
    return function(){stopped=true;clearInterval(id);};
  },[phone]);

  useEffect(function(){
    if(bottom.current&&typeof bottom.current.scrollIntoView==="function")bottom.current.scrollIntoView({behavior:"smooth"});
  },[messages]);

  async function send(){
    if(!text.trim()||busy||phone.length!==10)return;
    setBusy(true);setError("");
    try{
      var r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:phone,message:text.trim()})});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||"Message failed");
      setText("");setMessages(function(old){return old.concat([j.message]);});
    }catch(e){setError(e&&e.message?e.message:"Message failed");}
    finally{setBusy(false);}
  }

  return <div style={styles.page}>
    <div style={styles.top}><b>DESCRIPTIVE MASTER</b><a href="/" style={styles.link}>← Dashboard</a></div>
    <div style={styles.wrap}><div style={styles.card}>
      <div style={styles.head}>Chat with Admin <span style={styles.sub}>• {name}</span></div>
      <div style={styles.messages}>
        {messages.length===0?<div style={styles.empty}>No messages yet. Send a message to contact the admin.</div>:messages.map(function(m){return <div key={m.id} style={{display:"flex",justifyContent:m.sender==="student"?"flex-end":"flex-start"}}><div style={{...styles.bubble,background:m.sender==="student"?"#dcecff":"#fff"}}><div>{m.message}</div><div style={styles.time}>{new Date(m.created_at).toLocaleString("en-IN")}</div></div></div>;})}
        <div ref={bottom}/>
      </div>
      {error&&<div style={styles.error}>{error}</div>}
      <div style={styles.composer}><input style={styles.input} value={text} onChange={function(e){setText(e.target.value.slice(0,2000));}} onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Type your message..."/><button style={styles.button} disabled={busy} onClick={send}>{busy?"Sending...":"Send"}</button></div>
    </div></div>
  </div>;
}

const styles={page:{minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,Helvetica,sans-serif",color:"#172033"},top:{height:64,background:"#40537d",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"},link:{color:"#fff",textDecoration:"none"},wrap:{maxWidth:850,margin:"0 auto",padding:20},card:{background:"#fff",border:"1px solid #d7dee9",borderRadius:14,overflow:"hidden",boxShadow:"0 5px 20px rgba(25,45,80,.08)"},head:{padding:16,borderBottom:"1px solid #e3e7ee",fontWeight:700},sub:{fontWeight:400,color:"#667085",fontSize:13},messages:{height:"calc(100vh - 255px)",minHeight:420,overflowY:"auto",padding:18,background:"#f8fafc"},empty:{color:"#667085",textAlign:"center",paddingTop:80},bubble:{maxWidth:"78%",padding:"10px 13px",borderRadius:12,marginBottom:10,lineHeight:1.45,whiteSpace:"pre-wrap",border:"1px solid #dbe2ec"},time:{fontSize:10,color:"#7a8495",marginTop:4,textAlign:"right"},error:{padding:"10px 14px",color:"#a52727",fontSize:13},composer:{display:"flex",gap:10,padding:14,borderTop:"1px solid #e3e7ee"},input:{flex:1,border:"1px solid #cbd3df",borderRadius:10,padding:"11px 13px",outline:"none"},button:{border:0,borderRadius:10,padding:"11px 18px",background:"#3d78c2",color:"#fff",fontWeight:700}};
