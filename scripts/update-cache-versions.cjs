#!/usr/bin/env node
'use strict';

// Fingerprint the editable web app, including its entry page and shortcut art.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const indexPath=path.join(root,'index.html');
const versionPath=path.join(root,'version.json');
const check=process.argv.includes('--check');
const original=fs.readFileSync(indexPath,'utf8');
const bootstrap=/(<script id="cache-bootstrap" data-version=")[^"]+("\s*>)/;
if(!bootstrap.test(original))throw Error('Cache bootstrap version marker is missing.');

const references=/(<(?:link|script)\b[^>]*?\b(?:href|src)=")([^"]+)(")/gi;
function localReference(ref,version){
 if(/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref))return null;
 const url=new URL(ref,'https://assets.invalid/');
 if(url.origin!=='https://assets.invalid'||ref.startsWith('/')||url.hash)throw Error('Invalid local asset URL: '+ref);
 const name=decodeURIComponent(url.pathname.slice(1));
 if(!name||name.split('/').some(part=>part==='..'||part==='.'||!part))throw Error('Invalid local asset path: '+ref);
 url.searchParams.delete('v');
 if(version)url.searchParams.set('v',version);
 return {name,reference:name+(url.search?url.search:'')};
}
function updateReferences(html,version,assets){
 return html.replace(references,(match,prefix,ref,suffix)=>{
  const local=localReference(ref,version);if(!local)return match;
  if(assets)assets.add(local.name);
  return prefix+local.reference+suffix;
 });
}
const assets=new Set();
const canonical=updateReferences(original,null,assets).replace(bootstrap,'$1__BUILD_VERSION__$2');
for(const name of fs.readdirSync(path.join(root,'vendor/shortcuts')).filter(name=>name.endsWith('.svg')).sort())assets.add('vendor/shortcuts/'+name);
const digest=crypto.createHash('sha256').update('access-adelaide-cache-v1\0').update(canonical);
for(const name of [...assets].sort()){
 const file=path.resolve(root,name);
 if(!file.startsWith(root+path.sep))throw Error('Asset escapes project: '+name);
 digest.update('\0'+name+'\0').update(crypto.createHash('sha256').update(fs.readFileSync(file)).digest());
}
const version=digest.digest('hex').slice(0,16);
const updated=updateReferences(original,version).replace(bootstrap,(_,before,after)=>before+version+after);
const metadata=JSON.stringify({version})+'\n';
if(check){
 if(updated!==original||!fs.existsSync(versionPath)||fs.readFileSync(versionPath,'utf8')!==metadata)throw Error('Cache versions are stale. Run node scripts/build-standalone.cjs.');
 console.log('Cache versions are current: '+version);
}else{
 if(updated!==original)fs.writeFileSync(indexPath,updated);
 if(!fs.existsSync(versionPath)||fs.readFileSync(versionPath,'utf8')!==metadata)fs.writeFileSync(versionPath,metadata);
 console.log('Cache version: '+version);
}
