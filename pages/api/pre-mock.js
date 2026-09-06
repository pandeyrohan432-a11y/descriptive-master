import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export const config = { runtime: 'nodejs' };

function loadFromSourceFile(){
  const file=path.join(process.cwd(),'data','pre_mock_data.js');
  const source=fs.readFileSync(file,'utf8');
  const match=source.match(/const\s+DATA_B64\s*=\s*`([A-Za-z0-9+/=\s]+)`/);
  if(!match) throw new Error('DATA_B64 not found in pre_mock_data.js');
  const b64=match[1].replace(/\s/g,'');
  const json=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');
  const data=JSON.parse(json);
  if(!Array.isArray(data)||data.length!==100) throw new Error(`Invalid mock data: expected 100 questions, got ${Array.isArray(data)?data.length:'non-array'}`);
  return data;
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(req.query.id && req.query.id!=='sbi-clerk-2025') return res.status(404).json({error:'Mock not found'});
  try{
    const data=loadFromSourceFile();
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  }catch(e){
    console.error('PRE mock load failed:',e);
    return res.status(500).json({error:'Mock data could not be loaded',detail:e?.message||String(e)});
  }
}
