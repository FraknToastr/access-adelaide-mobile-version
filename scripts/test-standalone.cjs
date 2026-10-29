'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const root=path.resolve(__dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'adelaide-standalone-'));
const file=path.join(temp,'Access_Adelaide.html'),url=pathToFileURL(file).href;
const run=(script,env=process.env)=>execFileSync('rtk',['proxy',process.execPath,path.join(root,'scripts',script)],{env,stdio:'inherit'});
async function main(){
 execFileSync('rtk',['proxy',process.execPath,path.join(root,'scripts/build-standalone.cjs'),'--check'],{stdio:'inherit'});
 // Verify and extract the actual distributable into an otherwise empty folder.
 const verify=`import pathlib, sys, zipfile
archive, source, target = map(pathlib.Path, sys.argv[1:])
with zipfile.ZipFile(archive) as z:
    assert z.namelist() == ['Access_Adelaide.html'], z.namelist()
    data = z.read('Access_Adelaide.html')
    assert data == source.read_bytes(), 'ZIP differs from generated HTML'
    target.write_bytes(data)
`;
 execFileSync('rtk',['proxy','python3','-c',verify,path.join(root,'standalone/Access_Adelaide.zip'),path.join(root,'standalone/Access_Adelaide.html'),file],{stdio:'inherit'});
 const browser=await firefox.launch({headless:true,...(process.env.FIREFOX_EXECUTABLE?{executablePath:process.env.FIREFOX_EXECUTABLE}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
  await context.addInitScript(()=>{
   localStorage.clear();
   localStorage.setItem('access-adelaide-basemap-v1',JSON.stringify({force2D:true,preferred:'esri'}));
   let basemaps;
   Object.defineProperty(window,'AccessBasemaps',{configurable:true,get:()=>basemaps,set:api=>{basemaps={...api,create(options){return window.testMap=api.create(options);}};}});
  });
  const localRequests=[],errors=[];
  await context.route('**/*',route=>{
   const request=route.request().url();
   if(request===url||request.startsWith('data:')||request.startsWith('blob:'))return route.continue();
   if(request.startsWith('file:'))localRequests.push(request);
   return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.waitForSelector('#setup-skip');
  assert.match(await page.locator('#factory-reset').innerText(),/Reset Demo/i);
  assert.equal(await page.locator('script[src],link[rel="stylesheet"]').count(),0);
  assert.equal(await page.locator('#cache-bootstrap').count(),0,'Standalone does not poll the web release');
  const metadata=await page.evaluate(()=>({build:JSON.parse(document.querySelector('#standalone-build').textContent),notices:JSON.parse(document.querySelector('#third-party-notices').textContent),graph:AccessRoutingData.metadata}));
  assert.equal(metadata.graph.edgeCount,7280);assert.equal(metadata.graph.nodeCount,5168);
  const digest=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'app.js'))).digest('hex');
  assert.equal(metadata.build.sources['app.js'],digest);assert.ok(metadata.notices['vendor/MAPLIBRE-LICENSE.txt']);assert.ok(metadata.notices['vendor/OPENDYSLEXIC-LICENSE.txt']);
  await page.locator('#setup-skip').click();await page.waitForSelector('#view-explore:not([hidden])');
  assert.equal(await page.locator('#support-dock').isVisible(),false);
  // Exercise all bundled shortcut logos, including the dynamically selected taxi.
  await page.evaluate(()=>{location.hash='setup';});await page.locator('#setup-shortcuts-only').click();
  for(const app of ['uber','spotify','taxi','phone'])await page.locator('#setup-pin-'+app).check();
  await page.locator('#setup-taxi-provider input[value="13cabs"]').check();
  await page.locator('[data-setup-tool="read"]').check();await page.locator('[data-setup-tool="communicate"]').check();
  await page.locator('#setup-save-shortcuts').click();await page.waitForSelector('#view-explore:not([hidden])');
  await page.waitForFunction(()=>[...document.querySelectorAll('.shortcut-logo')].length===3&&[...document.querySelectorAll('.shortcut-logo')].every(img=>img.complete&&img.naturalWidth>0));
  assert.equal(await page.locator('.shortcut-logo').evaluateAll(images=>images.every(img=>img.src.startsWith('data:image/svg+xml;base64,'))),true);
  await page.evaluate(()=>{location.hash='setup';});await page.locator('#setup-dyslexic').click();
  assert.equal(await page.evaluate(()=>AccessAdelaide.getSettings().textSize),'100');assert.equal(await page.locator('#setup-text-label').innerText(),'Bigger Text');
  await page.locator('#setup-smaller').click();assert.equal(await page.evaluate(()=>AccessAdelaide.getSettings().textSize),'125');assert.equal(await page.locator('#setup-text-label').innerText(),'Smaller Text');
  await page.evaluate(()=>{location.hash='journey';});await page.waitForSelector('#choose-start-map');
  assert.deepEqual(await page.locator('#pace strong').allTextContents(),['Walking','Wheelchair','Powered Wheelchair/Mobility Scooter']);
  await page.locator('#choose-start-map').click();await page.waitForSelector('#map-selection:visible');
  await page.evaluate(()=>navigator.geolocation.getCurrentPosition=success=>success({coords:{longitude:138.59688,latitude:-34.9215}}));
  await page.locator('#locate-me').click();await page.locator('#confirm-map-location').click();
  await page.locator('#choose-end-map').click();assert.equal(await page.locator('#locate-me').isVisible(),false);
  await page.evaluate(()=>testMap.jumpTo({center:[138.60302,-34.92048]}));await page.locator('#confirm-map-location').click();
  await page.locator('#calculate-route').click();await page.waitForSelector('#journey-result:visible');assert.match(await page.locator('#route-summary').innerText(),/774 m/);
  await page.evaluate(()=>AccessAdelaide.setSettings({spacing:true}));await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.fonts.check('16px OpenDyslexic')),true);
  for(const width of [320,390,412]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Standalone overflow at '+width);}
  assert.deepEqual(localRequests,[],'Standalone requested sidecar files');assert.deepEqual(errors,[]);
  await page.evaluate(()=>AccessBasemaps.configure({key:'standalone-reset-fixture',rememberKey:true}));await page.locator('#factory-reset').click();await page.waitForSelector('#view-setup:not([hidden])');
  assert.equal(await page.evaluate(()=>AccessBasemaps.getConfig().key),'standalone-reset-fixture');
  await context.close();
 }finally{await browser.close();}
 // Run every scenario against the isolated extracted file without a localhost server.
 const env={...process.env,APP_HTML:file,FILE_ONLY:'1'};
 run('test-routing-browser.cjs',env);run('test-dyslexic-scale-browser.cjs',env);run('test-shared-ui-browser.cjs',env);run('test-cache-versions.cjs',env);run('test-setup-needs-browser.cjs',env);
 console.log('PASS standalone: one-file ZIP, source parity, embedded assets/licenses, isolated offline file://, routing, Dyslexic, shared-UI, cache-version and setup-needs regression suites.');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>fs.rmSync(temp,{recursive:true,force:true}));
