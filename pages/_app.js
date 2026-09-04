import {useEffect} from "react";
import "../globals.css";

export default function App({Component,pageProps}){
  useEffect(()=>{
    const patch=()=>{
      document.querySelectorAll(".card").forEach(card=>{
        const h=card.querySelector("h3");
        const m=h&&h.textContent.match(/^Test (\\d+)$/);
        if(!m)return;
        const n=Number(m[1]);
        if(n<3||n>10)return;
        const btn=card.querySelector("button");
        if(!btn)return;
        btn.disabled=false;
        btn.textContent="→ Pay ₹49 to Unlock";
        if(btn.dataset.paywallBound!=="1"){
          btn.dataset.paywallBound="1";
          btn.addEventListener("click",e=>{
            e.preventDefault();
            e.stopImmediatePropagation();
            alert("Tests 3–10 are premium. Pay ₹49 one-time to unlock all 8 tests.");
          },true);
        }
        const release=card.querySelector(".release");
        if(release)release.innerHTML='<b>₹49</b> one-time • Unlock Tests 3–10';
      });
    };
    patch();
    const observer=new MutationObserver(patch);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["disabled"]});
    return()=>observer.disconnect();
  },[]);
  return <Component {...pageProps}/>;
}
