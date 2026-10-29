'use strict';
// Runs directly from file://; no localhost server or project npm install required.
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const root=path.resolve(__dirname,'..');
const appHTML=path.resolve(process.env.APP_HTML||path.join(root,'index.html'));

async function frameState(page,large,label){
 const state=await page.evaluate(()=>{
  const frame=document.querySelector('#map-panel'),panel=document.querySelector('.map-control-panel'),canvas=document.querySelector('.map-wrap');
  const box=el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
  const f=getComputedStyle(frame),p=getComputedStyle(panel),c=getComputedStyle(canvas);
  return{border:parseFloat(f.borderTopWidth),radius:parseFloat(f.borderTopLeftRadius),panelBorder:parseFloat(p.borderTopWidth),panelBackground:p.backgroundColor,canvasBorder:parseFloat(c.borderTopWidth),frame:box(frame),panel:box(panel),canvas:box(canvas),footer:box(document.querySelector('.bottom-stack')),overflow:document.documentElement.scrollWidth>innerWidth+1};
 });
 assert.equal(state.border,large?0:1,label+' frame border');
 assert.equal(large?state.radius===0:state.radius>0,true,label+' frame corners');
 assert.equal(state.panelBorder,0,label+' controls have no separate frame');
 assert.equal(state.panelBackground,'rgba(0, 0, 0, 0)',label+' controls remain transparent');
 assert.equal(state.canvasBorder,0,label+' canvas has no nested frame');
 assert.ok(state.canvas.bottom<=state.panel.top+2,label+' canvas stays above controls');
 assert.ok(state.panel.bottom<=state.frame.bottom+2,label+' controls fit shared frame');
 assert.equal(state.overflow,false,label+' page fits mobile width');
 if(large)assert.ok(state.panel.bottom<=state.footer.top+2,label+' controls stay above navigation');
}

async function compactGeometry(page,label,largest){
 const controls=page.locator('.map-primary-controls>button');
 assert.equal(await controls.count(),5,label+' five controls');
 const rows=await controls.evaluateAll(buttons=>buttons.map(b=>Math.round(b.getBoundingClientRect().top)));
 assert.equal(new Set(rows).size,1,label+' single control row');
 const overflow=await controls.evaluateAll(buttons=>buttons.filter(b=>b.scrollWidth>b.clientWidth+2).map(b=>b.id));assert.deepEqual(overflow,[],label+' control text fits');
 const move=page.getByRole('button',{name:'Move Map',exact:true});
 assert.equal(await move.count(),1,label+' Move Map accessible name');
 assert.equal(await page.locator('#toggle-map-directions>[data-icon]').isVisible(),largest,label+' compass presentation');
 assert.equal(await page.locator('[data-move-map-label]').isVisible(),!largest,label+' label presentation');
 assert.equal(await move.getAttribute('aria-expanded'),await move.getAttribute('aria-pressed'),label+' disclosure and pressed states agree');
 const geometry=await controls.evaluateAll(buttons=>buttons.map(b=>{
  const r=b.getBoundingClientRect(),s=getComputedStyle(b),icon=b.querySelector('svg'),i=icon&&getComputedStyle(icon);
  return{width:r.width,height:r.height,padding:s.padding,radius:s.borderRadius,iconWidth:i?.width,iconHeight:i?.height};
 }));
 for(const g of geometry){assert.ok(Math.abs(g.width-geometry[0].width)<1,label+' equal widths');assert.equal(g.height,geometry[0].height,label+' equal heights');}
 return geometry;
}

function compareGeometry(actual,expected,label){
 actual.forEach((g,index)=>{for(const key of ['width','height'])assert.ok(Math.abs(g[key]-expected[index][key])<1,label+' '+key);for(const key of ['padding','radius','iconWidth','iconHeight'])assert.equal(g[key],expected[index][key],label+' '+key);});
}

async function main(){
 const browser=await firefox.launch({headless:true,...(process.env.FIREFOX_EXECUTABLE?{executablePath:process.env.FIREFOX_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 try{
  await context.addInitScript(()=>{
   localStorage.clear();localStorage.setItem('access-adelaide-basemap-v1',JSON.stringify({force2D:true,preferred:'esri'}));
   let basemaps;Object.defineProperty(window,'AccessBasemaps',{configurable:true,get:()=>basemaps,set:api=>{basemaps={...api,create(options){return window.testMap=api.create(options);}};}});
  });
  await context.route(/^https?:/,route=>route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(appHTML).href);await page.locator('#setup-skip').click();
  const fonts=[{textSize:'100',dyslexicFont:false},{textSize:'125',dyslexicFont:false},{textSize:'150',dyslexicFont:false},{textSize:'100',dyslexicFont:true},{textSize:'125',dyslexicFont:true}];
  const cases=[...fonts.flatMap(font=>[320,390,412].map(width=>({...font,width,height:844,theme:'light'}))),...fonts.filter(font=>font.textSize==='150'||font.dyslexicFont||font.textSize==='100').flatMap(font=>[480,560].map(height=>({...font,width:320,height,theme:height===480?'contrast':'dark'})))];
  for(const scenario of cases){
   const {width,height,...settings}=scenario,largest=settings.textSize===(settings.dyslexicFont?'125':'150');
   await page.setViewportSize({width,height});await page.evaluate(s=>AccessAdelaide.setSettings(s),{...settings,spacing:true,motion:true});await page.evaluate(()=>document.fonts.ready);
   const label=JSON.stringify(scenario),reference=[];
   for(const owner of ['explore','journey']){
    await page.locator('#bottom-nav a[href="#'+owner+'"]').click();
    if(owner==='explore')await page.locator('#show-map').click();
    else{await page.locator('#choose-start-map').click();await page.locator('#map-selection').waitFor({state:'visible'});}
    for(const large of [false,true]){
     if(large)await page.locator('#toggle-big-map').click();
     await frameState(page,large,label+'/'+owner+'/'+large);
     if(owner==='journey'||!largest){
      const geometry=await compactGeometry(page,label+'/'+owner+'/'+large,largest);
      if(owner==='explore')reference.push(geometry);else if(!largest)compareGeometry(geometry,reference[Number(large)],label+' Explore/Journey parity');
     }
     if(large){
      const move=page.locator('#toggle-map-directions');await move.click();assert.equal(await move.getAttribute('aria-pressed'),'true');await frameState(page,true,label+' directions open');
      await page.locator('[data-pan=east]').click();await move.click();assert.equal(await move.getAttribute('aria-pressed'),'false');await page.locator('#toggle-big-map').click();
     }
    }
    if(owner==='journey')await page.locator('#cancel-map-location').click();
   }
  }
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>AccessAdelaide.setSettings({textSize:'100',dyslexicFont:false,spacing:false,theme:'light'}));
  assert.equal(await page.locator('fieldset.route-options.framed-group').count(),1);assert.equal(await page.locator('fieldset#pace.framed-group').count(),1);
  for(const [target,coords] of [['start',[138.59688,-34.9215]],['end',[138.60302,-34.92048]]]){
   await page.locator(target==='start'?'#choose-start-map':'#choose-end-map').click();await page.locator('#map-selection').waitFor({state:'visible'});await page.evaluate(coords=>testMap.jumpTo({center:coords}),coords);await page.locator('#confirm-map-location').click();
  }
  await page.locator('#calculate-route').click();await page.locator('#journey-result').waitFor({state:'visible'});
  assert.equal(await page.locator('.journey-dashboard.framed-group>legend h2#result-title').count(),1);assert.equal(await page.getByRole('heading',{name:'Your walking journey',exact:true}).count(),1);
  assert.equal(await page.locator('#journey-result').getAttribute('aria-labelledby'),'result-title');assert.equal(await page.getByRole('region',{name:'Your walking journey',exact:true}).count(),1);assert.equal(await page.evaluate(()=>document.activeElement.id),'result-title');
  assert.equal(await page.locator('.journey-metric').count(),2);assert.match(await page.locator('.journey-metric').first().innerText(),/Distance\s+774 m/);assert.match(await page.locator('.journey-metric').nth(1).innerText(),/Travel time\s+~19 min/);
  assert.equal(await page.locator('.route-caveat,.route-card').count(),0);
  // Pin one tool to exercise the real navigation disclosure, including its
  // existing dark/contrast expanded appearance (not merely a synthetic button).
  await page.evaluate(()=>{location.hash='setup';});await page.locator('#setup-shortcuts-only').click();await page.locator('[data-setup-tool="read"]').check();await page.locator('#setup-save-shortcuts').click();await page.locator('#bottom-nav a[href="#explore"]').click();await page.locator('#view-explore').waitFor({state:'visible'});await page.locator('#show-map').click();
  for(const theme of ['light','dark','contrast']){
   await page.evaluate(theme=>AccessAdelaide.setSettings({theme,textSize:'100',dyslexicFont:false,spacing:false}),theme);
   const move=page.locator('#toggle-map-directions'),navigation=page.locator('[data-dock-tool="navigation"]');
   if(await move.getAttribute('aria-expanded')==='true')await move.click();
   const palette=await page.evaluate(()=>{
    const shell=document.querySelector('.app-shell'),styles=getComputedStyle(shell),probe=document.createElement('span');shell.append(probe);
    const resolve=name=>{probe.style.color=styles.getPropertyValue(name);return getComputedStyle(probe).color;};
    const colours={surface:resolve('--surface'),text:resolve('--text'),accent:resolve('--accent'),accentText:resolve('--accent-text')};probe.remove();return colours;
   });
   const colours=button=>button.evaluate(button=>{const s=getComputedStyle(button);return{background:s.backgroundColor,text:s.color};});
   await move.click();assert.deepEqual(await colours(move),theme==='light'?{background:palette.accent,text:palette.accentText}:{background:'rgb(255, 255, 255)',text:'rgb(0, 0, 0)'},theme+' pressed colour');await move.click();
   assert.equal(await navigation.getAttribute('aria-expanded'),'true');
   assert.deepEqual(await colours(navigation),theme==='light'?{background:palette.surface,text:palette.text}:{background:'rgb(255, 255, 255)',text:'rgb(0, 0, 0)'},theme+' navigation expanded appearance');
   await navigation.click();assert.equal(await navigation.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#bottom-nav').isVisible(),false);
   assert.deepEqual(await colours(navigation),{background:palette.surface,text:palette.text},theme+' navigation collapsed appearance');await navigation.click();assert.equal(await page.locator('#bottom-nav').isVisible(),true);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS shared UI: file:// Explore/Journey control parity, shared/frameless map modes, largest-size compass, short-screen navigation, framed dashboard heading/focus and light/dark/contrast states.');
 }finally{await context.close();await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
