#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const {firefox,chromium}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const root=path.resolve(__dirname,'..');
const entry=fs.readFileSync(path.join(root,'index.html'),'utf8');
const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
const bootstrap=entry.match(/<script id="cache-bootstrap"[^>]*>[\s\S]*?<\/script>/)?.[0];
assert.ok(bootstrap,'Web entry contains the update check');
assert.match(bootstrap,new RegExp(`data-version="${version}"`));
const tags=[...entry.matchAll(/<(?:link|script)\b[^>]*?\b(?:href|src)="([^"]+)"/gi)];
assert.ok(tags.length>10,'The app has versioned source assets');
for(const [,ref] of tags)assert.equal(new URL(ref,'https://fixture.invalid/').searchParams.get('v'),version,ref+' uses the current release');

// Verify that changing source, the entry or dynamically loaded artwork changes
// the release and that stale revisions are rejected before distribution.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'adelaide-cache-test-'));
try{
 fs.mkdirSync(path.join(temp,'scripts'),{recursive:true});
 fs.copyFileSync(path.join(root,'scripts/update-cache-versions.cjs'),path.join(temp,'scripts/update-cache-versions.cjs'));
 fs.copyFileSync(path.join(root,'index.html'),path.join(temp,'index.html'));
 fs.copyFileSync(path.join(root,'version.json'),path.join(temp,'version.json'));
 const names=new Set(tags.map(([,ref])=>new URL(ref,'https://fixture.invalid/').pathname.slice(1)));
 for(const name of fs.readdirSync(path.join(root,'vendor/shortcuts')).filter(name=>name.endsWith('.svg')))names.add('vendor/shortcuts/'+name);
 for(const name of names){const target=path.join(temp,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,name),target);}
 const updater=path.join(temp,'scripts/update-cache-versions.cjs');
 const run=(...args)=>execFileSync('rtk',['proxy',process.execPath,updater,...args],{stdio:'pipe'});
 run('--check');
 let previous=version;
 for(const name of ['app.js','index.html','vendor/shortcuts/uber.svg']){
  fs.appendFileSync(path.join(temp,name),'\n');
  assert.throws(()=>run('--check'),undefined,name+' makes the release stale');
  run();run('--check');
  const current=JSON.parse(fs.readFileSync(path.join(temp,'version.json'),'utf8')).version;
  assert.notEqual(current,previous,name+' changes the release');previous=current;
  const updated=fs.readFileSync(path.join(temp,'index.html'),'utf8');
  for(const [,ref] of updated.matchAll(/<(?:link|script)\b[^>]*?\b(?:href|src)="([^"]+)"/gi))assert.equal(new URL(ref,'https://fixture.invalid/').searchParams.get('v'),current);
 }
}finally{fs.rmSync(temp,{recursive:true,force:true});}

async function main(){
 const useChromium=process.env.CACHE_TEST_BROWSER==='chromium';
 const executablePath=useChromium?process.env.CHROMIUM_EXECUTABLE:process.env.FIREFOX_EXECUTABLE;
 const browser=await (useChromium?chromium:firefox).launch({headless:true,...(executablePath?{executablePath}:{}),...(useChromium?{args:['--disable-crash-reporter','--disable-crashpad','--disable-breakpad']}: {})});
 try{
  const old='1111111111111111',latest='2222222222222222';
  async function scenario({entryVersion,releaseVersion,offline=false,staleAfterRedirect=false}){
   const context=await browser.newContext();
   await context.addInitScript(()=>{if(!sessionStorage.getItem('cache-test-seeded')){localStorage.setItem('cache-test-data','kept');sessionStorage.setItem('cache-test-seeded','1');}});
   const docs=[],checks=[],errors=[];
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!=='https://cache-fixture.invalid')return route.abort();
    if(url.pathname==='/app/version.json'){
     checks.push(url.searchParams.get('_'));
     if(offline)return route.abort();
     return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:releaseVersion})});
    }
    if(url.pathname==='/app/'){
     docs.push(url.href);
     const rendered=url.searchParams.get('app-version')===releaseVersion&&!staleAfterRedirect?releaseVersion:entryVersion;
     const script=bootstrap.replace(/data-version="[^"]+"/,`data-version="${rendered}"`);
     return route.fulfill({status:200,contentType:'text/html',body:`<!doctype html><html><head>${script}</head><body><p>App available</p></body></html>`});
    }
    return route.abort();
   });
   const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
   await page.goto('https://cache-fixture.invalid/app/?keep=yes#journey');
   const updateExpected=!offline&&/^[a-f0-9]{16}$/.test(releaseVersion)&&entryVersion!==releaseVersion;
   if(updateExpected){
    await page.waitForURL(url=>url.searchParams.get('app-version')===releaseVersion);
    await page.waitForLoadState('domcontentloaded');
   }
   await page.waitForTimeout(250);
   const final=new URL(page.url());
   assert.equal(final.searchParams.get('keep'),'yes');assert.equal(final.hash,'#journey');
   assert.equal(await page.evaluate(()=>localStorage.getItem('cache-test-data')),'kept','User data survives update');
   assert.equal(await page.locator('body').innerText(),'App available');
   assert.ok(checks.every(Boolean),'Release checks use a cache-busting query');
   assert.equal(docs.length,updateExpected?2:1,'At most one update navigation');
   assert.deepEqual(errors,[]);
   await context.close();
  }
  await scenario({entryVersion:latest,releaseVersion:latest});
  await scenario({entryVersion:old,releaseVersion:latest});
  await scenario({entryVersion:old,releaseVersion:latest,staleAfterRedirect:true});
  await scenario({entryVersion:old,releaseVersion:latest,offline:true});
  await scenario({entryVersion:old,releaseVersion:'invalid-version'});
  const context=await browser.newContext();const page=await context.newPage();const external=[];
  await context.route(/^https?:/,route=>{external.push(route.request().url());return route.abort();});
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>window.AccessAdelaideBuildVersion),version);
  await page.locator('#setup-skip').click();await page.evaluate(()=>{location.hash='setup';});
  await page.locator('#setup-shortcuts-only').click();
  for(const app of ['uber','spotify','taxi'])await page.locator('#setup-pin-'+app).check();
  await page.locator('#setup-taxi-provider input[value="13cabs"]').check();
  await page.locator('#setup-save-shortcuts').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.shortcut-logo')].length===3&&[...document.querySelectorAll('.shortcut-logo')].every(img=>img.complete&&img.naturalWidth>0));
  assert.equal(await page.locator('.shortcut-logo').evaluateAll((images,current)=>images.every(img=>new URL(img.src).searchParams.get('v')===current),version),true,'Dynamically loaded shortcut artwork uses the release version');
  assert.deepEqual(external,[],'Local file never checks for an online release');
  await context.close();
  console.log('PASS cache versions: deterministic asset fingerprints; cached entry refresh; same-version/offline operation; no loop; preserved URL and user data; local file stays offline.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
