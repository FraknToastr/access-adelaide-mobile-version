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
const appHTML=path.resolve(process.env.APP_HTML||path.join(root,'index.html'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const entry=name==='/'||name==='/index.html';
 const target=entry?appHTML:path.resolve(root,'.'+name);
 if((process.env.APP_HTML&&!entry)||(!entry&&!target.startsWith(root+path.sep))||name.split('/').some(p=>p.startsWith('.'))||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
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
   // Capture the public adapter when the app creates it; no private app state.
   let basemaps;window.mapCreates=0;
   Object.defineProperty(window,'AccessBasemaps',{configurable:true,get:()=>basemaps,set:api=>{
    basemaps={...api,create(options){window.mapCreates++;return window.testMap=api.create(options);}};
   }});
  });
  await context.route('**/*',route=>route.request().url().startsWith(base)||route.request().url().startsWith('file:')?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  const START=[138.59688,-34.9215],END=[138.60302,-34.92048];
  const selectedPoint=target=>({textContent:()=>page.evaluate(target=>{const coords=window.testMap?.routeEndpoints?.[target==='start'?0:1];return coords?coords.map(n=>n.toFixed(5)).join(', '):'No point selected.';},target)});
  const choice=target=>page.locator(target==='start'?'#choose-start-map':'#choose-end-map');
  const centre=()=>page.evaluate(()=>testMap.getCenterCoordinates());
  const assertCentre=(actual,expected)=>{assert.ok(Math.abs(actual[0]-expected[0])<1e-8);assert.ok(Math.abs(actual[1]-expected[1])<1e-8);};
  async function openChoice(target){
   await choice(target).click();await page.waitForSelector('#map-selection:visible');
   assert.equal(await page.evaluate(()=>location.hash),'#journey');
   assert.equal(await page.locator('#journey-map-slot #map-panel').count(),1);
   assert.equal(await page.locator('#map').count(),1);
   assert.equal(await page.locator('#locate-me').isVisible(),target==='start');
   assert.equal(await page.locator('#toggle-big-map').isVisible(),false);
   assert.equal(await page.locator('#toggle-map-legend').isVisible(),false);
   const canvas=await page.locator('#map').boundingBox(),startButton=await choice('start').boundingBox(),endButton=await choice('end').boundingBox(),selection=await page.locator('#map-selection').boundingBox();
   assert.ok(startButton.y+startButton.height<=canvas.y+1&&endButton.y+endButton.height<=canvas.y+1,'both choices stay above the map');
   assert.ok(canvas.y+canvas.height<=selection.y+1,'map canvas stays above selection controls');
   if(target==='start'){const gps=await page.locator('#locate-me').boundingBox();assert.ok(gps.x>=canvas.x-1&&gps.y>=canvas.y-1&&gps.x+gps.width<=canvas.x+canvas.width+1&&gps.y+gps.height<=canvas.y+canvas.height+1,'Locate me sits on the map');}
  }
  async function choosePoint(target,coords,{tap=false}={}){
   await openChoice(target);await page.evaluate(c=>testMap.jumpTo({center:c}),coords);
   if(tap){const box=await page.locator('#map').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);}
   // Keep representative route assertions independent of subpixel mouse rounding.
   await page.evaluate(c=>testMap.jumpTo({center:c}),coords);
   await page.locator('#confirm-map-location').click();
   assert.equal(await page.evaluate(()=>location.hash),'#journey');
   assert.equal(await page.locator('#map-panel').isVisible(),true);
   assert.equal(await page.locator('#locate-me').isVisible(),false);
  }
  async function calculate(){await page.locator('#calculate-route').click();await page.waitForSelector('#journey-result:visible');}
  async function installPendingGPS(){
   await page.evaluate(()=>{window.gpsReply=null;navigator.geolocation.getCurrentPosition=(success,failure)=>{window.gpsReply={success,failure};};});
   await page.locator('#locate-me').click();assert.equal(await page.locator('#locate-me').getAttribute('aria-busy'),'true');
  }
  async function replyGPS(coords){await page.evaluate(c=>gpsReply.success({coords:{longitude:c[0],latitude:c[1],accuracy:5}}),coords);}
  await page.goto(base+'/#journey');await page.waitForSelector('#calculate-route');
  assert.equal(await page.locator('input[name="route-style"]:checked').inputValue(),'shortest');
  assert.equal(await page.locator('#selected-locations,#map-selection-title').count(),0);
  assert.equal(await page.locator('#origin-text,#destination-text,#sample-start-choices,#sample-end-choices').count(),0);
  assert.equal(await page.locator('#locate-me').isVisible(),false);
  assert.equal((await page.content()).includes('Test network only. Accessibility and opening hours are unverified. Endpoints must be within 50 metres of an eligible path; offsets are not part of the route.'),false);
  await page.locator('#calculate-route').click();assert.equal(await page.locator('#journey-result').isVisible(),false);assert.match(await page.locator('#routing-status').innerText(),/choose/i);

  // GPS supplies a draft start and never commits it without confirmation.
  await openChoice('start');const unsetStart=await selectedPoint('start').textContent();
  await page.waitForFunction(()=>document.activeElement.id==='map');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'locate-me');
  await installPendingGPS();await replyGPS(START);assertCentre(await centre(),START);
  assert.equal(await selectedPoint('start').textContent(),unsetStart);
  await page.locator('#confirm-map-location').click();assert.match(await selectedPoint('start').textContent(),/34\.92150/);
  assert.equal(await page.locator('#selected-locations,#map-selection-title').count(),0);
  await choosePoint('end',END,{tap:true});
  assert.match(await selectedPoint('end').textContent(),/34\.92048/);
  assert.equal(await page.locator('.route-endpoint').count(),2);
  const committedStart=await selectedPoint('start').textContent(),committedEnd=await selectedPoint('end').textContent();
  await openChoice('start');await page.evaluate(()=>testMap.jumpTo({center:[138.6,-34.922]}));
  await openChoice('end');assert.equal(await selectedPoint('start').textContent(),committedStart);
  await page.keyboard.press('Escape');assert.equal(await selectedPoint('end').textContent(),committedEnd);assert.equal(await page.locator('#locate-me').isVisible(),false);

  // Permission failure and stale callbacks on target changes, manual pan, cancel,
  // and navigation must never overwrite a confirmed point or move the wrong map.
  await openChoice('start');await page.evaluate(()=>navigator.geolocation.getCurrentPosition=(success,failure)=>failure({code:1}));
  await page.locator('#locate-me').click();assert.match(await page.locator('#location-status').innerText(),/not granted|denied/i);assert.equal(await page.locator('#locate-me').isEnabled(),true);
  await installPendingGPS();await openChoice('end');let keptCentre=await centre();await replyGPS([139,-35]);assertCentre(await centre(),keptCentre);assert.equal(await selectedPoint('start').textContent(),committedStart);
  await openChoice('start');await installPendingGPS();
  if(!await page.locator('#map-directions').isVisible())await page.locator('#toggle-map-directions').click();
  await page.locator('[data-pan="north"]').click();keptCentre=await centre();await replyGPS([139,-35]);assertCentre(await centre(),keptCentre);assert.equal(await page.locator('#locate-me').isEnabled(),true);
  await installPendingGPS();await page.locator('#cancel-map-location').click();keptCentre=await centre();await replyGPS([139,-35]);assertCentre(await centre(),keptCentre);assert.equal(await selectedPoint('start').textContent(),committedStart);
  await openChoice('start');await installPendingGPS();await page.locator('#bottom-nav a[href="#access"]').click();await page.waitForSelector('#view-access:not([hidden])');await replyGPS([139,-35]);assert.equal(await selectedPoint('start').textContent(),committedStart);
  await page.locator('#bottom-nav a[href="#journey"]').click();await page.waitForSelector('#view-journey:not([hidden])');
  assert.equal(await page.locator('#locate-me').isVisible(),false);

  await calculate();assert.match(await page.locator('#route-summary').innerText(),/774 m/);assert.match(await page.locator('#route-summary').innerText(),/Start snapped/);assert.ok(await page.locator('#step-guide li').count()>1);
  await page.locator('#save-route').click();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('access-adelaide-journey-v1')));assert.equal(saved.version,2);assert.ok(saved.points.start.coords);
  const downloadPromise=page.waitForEvent('download');await page.locator('#download-route').click();const download=await downloadPromise;
  const text=fs.readFileSync(await download.path(),'utf8');assert.match(text,/Network distance: 774 m/);assert.doesNotMatch(text,/Illustrative distance/);
  await page.locator('#route-map').click();assert.equal(await page.evaluate(()=>location.hash),'#journey');assert.equal(await page.locator('#journey-map-slot #map-panel').count(),1);await page.locator('#fit-route').click();
  await page.goto(base+'/#journey');await page.locator('#load-saved').click();await page.waitForSelector('#journey-result:visible');assert.match(await page.locator('#route-summary').innerText(),/774 m/);

  // Previously saved coordinate-backed sample endpoints remain usable; the
  // removed sample-name picker is not needed to load an existing coordinate save.
  await page.evaluate(spec=>{spec.points.start.kind='sample';spec.points.end.kind='sample';localStorage.setItem('access-adelaide-journey-v1',JSON.stringify(spec));},saved);
  await page.goto(base+'/#journey');await page.locator('#load-saved').click();await page.waitForSelector('#journey-result:visible');
  await page.evaluate(()=>localStorage.setItem('access-adelaide-journey-v1',JSON.stringify({origin:'Railway Station entrance',destinationLabel:'Cultural precinct toilet',style:'rest'})));
  await page.goto(base+'/#journey');await page.locator('#load-saved').click();assert.match(await page.locator('#routing-status').innerText(),/old illustrative/i);assert.equal(await page.locator('#journey-result').isVisible(),false);
  await page.locator('#calculate-route').click();assert.equal(await page.locator('#journey-result').isVisible(),false);
  await choosePoint('start',[139,-35]);await choosePoint('end',END);await page.locator('#calculate-route').click();await page.waitForFunction(()=>document.querySelector('#routing-status').textContent.includes('50'));assert.equal(await page.locator('#journey-result').isVisible(),false);
  await choosePoint('start',START);await calculate();

  // The one shared map returns to Explore without changing its prior list mode.
  await page.locator('#bottom-nav a[href="#explore"]').click();await page.locator('#show-list').click();
  assert.equal(await page.locator('#map-panel').isVisible(),false);const creates=await page.evaluate(()=>mapCreates);
  await page.locator('#bottom-nav a[href="#journey"]').click();await openChoice('start');await page.locator('#cancel-map-location').click();
  await page.locator('#bottom-nav a[href="#explore"]').click();assert.equal(await page.locator('#map-panel').isVisible(),false);assert.equal(await page.locator('#show-list').getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>mapCreates),creates);
  await page.locator('#show-map').click();assert.equal(await page.locator('#toggle-big-map').isVisible(),true);assert.equal(await page.locator('#toggle-map-legend').isVisible(),true);assert.ok(await page.locator('.fallback-marker').count()>0);
  await page.locator('#toggle-big-map').click();const canvas=await page.locator('#map').boundingBox(),panel=await page.locator('.map-control-panel').boundingBox();assert.ok(canvas.y+canvas.height<=panel.y+2,'large map stays above controls');
  await page.locator('#toggle-map-legend').click();assert.equal(await page.locator('#map-legend-view').isVisible(),true);await page.locator('#close-map-legend').click();await page.locator('#toggle-big-map').click();
  await page.locator('#bottom-nav a[href="#journey"]').click();

  // Every supported type size, narrow viewport, contrast and reduced-motion mode.
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const size of ['100','125','150']){
   await page.evaluate(value=>{const field=document.querySelector(`#text-size input[value="${value}"]`);field.checked=true;field.dispatchEvent(new Event('change',{bubbles:true}));},size);
   for(const width of [320,390,412]){
    await page.setViewportSize({width,height:844});await openChoice('start');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`page overflow at ${width}/${size}%`);
    const overflow=await page.locator('#view-journey button').evaluateAll(buttons=>buttons.filter(b=>b.getClientRects().length&&b.scrollWidth>b.clientWidth+2).map(b=>b.textContent));assert.deepEqual(overflow,[],`button overflow at ${width}/${size}%`);
    await page.locator('#cancel-map-location').click();
   }
  }
  await page.setViewportSize({width:390,height:844});await openChoice('start');await page.screenshot({path:path.join(os.tmpdir(),'adelaide-inline-journey-map.png')});await page.locator('#cancel-map-location').click();
  await page.setViewportSize({width:1024,height:844});await calculate();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));

  // Local scripts and map picking continue working from file:// offline.
  await page.goto(pathToFileURL(appHTML).href+'#journey');await choosePoint('start',START);await choosePoint('end',END);await calculate();assert.match(await page.locator('#route-summary').innerText(),/774 m/);

  // Deliberately slow calculations expose navigation, selection and reset races.
  await page.goto(base+'/#journey');await page.evaluate(()=>{const real=window.AccessRouting;window.AccessRouting={...real,create:async data=>{const engine=await real.create(data);return{...engine,calculate:async spec=>{await new Promise(resolve=>setTimeout(resolve,250));return engine.calculate(spec);}};}};});
  await choosePoint('start',START);await choosePoint('end',END);await page.locator('#calculate-route').click();
  await page.evaluate(()=>{location.hash='access';});await page.waitForSelector('#view-access:not([hidden])');await page.waitForTimeout(400);assert.equal(await page.locator('#journey-result').isVisible(),false);assert.notEqual(await page.evaluate(()=>document.activeElement.id),'result-title');
  await page.locator('#bottom-nav a[href="#journey"]').click();assert.equal(await page.locator('#calculate-route').isEnabled(),true);
  await page.evaluate(()=>{document.querySelector('#journey-form').requestSubmit();document.querySelector('#choose-start-map').click();});await page.waitForSelector('#map-selection:visible');await page.waitForTimeout(400);assert.equal(await page.locator('#journey-result').isVisible(),false);await page.locator('#cancel-map-location').click();
  await page.evaluate(()=>{AccessBasemaps.configure({key:'test-key-kept-by-secret-reset',rememberKey:true,preferred:'esri'});document.querySelector('#journey-form').requestSubmit();document.querySelector('#factory-reset').click();});await page.waitForTimeout(400);
  assert.equal(await page.locator('#calculate-route').isEnabled(),true);assert.equal(await page.locator('#calculate-route').getAttribute('aria-busy'),null);assert.equal(await page.evaluate(()=>AccessBasemaps.getConfig().key),'test-key-kept-by-secret-reset');assert.equal(await page.locator('#journey-result').isVisible(),false);assert.equal(await page.locator('#selected-locations,#map-selection-title').count(),0);
  await page.waitForSelector('#view-setup:not([hidden])');
  for(let step=0;step<6;step++)await page.locator('#setup-next').click();await page.waitForSelector('#view-explore:not([hidden])');
  await page.locator('[data-category]').first().click();assert.ok(await page.locator('#places li').count()>0);
  const row=await page.locator('#bottom-nav a').evaluateAll(items=>items.map(item=>Math.round(item.getBoundingClientRect().top)));assert.equal(new Set(row).size,1);
  const hideNav=page.getByRole('button',{name:'Hide navigation',exact:true});if(await hideNav.count()){await hideNav.click();await page.getByRole('button',{name:'Show navigation',exact:true}).click();}
  await page.locator('#bottom-nav a[href="#help"]').click();assert.ok(await page.locator('#map-credits-text').count());assert.equal(await page.locator('#platform-guide').getAttribute('open'),null);
  await page.locator('#communication').locator('..').locator('summary').click();await page.locator('#communication').fill('Please give me more time.');await page.locator('#show-card').click();assert.equal(await page.locator('dialog[open]').count(),1);await page.locator('dialog[open] [data-close]').first().click();
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS browser: inline Journey map, confirmed endpoint state, confirmed map/GPS endpoints, stale GPS/calculation races, one shared map, saved/legacy routes, download, Explore state/controls, offline file://, 100/125/150% text at 320/390/412 px and existing setup/navigation/Help.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
