import {useEffect} from "react";
import "../globals.css";

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
        if(badge){
          badge.className="live";
          badge.textContent="PREMIUM";
        }

        const release=card.querySelector(".release");
        if(release){
          release.textContent="₹49 one-time • Unlock Tests 3–10";
        }

        const btn=card.querySelector("button");
        if(!btn)return;
        btn.disabled=false;
        btn.removeAttribute("disabled");
        btn.textContent="→ Pay ₹49 to Unlock";
        btn.style.cursor="pointer";
        btn.style.opacity="1";

        if(btn.dataset.paywallBound!=="1"){
          btn.dataset.paywallBound="1";
          btn.addEventListener("click",e=>{
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            alert("Tests 3–10 are premium. Pay ₹49 one-time to unlock all 8 tests.");
          },true);
        }
      });
    };

    patch();
    const timer=setInterval(patch,150);
    const observer=new MutationObserver(patch);
    if(document.body)observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["disabled","class"]});
    return()=>{clearInterval(loginTimer);clearInterval(timer);observer.disconnect();};
  },[]);

  return <Component {...pageProps}/>;
}
