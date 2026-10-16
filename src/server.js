import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {read,add} from './store.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
export const server=http.createServer(async(req,res)=>{
 const send=(status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(obj));};
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/health')return send(200,{ok:true,app:'AlMawladaPro'});
 const match=url.pathname.match(/^\/api\/(subscribers|invoices|payments)$/);
 if(match){const type=match[1];if(req.method==='GET')return send(200,read()[type]);if(req.method!=='POST')return send(405,{error:'Method not allowed'});
 let raw='';try{for await(const chunk of req){raw+=chunk;if(raw.length>20000)throw Error('Request too large');}const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Invalid input');
 if(type==='subscribers'){if(typeof body.name!=='string'||!body.name.trim())throw Error('Name required');return send(201,add(type,{name:body.name.trim(),phone:String(body.phone||''),amperes:Number(body.amperes)||0}));}
 if(type==='invoices'){if(!read().subscribers.some(x=>x.id===body.subscriberId))throw Error('Unknown subscriber');if(!Number.isFinite(Number(body.amount))||Number(body.amount)<0)throw Error('Invalid amount');return send(201,add(type,{subscriberId:body.subscriberId,month:String(body.month||''),amount:Number(body.amount)}));}
 if(!read().invoices.some(x=>x.id===body.invoiceId))throw Error('Unknown invoice');if(!Number.isFinite(Number(body.amount))||Number(body.amount)<=0)throw Error('Invalid amount');return send(201,add(type,{invoiceId:body.invoiceId,amount:Number(body.amount)}));
 }catch(e){return send(400,{error:e.message});}}
 if(req.method!=='GET')return send(405,{error:'Method not allowed'});
 const target=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!target.startsWith(root+path.sep))return send(403,{error:'Forbidden'});
 fs.readFile(target,(err,data)=>{if(err)return send(404,{error:'Not found'});res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(data);});
});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){server.listen(Number(process.env.PORT)||3000,()=>console.log('AlMawladaPro ready'));}
