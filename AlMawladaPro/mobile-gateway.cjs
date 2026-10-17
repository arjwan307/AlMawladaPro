'use strict';
// Opt-in mobile gateway. Bind only to a trusted VPN interface (e.g. Tailscale).
const http=require('node:http');
const crypto=require('node:crypto');
const fs=require('node:fs');
function createMobileGateway({targetPort,token,host,port=3187}){
 if(!host||!token||token.length<32)throw Error('VPN bind address and a 32+ character secret are required');
 const secret=Buffer.from(token);
 const authorized=(value)=>{const candidate=Buffer.from(value||'');return candidate.length===secret.length&&crypto.timingSafeEqual(candidate,secret)};
 const gateway=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://mobile.local');
  const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=').slice(0,2)));
  if(url.pathname==='/mobile/connect'){
   if(req.method!=='GET'||!authorized(url.searchParams.get('key'))){res.writeHead(403);return res.end('Forbidden')}
   res.writeHead(302,{'Location':'/','Set-Cookie':'mawlada_mobile='+encodeURIComponent(token)+'; HttpOnly; SameSite=Strict; Path=/','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});return res.end();
  }
  if(!authorized(decodeURIComponent(cookies.mawlada_mobile||''))){res.writeHead(401,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});return res.end('Unauthorized: open your pairing link first')}
  if(!['GET','HEAD','OPTIONS'].includes(req.method)){
   const origin=req.headers.origin;
   if(origin&&origin!==('http://'+req.headers.host)){res.writeHead(403);return res.end('Origin blocked')}
  }
  const upstream=http.request({hostname:'127.0.0.1',port:targetPort,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:'+targetPort,cookie:''}},response=>{
   res.writeHead(response.statusCode,response.headers);response.pipe(res);
  });
  upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end('Local application unavailable')});
  req.pipe(upstream);
 });
 return new Promise((resolve,reject)=>{gateway.once('error',reject);gateway.listen(port,host,()=>resolve(gateway))});
}
module.exports={createMobileGateway};
