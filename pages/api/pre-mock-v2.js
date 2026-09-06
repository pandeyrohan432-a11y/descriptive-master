import { SBI_CLERK_PRELIMS_MOCK_1 } from '../../data/sbi_clerk_prelims_mock_1';

export default function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(req.query.id && req.query.id!=='sbi-clerk-mock-1') return res.status(404).json({error:'Mock not found'});
  const data=SBI_CLERK_PRELIMS_MOCK_1;
  if(!Array.isArray(data)||data.length!==100) return res.status(500).json({error:'Mock data could not be loaded'});
  res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).json(data);
}
