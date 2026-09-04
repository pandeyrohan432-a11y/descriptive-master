import crypto from 'crypto';
import { db } from './prisma';

function h(phone:string,code:string){return crypto.createHash('sha256').update(phone+':'+code+':'+(process.env.OTP_PEPPER||'dev-pepper')).digest('hex')}
export async function issueOtp(phone:string){
 const recent=await db.otpCode.count({where:{phone,createdAt:{gt:new Date(Date.now()-60000)}}});
 if(recent>=1)throw new Error('Please wait before requesting another OTP.');
 const code=String(Math.floor(100000+Math.random()*900000));
 await db.otpCode.create({data:{phone,codeHash:h(phone,code),expiresAt:new Date(Date.now()+300000)}});
 return process.env.OTP_MODE==='production'?null:code;
}
export async function verifyOtp(phone:string,code:string){
 const row=await db.otpCode.findFirst({where:{phone},orderBy:{createdAt:'desc'}});
 if(!row||row.expiresAt<new Date()||row.attempts>=5)return false;
 await db.otpCode.update({where:{id:row.id},data:{attempts:{increment:1}}});
 return row.codeHash===h(phone,code);
}
