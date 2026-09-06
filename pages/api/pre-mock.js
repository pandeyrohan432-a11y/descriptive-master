import { loadSbiClerk2025 } from '../../data/pre_mock_data';

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(req.query.id && req.query.id!=='sbi-clerk-2025') return res.status(404).json({error:'Mock not found'});
  try{
    const data=await loadSbiClerk2025();
    if(!Array.isArray(data)||data.length!==100) throw new Error('Invalid mock data');
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  }catch(e){
    console.error('PRE mock load failed:',e);
    return res.status(500).json({error:'Mock data could not be loaded',detail:e?.message||String(e)});
  }
}
