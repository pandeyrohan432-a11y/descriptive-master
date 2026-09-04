import {useEffect} from "react";
import "../globals.css";

export default function App({Component,pageProps}){
  useEffect(()=>{
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
    return()=>{clearInterval(timer);observer.disconnect();};
  },[]);

  return <Component {...pageProps}/>;
}
