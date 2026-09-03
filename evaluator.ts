type EvalInput = {
  essay: string;
  compAnswers: string[];
  passage: string;
};

const words=(s:string)=>s.trim()?s.trim().split(/\s+/).length:0;
const sentences=(s:string)=>s.split(/[.!?]+/).map(x=>x.trim()).filter(Boolean).length;

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function essayHeuristic(essay:string){
  const w=words(essay), s=sentences(essay);
  const paragraphs=essay.split(/\n\s*\n/).filter(x=>x.trim()).length;
  const connectors=(essay.match(/\b(however|therefore|moreover|furthermore|thus|while|although|because|hence|also|firstly|finally)\b/gi)||[]).length;
  const relevance=clamp(3 + (w>=250?2:0) + (w>=300?1:0) + Math.min(1,connectors*.25),0,5);
  const structure=clamp(2 + Math.min(2,paragraphs*.5) + (w>=220?1:0),0,5);
  const grammar=clamp(2 + Math.min(3, (s>=6?1:0) + (w>=250?1:0) + (/[.!?]$/.test(essay.trim())?1:0)),0,5);
  const base=clamp((relevance+structure+grammar)/3,0,5);
  return {
    relevanceScore:Number(relevance.toFixed(1)),
    structureScore:Number(structure.toFixed(1)),
    grammarScore:Number(grammar.toFixed(1)),
    essayScore:Number((base*3).toFixed(1)),
    note:`Format check: ${w} words across about ${s} sentences and ${paragraphs} paragraph(s).`
  };
}

function compHeuristic(answers:string[], passage:string){
  const pWords=new Set((passage.toLowerCase().match(/[a-z]{4,}/g)||[]));
  const scores=answers.map(a=>{
    const ws=(a.toLowerCase().match(/[a-z]{4,}/g)||[]);
    const overlap=ws.filter(x=>pWords.has(x)).length;
    const w=words(a);
    const wordFactor = w>=30&&w<=40 ? 1 : .7;
    return clamp(1 + overlap/Math.max(1,ws.length)*1.2,0,2)*wordFactor;
  });
  const total=Math.min(10, scores.reduce((a,b)=>a+b,0));
  return {comprehensionScore:Number(total.toFixed(1)), itemScores:scores.map(x=>Number(x.toFixed(1)))};
}

export function evaluateAttempt(input:EvalInput){
  const e=essayHeuristic(input.essay);
  const c=compHeuristic(input.compAnswers,input.passage);
  const total=Number((e.essayScore+c.comprehensionScore).toFixed(1));
  return {
    essayScore:e.essayScore,
    comprehensionScore:c.comprehensionScore,
    totalScore:total,
    grammarScore:e.grammarScore,
    relevanceScore:e.relevanceScore,
    structureScore:e.structureScore,
    feedback:{
      essay:e.note,
      strengths:[
        e.relevanceScore>=4?"Good topical focus":"Try to connect points more directly to the topic.",
        e.structureScore>=4?"Clear structural signals":"Use a clearer introduction, body and conclusion.",
        e.grammarScore>=4?"Basic language consistency looks good":"Review sentence construction and grammar."
      ],
      comprehension:`Heuristic evaluation of 5 answers; detailed semantic scoring should be connected to an AI provider for production.`
    }
  };
}