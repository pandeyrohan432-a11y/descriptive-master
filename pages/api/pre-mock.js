import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export const config = { runtime: 'nodejs' };

function loadMock(){
  const file=path.join(process.cwd(),'data','pre_mock_data.js');
  const source=fs.readFileSync(file,'utf8');
  const match=source.match(/const\s+DATA_B64\s*=\s*`([A-Za-z0-9+/=\s]+)`/);
  if(!match) throw new Error('SBI Clerk Mock 1 dataset not found');
  const json=zlib.gunzipSync(Buffer.from(match[1].replace(/\s/g,''),'base64')).toString('utf8');
  const data=JSON.parse(json);
  if(!Array.isArray(data)||data.length!==100) throw new Error(`Invalid SBI Clerk Mock 1 dataset: ${Array.isArray(data)?data.length:'non-array'} questions`);
  return data;
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(req.query.id && !['sbi-clerk-2025','sbi-clerk-mock-1'].includes(req.query.id)) return res.status(404).json({error:'Mock not found'});
  try{
    const data=loadMock();
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  }catch(e){
    console.error('SBI Clerk Mock 1 load failed:',e);
    return res.status(500).json({error:'SBI Clerk Mock 1 could not be loaded',detail:e?.message||String(e)});
  }
}
