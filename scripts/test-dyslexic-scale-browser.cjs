'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const os=require('node:os');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const root=path.resolve(__dirname,'..');
const appHTML=path.resolve(process.env.APP_HTML||path.join(root,'index.html'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const entry=pathname==='/'||pathname==='/index.html';
 const target=entry?appHTML:path.resolve(root,'.'+pathname);
 if((process.env.APP_HTML&&!entry)||(!entry&&!target.startsWith(root+path.sep))||pathname.split('/').some(p=>p.startsWith('.'))||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res);
});
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await firefox.launch({headless:true,...(process.env.FIREFOX_EXECUTABLE?{executablePath:process.env.FIREFOX_EXECUTABLE}:{})});
 const errors=[];
 try{
  async function open(seed={}){
   const context=await browser.newContext({viewport:{width:390,height:844}});
   await context.addInitScript(data=>{
    if(sessionStorage.getItem('dyslexic-scale-seeded'))return;
    localStorage.clear();
    if(data.settings)localStorage.setItem('access-adelaide-settings-v1',JSON.stringify(data.settings));
    if(data.profile)localStorage.setItem('access-adelaide-support-v2',JSON.stringify(data.profile));
    localStorage.setItem('access-adelaide-basemap-v1',JSON.stringify({force2D:true,preferred:'esri'}));
    sessionStorage.setItem('dyslexic-scale-seeded','1');
   },seed);
   await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
   const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/#setup');await page.waitForSelector('#setup-smaller');
   return{context,page};
  }
  async function size(page,expected,{dyslexic=true}={}){
   const actual=await page.evaluate(()=>({settings:AccessAdelaide.getSettings(),scale:AccessAdelaide.getTextScale(),root:document.documentElement.style.fontSize,large:document.querySelector('.app-shell').classList.contains('large-text')}));
   assert.equal(actual.settings.textSize,expected);assert.equal(actual.settings.dyslexicFont,dyslexic);assert.equal(actual.root,expected+'%');
   assert.deepEqual(actual.scale.sizes,dyslexic?['100','125']:['100','125','150']);
   assert.equal(actual.large,expected===(dyslexic?'125':'150'));
  }
  async function set(page,patch){await page.evaluate(value=>AccessAdelaide.setSettings(value),patch);}
  async function navigate(page,view){await page.evaluate(value=>{location.hash=value;},view);await page.waitForSelector(`#view-${view}:not([hidden])`);}
  async function checkOptions(page,group,dyslexic){
   const largest=page.locator(`#${group} input[value="150"]`);
   assert.equal(await largest.isDisabled(),dyslexic);
   assert.equal(await largest.locator('..').isVisible(),!dyslexic);
   assert.match(await page.locator(`#${group} input[value="125"]`).locator('..').innerText(),dyslexic?/largest/i:/larger/i);
  }
  const first=await open(),page=first.page;
  await size(page,'150',{dyslexic:false});
  await page.locator('#setup-dyslexic').click();await size(page,'125');
  assert.equal(await page.locator('#setup-text-label').innerText(),'Smaller Text');
  await page.locator('#setup-smaller').click();await size(page,'100');assert.equal(await page.locator('#setup-text-label').innerText(),'Bigger Text');
  await page.locator('#setup-smaller').click();await size(page,'125');assert.equal(await page.locator('#setup-text-label').innerText(),'Smaller Text');
  // The shared control behaves consistently on each subsequent setup screen.
  for(let step=1;step<=5;step++){
   await page.locator('#setup-next').click();
   await page.locator('#setup-smaller').click();await size(page,'100');assert.equal(await page.locator('#setup-text-label').innerText(),'Bigger Text');
   await page.locator('#setup-smaller').click();await size(page,'125');
  }
  await page.locator('#setup-next').click();await page.waitForSelector('#view-explore:not([hidden])');
  await navigate(page,'setup');await set(page,{textSize:'100'});
  await page.locator('#setup-dyslexic').click();await size(page,'100',{dyslexic:false});
  await page.locator('#setup-dyslexic').click();await size(page,'100');
  await set(page,{dyslexicFont:false,textSize:'125'});await page.locator('#setup-dyslexic').click();await size(page,'125');
  await set(page,{textSize:'150'});await size(page,'125');
  await navigate(page,'access');await checkOptions(page,'text-size',true);
  await page.evaluate(()=>document.querySelector('#quick-display-dialog').showModal());await checkOptions(page,'quick-text-size',true);
  await page.locator('#quick-text-size input[value="100"]').check();await size(page,'100');
  await page.locator('#quick-text-size input[value="125"]').check();await size(page,'125');
  await page.locator('#quick-display-dialog [data-close]').first().click();
  await set(page,{dyslexicFont:false});await size(page,'125',{dyslexic:false});await checkOptions(page,'text-size',false);
  await page.evaluate(()=>document.querySelector('#quick-display-dialog').showModal());await checkOptions(page,'quick-text-size',false);await page.locator('#quick-display-dialog [data-close]').first().click();
  await set(page,{dyslexicFont:true,textSize:'100'});await page.locator('[data-preset="clear"]').click();await size(page,'125');
  await page.locator('[data-preset="touch"]').click();await size(page,'125');
  await navigate(page,'setup');await page.locator('#setup-next').click();await page.locator('[data-need][value="seeing"]').check();await size(page,'125');
  for(let step=2;step<=5;step++)await page.locator('#setup-next').click();
  await page.locator('#setup-remember').check();await page.locator('#setup-next').click();await page.waitForSelector('#view-explore:not([hidden])');
  const persisted=await page.evaluate(()=>({settings:JSON.parse(localStorage.getItem('access-adelaide-settings-v1')),profile:JSON.parse(localStorage.getItem('access-adelaide-support-v2'))}));
  assert.equal(persisted.settings.textSize,'125');assert.equal(persisted.profile.settings.textSize,'125');
  await page.reload();await size(page,'125');await first.context.close();

  // Existing persisted settings and support profiles cannot revive the old cap.
  const old={remember:true,textSize:'150',dyslexicFont:true,theme:'contrast'};
  for(const seed of [{settings:old},{settings:{...old,dyslexicFont:false},profile:{version:2,complete:true,remember:true,settings:old}}]){
   const current=await open(seed);await size(current.page,'125');
   const stored=await current.page.evaluate(()=>({settings:JSON.parse(localStorage.getItem('access-adelaide-settings-v1')),profile:JSON.parse(localStorage.getItem('access-adelaide-support-v2'))}));
   assert.equal(stored.settings.textSize,'125');if(seed.profile)assert.equal(stored.profile.settings.textSize,'125');
   await current.page.reload();await size(current.page,'125');await set(current.page,{dyslexicFont:false});await size(current.page,'125',{dyslexic:false});await current.context.close();
  }

  // Use real embedded font metrics, spacing and large labels at mobile widths.
  const layout=await open(),lp=layout.page;
  async function contained(label){
   await lp.evaluate(()=>document.fonts.ready);
   assert.ok(await lp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' page overflow');
   const failures=await lp.locator('button').evaluateAll(buttons=>buttons.filter(b=>b.getClientRects().length&&b.scrollWidth>b.clientWidth+2).map(b=>b.id||b.textContent.trim()));assert.deepEqual(failures,[],label+' button overflow');
   const escaped=await lp.locator('button svg').evaluateAll(icons=>icons.filter(icon=>{
    if(!icon.getClientRects().length)return false;
    const b=icon.closest('button').getBoundingClientRect(),r=icon.getBoundingClientRect();
    return r.left<b.left-2||r.right>b.right+2||r.top<b.top-2||r.bottom>b.bottom+2;
   }).map(icon=>icon.closest('button').id));assert.deepEqual(escaped,[],label+' cropped icons');
   const nav=await lp.locator('#bottom-nav a').evaluateAll(items=>items.filter(item=>item.getClientRects().length).map(item=>Math.round(item.getBoundingClientRect().top)));if(nav.length)assert.equal(new Set(nav).size,1,label+' navigation row');
  }
  await lp.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,390,412])for(const value of ['100','125']){
   await lp.setViewportSize({width,height:844});await navigate(lp,'setup');await set(lp,{textSize:value,dyslexicFont:true,theme:'contrast',spacing:true});await contained(`landing ${width}/${value}`);
   await navigate(lp,'journey');await lp.locator('#choose-start-map').click();await lp.waitForSelector('#map-selection:visible');await contained(`Journey ${width}/${value}`);
   assert.equal(await lp.locator('#map-panel').evaluate(el=>el.classList.contains('compact-map-controls')),value==='100');
   await lp.locator('#cancel-map-location').click();await navigate(lp,'access');
   await lp.evaluate(()=>document.querySelector('#quick-display-dialog').showModal());await contained(`dialog ${width}/${value}`);
   const dialog=await lp.locator('#quick-display-dialog').boundingBox();assert.ok(dialog.x>=-1&&dialog.x+dialog.width<=width+1,'dialog within viewport');
   await lp.locator('#quick-display-dialog [data-close]').first().click();
  }
  await lp.setViewportSize({width:390,height:844});await navigate(lp,'setup');await set(lp,{textSize:'125'});await lp.screenshot({path:path.join(os.tmpdir(),'adelaide-dyslexic-125.png')});
  await layout.context.close();assert.deepEqual(errors,[]);
  console.log('PASS Dyslexic scale: 100/125 cap, toggle/cycle labels, settings/dialog options, presets/onboarding, remembered migration, and mobile layouts with embedded font and spacing.');
 }finally{await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
