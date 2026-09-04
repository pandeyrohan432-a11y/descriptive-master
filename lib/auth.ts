import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from './prisma';

const COOKIE='dm_session';
function hash(v:string){return crypto.createHash('sha256').update(v+(process.env.SESSION_SECRET||'dev-secret')).digest('hex')}

export async function createSession(userId:string){
 const raw=crypto.randomBytes(32).toString('hex');
 await db.session.create({data:{id:hash(raw),userId,expiresAt:new Date(Date.now()+30*86400000)}});
 const jar=await cookies();
 jar.set(COOKIE,raw,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:30*86400});
}
export async function getCurrentUser(){
 const raw=(await cookies()).get(COOKIE)?.value;if(!raw)return null;
 const s=await db.session.findUnique({where:{id:hash(raw)},include:{user:true}});
 if(!s||s.expiresAt<new Date())return null;return s.user;
}
export async function clearSession(){
 const raw=(await cookies()).get(COOKIE)?.value;if(raw)await db.session.deleteMany({where:{id:hash(raw)}});
 (await cookies()).delete(COOKIE);
}
