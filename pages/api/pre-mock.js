import zlib from 'zlib';

const DATA_URL='https://raw.githubusercontent.com/pandeyrohan432-a11y/descriptive-master/main/data/pre_mock_data.js';

async function loadMock(){
  const r=await fetch(DATA_URL);
  if(!r.ok) throw new Error(`Data fetch failed: ${r.status}`);
  const file=await r.text();
  const match=file.match(/const DATA_B64\s*=\s*`([\s\S]*?)`\s*;/);
  if(!match) throw new Error('Mock data blob not found');
  const json=zlib.gunzipSync(Buffer.from(match[1],'base64')).toString('utf8');
  const data=JSON.parse(json);
  if(!Array.isArray(data)||data.length!==100) throw new Error('Invalid mock data');
  return data;
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(req.query.id && req.query.id!=='sbi-clerk-2025') return res.status(404).json({error:'Mock not found'});
  try{
    const data=await loadMock();
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  }catch(e){
    console.error('PRE mock load failed:',e);
    return res.status(500).json({error:'Mock data could not be loaded'});
  }
}
