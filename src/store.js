import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const file=process.env.DATA_FILE || path.join(process.cwd(),'data','store.json');
const blank=()=>({subscribers:[],invoices:[],payments:[]});
export function read(){if(!fs.existsSync(file))return blank();return JSON.parse(fs.readFileSync(file,'utf8'));}
export function write(data){fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data,null,2));fs.renameSync(tmp,file);}
export function add(collection,item){const db=read();const record={id:crypto.randomUUID(),createdAt:new Date().toISOString(),...item};db[collection].push(record);write(db);return record;}
