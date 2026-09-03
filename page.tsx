import {getCurrentUser} from "../../../lib/auth";
import {db} from "../../../lib/prisma";
import ResultView from "../../../components/ResultView";

export default async function ResultPage({params}:{params:Promise<{attemptId:string}>}){
 const u=await getCurrentUser(); if(!u)return <div style={{padding:30}}>Please log in.</div>;
 const {attemptId}=await params;
 const a=await db.attempt.findUnique({where:{id:attemptId},include:{test:true,evaluation:true}});
 if(!a||a.userId!==u.id)return <div style={{padding:30}}>Result not found.</div>;
 return <ResultView attempt={a as any}/>;
}