import PairedHome from "./paired-home";

export default function Home(){
  return <>
    <style dangerouslySetInnerHTML={{__html:`.card p{display:none!important}`}} />
    <script dangerouslySetInnerHTML={{__html:`document.addEventListener('input',function(e){if(e.target&&e.target.tagName==='TEXTAREA')e.target.spellcheck=false;});document.querySelectorAll('textarea').forEach(function(e){e.spellcheck=false;});`}} />
    <PairedHome />
  </>;
}
