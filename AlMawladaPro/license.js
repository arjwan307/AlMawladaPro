const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const crypto=require('node:crypto');
const licensePath=process.env.MAWLADA_LICENSE_PATH||path.join(os.homedir(),'.almawladapro','license.json');
function deviceId(){const raw=[os.hostname(),os.platform(),os.arch(),process.env.MAWLADA_DEVICE_SALT||''].join('|');return crypto.createHash('sha256').update(raw).digest('hex')}
function publicKey(){const p=process.env.MAWLADA_LICENSE_PUBLIC_KEY;return p?crypto.createPublicKey(p.replace(/\\n/g,'\n')):null}
function verifyLicense(license){if(!license||license.product!=='AlMawladaPro'||license.device_id!==deviceId()||!license.signature)return false;const key=publicKey();if(!key)return false;const payload=JSON.stringify({product:license.product,device_id:license.device_id,issued_at:license.issued_at,license_id:license.license_id});return crypto.verify(null,Buffer.from(payload),key,Buffer.from(license.signature,'base64'))}
function status(){try{const license=JSON.parse(fs.readFileSync(licensePath,'utf8'));return {active:verifyLicense(license),device_id:deviceId(),license_id:license.license_id||null}}catch{return {active:false,device_id:deviceId(),license_id:null}}}
function activate(license){if(!verifyLicense(license))throw Error('الترخيص غير صالح لهذا الجهاز أو توقيعه غير صحيح');fs.mkdirSync(path.dirname(licensePath),{recursive:true});fs.writeFileSync(licensePath,JSON.stringify(license,null,2),{mode:0o600});return status()}
module.exports={deviceId,verifyLicense,status,activate};
