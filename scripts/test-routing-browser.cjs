'use strict';
// npm dependencies are optional for app runtime. Supply an installed Playwright
// package and Firefox runtime through the two environment variables below.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const os=require('node:os');
const {pathToFileURL}=require('node:url');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!target.startsWith(root+path.sep)||name.split('/').some(p=>p.startsWith('.'))||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res);
});
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await firefox.launch({headless:true,...(process.env.FIREFOX_EXECUTABLE?{executablePath:process.env.FIREFOX_EXECUTABLE}:{})});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
  await context.addInitScript(()=>{
   try{
    localStorage.setItem('access-adelaide-support-v2',JSON.stringify({version:2,complete:true}));
    localStorage.setItem('access-adelaide-settings-v1',JSON.stringify({remember:true,textSize:'150',theme:'contrast',motion:true}));
    localStorage.setItem('access-adelaide-basemap-v1',JSON.stringify({force2D:true,preferred:'esri'}));
   }catch{}
  });
  await context.route('**/*',route=>route.request().url().startsWith(base)||route.request().url().startsWith('file:')?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/#journey');
  await page.waitForSelector('#calculate-route');
  assert.equal(await page.locator('input[name="route-style"]:checked').inputValue(),'shortest');
  await page.locator('#origin-text').fill('Unknown typed address');
  await page.locator('#destination-text').fill('Unknown destination');
  await page.locator('#calculate-route').click();
  await page.waitForFunction(()=>document.querySelector('#routing-status').textContent.includes('not geocoded'));
  assert.equal(await page.locator('#journey-result').isVisible(),false);
  async function choose(target,label){
   await page.locator(`#sample-${target}-choices`).locator('..').locator('summary').click();
   await page.locator(`#sample-${target}-choices button`).filter({hasText:label}).first().click();
  }
  await choose('start','Railway Station entrance');await choose('end','Cultural precinct toilet');
  await page.locator('#calculate-route').click();await page.waitForSelector('#journey-result:visible');
  assert.match(await page.locator('#route-summary').innerText(),/774 m/);
  assert.match(await page.locator('#route-summary').innerText(),/Start snapped/);
  const stepCount=await page.locator('#step-guide li').count();assert.ok(stepCount>1);
  await page.locator('#save-route').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('access-adelaide-journey-v1')));assert.equal(saved.version,2);assert.equal(saved.profile,'shortest');assert.ok(saved.points.start.coords);
  const downloadPromise=page.waitForEvent('download');await page.locator('#download-route').click();const download=await downloadPromise;
  const text=fs.readFileSync(await download.path(),'utf8');assert.match(text,/Network distance: 774 m/);assert.doesNotMatch(text,/Illustrative distance/);
  await page.locator('#route-map').click();await page.waitForSelector('#view-explore:not([hidden])');
  await page.waitForSelector('.route-endpoint-start');assert.equal(await page.locator('.route-endpoint').count(),2);
  await page.locator('#fit-route').click();
  await page.goto(base+'/#journey');await page.locator('#load-saved').click();await page.waitForSelector('#journey-result:visible');
  await page.locator('#choose-start-map').click();await page.waitForSelector('#map-selection:visible');
  assert.equal(await page.locator('#selection-crosshair').isVisible(),true);
  await page.locator('#toggle-map-directions').click();await page.locator('[data-pan="north"]').click();
  const selectionText=await page.locator('#map-selection-position').innerText();assert.match(selectionText,/Crosshair:/);
  await page.locator('#confirm-map-location').click();await page.waitForSelector('#view-journey:not([hidden])');
  assert.match(await page.locator('#origin-text').inputValue(),/^Map point/);
  const previous=await page.locator('#origin-text').inputValue();await page.locator('#choose-start-map').click();await page.waitForSelector('#map-selection:visible');await page.keyboard.press('Escape');await page.waitForSelector('#view-journey:not([hidden])');assert.equal(await page.locator('#origin-text').inputValue(),previous);
  await page.locator('#origin-text').fill('Edited unknown place');await page.locator('#calculate-route').click();assert.equal(await page.locator('#journey-result').isVisible(),false);
  await page.evaluate(()=>navigator.geolocation.getCurrentPosition=(success,failure)=>failure({code:1}));
  await page.locator('#locate-me').click();assert.match(await page.locator('#location-status').innerText(),/not granted/);
  await page.evaluate(()=>localStorage.setItem('access-adelaide-journey-v1',JSON.stringify({origin:'Railway Station entrance',destinationLabel:'Cultural precinct toilet',style:'rest'})));
  await page.goto(base+'/#journey');await page.locator('#load-saved').click();assert.match(await page.locator('#routing-status').innerText(),/old illustrative/);assert.equal(await page.locator('#journey-result').isVisible(),false);
  assert.equal(await page.locator('#origin-text').inputValue(),'');assert.equal(await page.locator('#destination-text').inputValue(),'');
  await page.locator('#calculate-route').click();assert.match(await page.locator('#routing-status').innerText(),/not geocoded/);
  // Repeat real routing and layout checks in largest type/dark contrast at all sizes.
  await choose('start','Railway Station entrance');await choose('end','Cultural precinct toilet');
  for(const width of [320,390,412,1024]){
   await page.setViewportSize({width,height:844});await page.locator('#calculate-route').click();await page.waitForSelector('#journey-result:visible');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`page overflow at ${width}`);
   const overflow=await page.locator('#view-journey button').evaluateAll(buttons=>buttons.filter(b=>b.getClientRects().length&&b.scrollWidth>b.clientWidth+2).map(b=>b.textContent));assert.deepEqual(overflow,[],`button overflow at ${width}`);
  }
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(os.tmpdir(),'adelaide-routing-journey.png')});
  // Local scripts load directly from file://; all external requests remain blocked.
  await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#journey');
  await choose('start','Railway Station entrance');await choose('end','Cultural precinct toilet');
  await page.locator('#calculate-route').click();await page.waitForSelector('#journey-result:visible');assert.match(await page.locator('#route-summary').innerText(),/774 m/);
  // Deliberately slow calculations expose cancellation/focus/reset races.
  await page.goto(base+'/#journey');
  await page.evaluate(()=>{
   const real=window.AccessRouting;
   window.AccessRouting={...real,create:async data=>{const engine=await real.create(data);return{...engine,calculate:async spec=>{await new Promise(resolve=>setTimeout(resolve,250));return engine.calculate(spec);}};}};
  });
  await choose('start','Railway Station entrance');await choose('end','Cultural precinct toilet');
  await page.locator('#calculate-route').click();
  await page.evaluate(()=>{location.hash='access';});await page.waitForSelector('#view-access:not([hidden])');
  await page.waitForTimeout(400);assert.equal(await page.locator('#journey-result').isVisible(),false);assert.notEqual(await page.evaluate(()=>document.activeElement.id),'result-title');
  await page.evaluate(()=>{location.hash='journey';});await page.waitForSelector('#view-journey:not([hidden])');assert.equal(await page.locator('#calculate-route').isEnabled(),true);
  await page.evaluate(()=>{document.querySelector('#journey-form').requestSubmit();document.querySelector('#choose-start-map').click();});
  await page.waitForSelector('#map-selection:visible');await page.waitForTimeout(400);assert.equal(await page.locator('#journey-result').isVisible(),false);
  await page.locator('#cancel-map-location').click();await page.waitForSelector('#view-journey:not([hidden])');
  await page.evaluate(()=>{
   AccessBasemaps.configure({key:'test-key-kept-by-secret-reset',rememberKey:true,preferred:'esri'});
   document.querySelector('#journey-form').requestSubmit();document.querySelector('#factory-reset').click();
  });
  await page.waitForTimeout(400);assert.equal(await page.locator('#calculate-route').isEnabled(),true);assert.equal(await page.locator('#calculate-route').getAttribute('aria-busy'),null);
  assert.equal(await page.evaluate(()=>AccessBasemaps.getConfig().key),'test-key-kept-by-secret-reset');
  assert.equal(await page.locator('#journey-result').isVisible(),false);assert.equal(await page.locator('#routing-status').innerText(),'');
  await page.waitForSelector('#view-setup:not([hidden])');
  // Existing onboarding, categories, map layout, navigation and Help remain usable.
  for(let step=0;step<6;step++)await page.locator('#setup-next').click();
  await page.waitForSelector('#view-explore:not([hidden])');
  await page.locator('[data-category]').first().click();assert.ok(await page.locator('#places li').count()>0);
  await page.locator('#show-map').click();await page.locator('#toggle-big-map').click();
  const canvas=await page.locator('#map').boundingBox(),panel=await page.locator('.map-control-panel').boundingBox();assert.ok(canvas.y+canvas.height<=panel.y+2,'large map stays above controls');
  await page.locator('#toggle-map-legend').click();assert.equal(await page.locator('#map-legend-view').isVisible(),true);await page.locator('#close-map-legend').click();await page.locator('#toggle-big-map').click();
  const nav=page.locator('#bottom-nav a');const row=await nav.evaluateAll(items=>items.map(item=>Math.round(item.getBoundingClientRect().top)));assert.equal(new Set(row).size,1);
  const hideNav=page.getByRole('button',{name:'Hide navigation',exact:true});
  if(await hideNav.count()){await hideNav.click();await page.getByRole('button',{name:'Show navigation',exact:true}).click();}
  await page.locator('#bottom-nav a[href="#help"]').click();
  assert.ok(await page.locator('#map-credits-text').count());assert.equal(await page.locator('#platform-guide').getAttribute('open'),null);
  await page.locator('#communication').locator('..').locator('summary').click();await page.locator('#communication').fill('Please give me more time.');await page.locator('#show-card').click();assert.equal(await page.locator('dialog[open]').count(),1);await page.locator('dialog[open] [data-close]').first().click();
  assert.deepEqual(errors,[]);
  await context.close();console.log('PASS browser: real routes, unresolved text, save/reload/legacy, download, map endpoints/pan/confirm/cancel, GPS denial, offline file://, 320/390/412/1024 layouts and stale calculation/reset races.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
