import {NextResponse} from 'next/server';

export function middleware(req){
  const {pathname}=req.nextUrl;
  if(pathname==='/pre-mocks/sbi-clerk-mock-1'){
    const url=req.nextUrl.clone();
    url.pathname='/pre-mocks/sbi-clerk-mock-1-fixed';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config={matcher:['/pre-mocks/sbi-clerk-mock-1']};
