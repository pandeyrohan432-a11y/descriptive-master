import {useEffect,useState} from "react";
import "../globals.css";

function ChatButton(){
  const [student,setStudent]=useState(false);
  const [admin,setAdmin]=useState(false);
  useEffect(()=>{
    let alive=true;
    try{
      const isAdmin=document.cookie.indexOf("dm_admin=1")!==-1;
      if(isAdmin){if(alive)setAdmin(true);}
      const logged=localStorage.getItem("dm_logged")==="1";
      const phone=(localStorage.getItem("dm_phone")||"").replace(/\D/g,"");
      if(logged&&phone.length===10){
        fetch("/api/chat?phone="+encodeURIComponent(phone)).then(r=>{if(alive&&r.ok)setStudent(true);}).catch(()=>{});
      }
    }catch(e){}
    return()=>{alive=false;};
  },[]);
  if(typeof window!=="undefined"&&(window.location.pathname==="/chat"||window.location.pathname==="/admin-chat"))return null;
  if(!student&&!admin)return null;
  return <div style={{position:"fixed",right:18,bottom:18,zIndex:9999,display:"flex",gap:8,flexDirection:"column",alignItems:"flex-end"}}>
    {student&&<a href="/chat" style={{background:"#3d78c2",color:"#fff",textDecoration:"none",padding:"12px 16px",borderRadius:999,boxShadow:"0 5px 18px rgba(25,45,80,.25)",fontWeight:700}}>💬 Chat with Admin</a>}
    {admin&&<a href="/admin-chat" style={{background:"#263a61",color:"#fff",textDecoration:"none",padding:"12px 16px",borderRadius:999,boxShadow:"0 5px 18px rgba(25,45,80,.25)",fontWeight:700}}>💬 Student Chats</a>}
  </div>;
}
function MockButton(){
  if(typeof window!=="undefined"&&(window.location.pathname.startsWith("/pre-mocks")))return null;
  return <a href="/pre-mocks" style={{position:"fixed",left:18,bottom:18,zIndex:9998,background:"#172f55",color:"#fff",textDecoration:"none",padding:"12px 16px",borderRadius:999,boxShadow:"0 5px 18px rgba(25,45,80,.25)",fontWeight:800}}>📝 PRE MOCKS</a>;
}
export default function App({Component,pageProps}){
  useEffect(()=>{
    const trackLoggedStudent=()=>{
      try{
        if(typeof window==="undefined"||localStorage.getItem("dm_logged")!=="1")return;
        const phone=(localStorage.getItem("dm_phone")||"").replace(/\D/g,"");
        const name=localStorage.getItem("dm_name")||"Student";
        if(phone.length!==10)return;
        if(window.__dmStudentTracked===phone)return;
        window.__dmStudentTracked=phone;
        fetch("/api/students",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,name})}).catch(()=>{window.__dmStudentTracked=null});
      }catch(e){}
    };
    trackLoggedStudent();
    const loginTimer=setInterval(trackLoggedStudent,500);
    const patch=()=>{
      if(typeof document==="undefined") return;
      document.querySelectorAll(".card").forEach(card=>{
        const h=card.querySelector("h3");
        const m=h&&h.textContent.match(/^Test (\\d+)$/);
        if(!m)return;
        const n=Number(m[1]);
        if(n<3||n>10)return;
        const badge=card.querySelector(".locked");
        if(badge){badge.className="live";badge.textContent="PREMIUM";}
        const release=card.querySelector(".release");
        if(release)release.textContent="₹49 one-time • Unlock Tests 3–10";
        const btn=card.querySelector("button");
        if(!btn)return;
        btn.disabled=false;btn.removeAttribute("disabled");btn.textContent="→ Pay ₹49 to Unlock";btn.style.cursor="pointer";btn.style.opacity="1";
        if(btn.dataset.paywallBound!=="1"){
          btn.dataset.paywallBound="1";
          btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();alert("Tests 3–10 are premium. Pay ₹49 one-time to unlock all 8 tests.");},true);
        }
      });
    };
    const brand=()=>{
      if(typeof document==="undefined")return;
      document.querySelectorAll(".brand").forEach(el=>{
        el.textContent="";
        el.style.width="180px";
        el.style.height="52px";
        el.style.backgroundImage="url('/logo.svg')";
        el.style.backgroundRepeat="no-repeat";
        el.style.backgroundPosition="left center";
        el.style.backgroundSize="contain";
      });
      document.querySelectorAll(".top b").forEach(el=>{
        if(el.dataset.dmLogo==="1")return;
        el.dataset.dmLogo="1";
        el.textContent="";
        const img=document.createElement("img");
        img.src="/logo.svg";img.alt="Descriptive Master";img.style.height="50px";img.style.width="164px";img.style.objectFit="contain";
        el.appendChild(img);
      });
    };
    patch();brand();
    const timer=setInterval(()=>{patch();brand();},150);
    const observer=new MutationObserver(()=>{patch();brand();});
    if(document.body)observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["disabled","class"]});
    return()=>{clearInterval(loginTimer);clearInterval(timer);observer.disconnect();};
  },[]);
  return <><Component {...pageProps}/><MockButton/><ChatButton/></>;
}
