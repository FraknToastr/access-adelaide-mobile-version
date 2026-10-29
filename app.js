'use strict';
(() => {
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
const D = window.ACCESS_DEMO;
const ui=window.AccessUI;
const paths = {
'arrow-up':'<path d="M12 21V3m-7 7 7-7 7 7"/>',
'arrow-down':'<path d="M12 3v18m-7-7 7 7 7-7"/>',
'arrow-left':'<path d="M21 12H3m7-7-7 7 7 7"/>',
target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
locate:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
'phone-call':'<path d="M7 3H3v4c0 8 6 14 14 14h4v-4l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z"/>',
taxi:'<path d="m5 6-2 7v7h3v-3h12v3h3v-7l-2-7H5ZM3 12h18M9 6V3h6v3M6 14h2M16 14h2"/>',
route:'<circle cx="5" cy="6" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 6h8a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h8"/>',
access:'<circle cx="12" cy="4" r="2"/><path d="m4 9 8 2 8-2M12 11v5m0 0-5 6m5-6 5 6"/>',
'arrow-right':'<path d="M3 12h18m-7-7 7 7-7 7"/>',
map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
list:'<path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/>',
plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
sliders:'<path d="M4 5h7m6 0h3M4 12h2m6 0h8M4 19h9m6 0h1"/><circle cx="14" cy="5" r="3"/><circle cx="9" cy="12" r="3"/><circle cx="16" cy="19" r="3"/>',
heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
train:'<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 11h14M9 3v8M15 3v8M8 21l2-3m6 3-2-3M8 15h.01M16 15h.01"/>',
bench:'<path d="M4 5h16v7H4zM3 16h18M6 12v9M18 12v9M4 8h16"/>',
leaf:'<path d="M20 3c1 8-1 16-10 16a7 7 0 0 1-7-7C3 4 12 5 20 3ZM3 22 15 10"/>',
volume:'<path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
bookmark:'<path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4-7 4Z"/>',
download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
'text-size':'<path d="m3 19 5-14 5 14M5 14h6m4 5 3-8 3 8m-5-3h4"/>',
phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4M11 19h2"/>',
'book-open':'<path d="M12 7v14M3 3h3a6 6 0 0 1 6 4 6 6 0 0 1 6-4h3v16h-3a6 6 0 0 0-6 2 6 6 0 0 0-6-2H3V3Z"/>',
eye:'<path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
hand:'<path d="M8 13V5a2 2 0 0 1 4 0v7-9a2 2 0 0 1 4 0v9-6a2 2 0 0 1 4 0v10c0 4-3 6-7 6-3 0-4-1-6-3l-4-5a2 2 0 0 1 3-3l2 2Z"/>',
compass:'<circle cx="12" cy="12" r="10"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
help:'<circle cx="12" cy="12" r="10"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01"/>',
stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',x:'<path d="m6 6 12 12M6 18 18 6"/>',
check:'<path d="m5 12 4 4L19 6"/>',crossing:'<path d="M5 3v18M19 3v18M9 5h6M9 10h6M9 15h6M9 20h6"/>',
water:'<path d="M12 2C10 6 5 11 5 15a7 7 0 0 0 14 0c0-4-5-9-7-13Z"/>',
message:'<path d="M21 11a8 8 0 0 1-8 8H6l-4 3V5a3 3 0 0 1 3-3h8a8 8 0 0 1 8 9Z"/><path d="M6 8h10M6 12h7"/>',
bus:'<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M4 11h16M8 3v8M16 3v8M7 19v3M17 19v3M7 15h.01M17 15h.01"/>',
shop:'<path d="M3 9l2-6h14l2 6v3H3V9ZM5 12v9h14v-9M9 21v-6h6v6M8 3l-1 9M16 3l1 9"/>',
food:'<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v19M20 3c-4 2-4 7-4 10h4V3Zm0 10v9"/>',
activity:'<path d="M3 21h18M4 21V9l8-6 8 6v12M8 12v5M12 12v5M16 12v5"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
toilet:'<path d="M6 3h12v8H6zM4 11h16v3a8 8 0 0 1-16 0v-3ZM8 21h8M10 18v3M14 18v3M9 7h.01"/>',
chevron:'<path d="m9 5 7 7-7 7"/>',
'chevron-down':'<path d="m5 9 7 7 7-7"/>',
'chevron-up':'<path d="m5 15 7-7 7 7"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.info}</svg>`;
const icons = (root=document) => $$('[data-icon]',root).forEach(e=>{e.innerHTML=icon(e.dataset.icon);e.setAttribute('aria-hidden','true');});
icons();
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const VIEWS=['setup','explore','journey','access','help'];
function initialView(){try{const p=JSON.parse(localStorage.getItem('access-adelaide-support-v2'));return p?.version===2&&p.complete===true?'explore':'setup';}catch{return 'setup';}}
const defaults = {textSize:'150',theme:'contrast',dyslexicFont:false,spacing:false,simple:false,mapless:false,motion:true,targets:false,speechRate:'1',remember:false,buttonDisplay:'labels',longPressTips:false};
const TEXT_SIZES=Object.freeze(['100','125','150']),DYSLEXIC_TEXT_SIZES=Object.freeze(['100','125']);
const SETTINGS='access-adelaide-settings-v1', SAVED='access-adelaide-journey-v1';
let bigMap=false,bigMapScroll=0,legendOpen=false,legendScrollY=0,locationRequest=0,maplessApplied;
let settings={...defaults}, storageWorks=true, map=null, mapReady=false, markers=[], route=null, stepIndex=0, currentView='', speechJob=null, lastDialogTrigger=null, lastSpeechTrigger=null;
let journeyPoints={start:null,end:null},routingTask=0,routingPromise=null,mapSelection=null;
let mapOwner='explore',exploreMapVisible=!$('#map-panel').hidden,journeyMapVisible=false;
const routeProfiles={shortest:'Shortest',fastest:'Fastest',stepfree:'Step-free (provisional)'};
const selectedLayers=new Set(Object.keys(D.layers));
try { const s=JSON.parse(localStorage.getItem(SETTINGS));if(s && s.remember===true){settings=sanitiseSettings(s);if(String(s.textSize)!==settings.textSize)localStorage.setItem(SETTINGS,JSON.stringify(settings));} } catch { storageWorks=false; }
function getTextScale(s=settings){
 const dyslexic=s.dyslexicFont===true,sizes=dyslexic?DYSLEXIC_TEXT_SIZES:TEXT_SIZES;
 const requested=String(s.textSize)==='200'?'150':String(s.textSize);
 const maxSize=sizes[sizes.length-1],textSize=sizes.includes(requested)?requested:maxSize;
 const index=sizes.indexOf(textSize);
 return {sizes:[...sizes],textSize,maxSize,isLargest:textSize===maxSize,nextSize:index===0?maxSize:sizes[index-1],buttonLabel:dyslexic?(textSize==='100'?'Bigger Text':'Smaller Text'):(textSize==='100'?'Biggest text':'Smaller text')};
}
function sanitiseSettings(s) {
 const out={...defaults};
 for(const k of ['dyslexicFont','spacing','simple','mapless','motion','targets','remember','longPressTips']) if(typeof s[k]==='boolean')out[k]=s[k];
 for(const [k,vals] of Object.entries({textSize:TEXT_SIZES,theme:['light','dark','contrast','system'],speechRate:['0.75','1','1.25']}))if(vals.includes(String(s[k])))out[k]=String(s[k]);
 if(String(s.textSize)==='200')out.textSize='150';
 out.textSize=getTextScale(out).textSize;
 if(['labels','icons'].includes(s.buttonDisplay))out.buttonDisplay=s.buttonDisplay;
 return out;
}
function announce(message){$('#persistent-status').textContent=message;}
function syncTextSizeChoices(){
 const scale=getTextScale();
 for(const id of ['text-size','quick-text-size']){
  const group=$('#'+id),active=document.activeElement;
  const restoreFocus=group.contains(active)&&active.matches('input[type="radio"]')&&!scale.sizes.includes(active.value);
  $$('input[type="radio"]',group).forEach(input=>{
   const allowed=scale.sizes.includes(input.value);input.disabled=!allowed;input.closest('label').hidden=!allowed;
   if(input.value==='125')$('strong',input.closest('label')).textContent=settings.dyslexicFont?'125% · largest':'125% · larger';
  });
  ui.setChoice(id,scale.textSize);
  if(restoreFocus)$('input:checked',group)?.focus({preventScroll:true});
 }
}
function applySettings(persist=true){
 settings=sanitiseSettings(settings);
 const scale=getTextScale();
 const shell=$('.app-shell');
 const theme=settings.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):settings.theme;
 document.documentElement.style.fontSize=`${settings.textSize}%`;
 document.body.classList.toggle('dyslexic-font',settings.dyslexicFont);
 shell.dataset.theme=theme;shell.dataset.buttonDisplay=settings.buttonDisplay;shell.classList.toggle('large-text',scale.isLargest);
 // Dialogs are top-layer siblings of the shell; apply the same palette there.
 $$('dialog').forEach(d=>{d.dataset.theme=theme;d.dataset.buttonDisplay=settings.buttonDisplay;d.classList.toggle('large-text',scale.isLargest);});
 for(const [cls,key] of [['spacing','spacing'],['simple','simple'],['large-targets','targets']]){shell.classList.toggle(cls,settings[key]);$$('dialog').forEach(d=>d.classList.toggle(cls,settings[key]));}
 $$('[data-setting]').forEach(e=>{const v=settings[e.dataset.setting];if(e.type==='radio')e.checked=e.value===String(v);else if(e.type==='checkbox')e.checked=!!v;});
 syncTextSizeChoices();
 syncMapControlLayout();
 if(persist){try{if(settings.remember)localStorage.setItem(SETTINGS,JSON.stringify(settings));else localStorage.removeItem(SETTINGS);}catch{storageWorks=false;announce('Your browser could not store settings. They still work while this page is open.');}}
 $('#storage-note').textContent=!storageWorks?'Device storage is unavailable. Settings work while this page is open.':settings.remember?'Settings are saved on this device.':'Settings are currently kept only while this page is open.';
 if(settings.mapless&&settings.mapless!==maplessApplied)setExploreMode(false,false);
 maplessApplied=settings.mapless;
 document.dispatchEvent(new CustomEvent('accessadelaide:settings',{detail:{...settings}}));
 renderJourneySummaries();
 if(map){map.resize();if(mapReady)map.setPaintProperty('schematic-background','background-color',theme==='light'?'#eeeee2':theme==='dark'?'#dce3da':'#eee');}
}
applySettings(false);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>applySettings(false));
function navigate(){
 const openGuide=location.hash.slice(1)==='platform';
 const requested=openGuide?'help':location.hash.slice(1);
 if(openGuide)history.replaceState(null,'','#help');if(currentView && !VIEWS.includes(requested))return;const view=VIEWS.includes(requested)?requested:initialView();
 const changed=view!==currentView;
 if(changed){cancelLocate();if(view!=='journey'&&$('#calculate-route').disabled)invalidateJourney();if(mapSelection)endMapSelection(false,false);resetMapUI();}
 currentView=view;
 if(view==='help'&&changed&&!openGuide)$('#platform-guide').open=false;
 document.body.classList.toggle('in-setup',view==='setup');
 for(const v of VIEWS)$(`#view-${v}`).hidden=v!==view;
 $$('#bottom-nav a').forEach(a=>{if(a.hash===`#${view}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.title=`${{setup:'My access setup',explore:'Explore',journey:'Journey',access:'Access settings',help:'Help'}[view]} · Access Adelaide`;
 if(changed && requested){window.scrollTo({top:0,behavior:'instant'});$(`#${view}-title`).focus({preventScroll:true});}
 if(view==='explore'){attachMap('explore');initMap();if(map)requestAnimationFrame(()=>map.resize());}
 if(view==='journey'){if(journeyMapVisible){attachMap('journey');initMap();}renderSaved();requestAnimationFrame(renderJourneySummaries);}
 if(openGuide){const guide=$('#platform-guide');guide.open=true;requestAnimationFrame(()=>{guide.querySelector('summary').focus({preventScroll:true});window.scrollTo({top:window.scrollY+guide.getBoundingClientRect().top-12,behavior:'instant'});});}
 document.dispatchEvent(new CustomEvent('accessadelaide:view',{detail:{view}}));
}
window.addEventListener('hashchange',navigate);
$('.brand').addEventListener('click',()=>{if(currentView==='explore'){$('#explore-title').focus();window.scrollTo({top:0,behavior:'instant'});}});
// Local content has an equivalent textual representation, independent of WebGL.
$('#layer-checkboxes').innerHTML=Object.entries(D.layers).map(([id,l])=>`<label class="check-row"><input type="checkbox" data-layer="${id}" checked><span>${l.label}</span><span class="layer-symbol" aria-hidden="true">${icon(l.icon)}</span></label>`).join('');
$('#legend').innerHTML=Object.values(D.layers).map(l=>`<span>${icon(l.icon)}${l.label}</span>`).join('');
function renderPlaces(){
 const places=D.places.filter(p=>selectedLayers.has(p.type));
 $('#places').innerHTML=places.map(p=>`<li><button class="place-button" data-place="${p.id}"><span class="place-icon ${p.type}" aria-hidden="true">${icon(D.layers[p.type].icon)}</span><span class="place-content"><strong>${p.name}</strong><span class="sub">${D.layers[p.type].singular} · ${p.area}</span><span class="place-meta">${icon('info')}${p.teaser} · Unverified</span></span><span class="chevron" aria-hidden="true">${icon('chevron')}</span></button></li>`).join('');
 $('#place-count').textContent=`${places.length} illustrative ${places.length===1?'place':'places'}`;
 $('#no-places').hidden=places.length!==0;
 renderMarkers();
}
function attachMap(owner){
 const panel=$('#map-panel');
 if(mapOwner!==owner)resetMapUI();
 mapOwner=owner;panel.dataset.owner=owner;
 if(owner==='journey'){$('#journey-map-slot').append(panel);$('#journey-map-slot').hidden=!journeyMapVisible;panel.hidden=!journeyMapVisible;}
 else{$('#explore-map-slot').after(panel);$('#journey-map-slot').hidden=true;panel.hidden=!exploreMapVisible;}
 document.body.classList.toggle('journey-map-active',owner==='journey');
 $('#map').setAttribute('aria-describedby',owner==='journey'?'journey-map-description':'map-description');
 $('#map').setAttribute('aria-label',owner==='journey'?(mapSelection?.target==='start'?'Choose your starting point on the map':mapSelection?'Choose your destination on the map':'Journey walking map'):'Map of central Adelaide');
 if(map){map.setNetworkVisible(owner==='journey');syncJourneyMarkers();map.resize();renderMarkers();}
}
function setExploreMode(showMap,focus=false){
 exploreMapVisible=showMap;
 if(mapOwner==='explore'){
  if(!showMap)resetMapUI();
  $('#map-panel').hidden=!showMap;
 }
 $('#show-map').setAttribute('aria-pressed',String(showMap));$('#show-list').setAttribute('aria-pressed',String(!showMap));
 $('#map-description').textContent=showMap?'Illustrative locations near North Terrace. Every point is also available in the places list.':'Places list. All point layers are available here without using the map.';
 if(showMap&&mapOwner==='explore'){initMap();if(map)requestAnimationFrame(()=>map.resize());}
 if(focus)announce(showMap?'Map shown. The equivalent places list is below.':'List view selected. The map is hidden.');
}
$('#show-map').onclick=()=>setExploreMode(true,true);$('#show-list').onclick=()=>setExploreMode(false,true);
$('#open-filters').onclick=()=>{const b=$('#open-filters');const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#filters').hidden=!open;};
$('#layer-checkboxes').onchange=e=>{const id=e.target.dataset.layer;if(!id)return;e.target.checked?selectedLayers.add(id):selectedLayers.delete(id);renderPlaces();announce(`${$('#place-count').textContent} shown on the map and list.`);};
$('#all-layers').onclick=()=>{Object.keys(D.layers).forEach(k=>selectedLayers.add(k));$$('[data-layer]').forEach(c=>c.checked=true);renderPlaces();announce(`All ${D.places.length} illustrative places are shown.`);};
$('#places').onclick=e=>{const b=e.target.closest('[data-place]');if(b)openPlace(b.dataset.place,b);};
function openDialog(d,trigger){lastDialogTrigger=trigger||document.activeElement;d.showModal();document.dispatchEvent(new CustomEvent('accessadelaide:dialog',{detail:{id:d.id}}));}
function openPlace(id,trigger){
 const p=D.places.find(p=>p.id===id);if(!p)return;
 $('#place-dialog-body').innerHTML=`<div class="dialog-place-heading"><span class="place-icon ${p.type}" aria-hidden="true">${icon(D.layers[p.type].icon)}</span><h2 id="place-dialog-title">${p.name}</h2></div><p class="dialog-note">${p.details}</p><dl class="details-grid"><dt>Type & area</dt><dd>${D.layers[p.type].singular} · ${p.area}</dd><dt>Illustrative facilities</dt><dd>${p.facilities}</dd><dt>What is unknown</dt><dd>${p.unknown}</dd><dt>Source & confidence</dt><dd>Invented demonstration point. No survey, operator confirmation or inspection date.</dd></dl><div class="notice"><p><strong>Check before a real visit.</strong>This is mock data, not a confirmed accessible facility.</p></div><button type="button" class="secondary full" data-plan-place="${p.id}">Plan a visit to this sample point</button>`;
 openDialog($('#place-dialog'),trigger);
}
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$$('dialog').forEach(d=>{d.addEventListener('close',()=>{if(lastDialogTrigger?.isConnected && !lastDialogTrigger.closest('[hidden]'))lastDialogTrigger.focus({preventScroll:true});});});
function mapBounds(points){return window.AccessBasemaps.boundsArray(points);}
function initMap(){
 if(map||$('#map-panel').hidden)return;
 if(!window.AccessBasemaps){$('#map-loading').textContent='The map engine did not load. The places list remains available.';return;}
 map=window.AccessBasemaps.create({data:D,groups:markerGroups,button:pointButton});mapReady=true;
 map.setNetworkVisible(mapOwner==='journey');syncJourneyMarkers();
 if(route)map.setRoute(route.coords);
}
function markerGroups(project,w,h){
 if(mapOwner==='journey')return [];
 const hostBox=$('#map').getBoundingClientRect();
 const exclusions=$$('.map-topbar>*').filter(e=>e.getClientRects().length).map(e=>{
  const r=e.getBoundingClientRect();return{left:r.left-hostBox.left-8,right:r.right-hostBox.left+8,top:r.top-hostBox.top-8,bottom:r.bottom-hostBox.top+8};
 });
 const groups=[];
 const half=settings.targets?31:25;
 for(const p of D.places.filter(p=>selectedLayers.has(p.type))){
  const xy=project(p.coordinates),x=Array.isArray(xy)?xy[0]:xy.x,y=Array.isArray(xy)?xy[1]:xy.y;
  if(x<half||y<half||x>w-half||y>h-half)continue;
  if(exclusions.some(r=>x+half>r.left&&x-half<r.right&&y+half>r.top&&y-half<r.bottom))continue;
  const near=groups.find(g=>Math.hypot(g.x-x,g.y-y)<(settings.targets?72:58));
  if(near){near.points.push(p);near.x=near.points.reduce((sum,p)=>{const v=project(p.coordinates);return sum+(Array.isArray(v)?v[0]:v.x);},0)/near.points.length;near.y=near.points.reduce((sum,p)=>{const v=project(p.coordinates);return sum+(Array.isArray(v)?v[1]:v.y);},0)/near.points.length;}
  else groups.push({points:[p],x,y});
 }
 const distance=settings.targets?72:58;let merged=true;
 while(merged){merged=false;outer:for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){if(Math.hypot(groups[i].x-groups[j].x,groups[i].y-groups[j].y)<distance){const a=groups[i],b=groups[j],count=a.points.length+b.points.length;a.x=(a.x*a.points.length+b.x*b.points.length)/count;a.y=(a.y*a.points.length+b.y*b.points.length)/count;a.points.push(...b.points);groups.splice(j,1);merged=true;break outer;}}}
 return groups;
}
function pointButton(group){
 const p=group.points[0],b=document.createElement('button');b.className='marker';b.dataset.type=group.points.length>1?'group':p.type;
 b.setAttribute('aria-label',group.points.length>1?`${group.points.length} mock places at this point. Open details`:`${p.name}, ${D.layers[p.type].singular}, mock location. Open details`);
 b.innerHTML=`<span>${group.points.length>1?group.points.length:icon(D.layers[p.type].icon)}</span>`;
 b.onclick=()=>{if(group.points.length===1)openPlace(p.id,b);else{
 $('#place-dialog-body').innerHTML=`<h2 id="place-dialog-title">${group.points.length} places at this scale</h2><p class="small">Grouped mock locations. No access details have been verified.</p>`+group.points.map(p=>`<section class="card"><h3>${p.name}</h3><p class="small">${D.layers[p.type].singular} · ${p.area}</p><p>${p.details}</p><p class="small">${p.unknown}</p></section>`).join('');
 openDialog($('#place-dialog'),b);
 }};return b;
}
function renderMarkers(){if(map)map.render();}
function renderFallback(){if(map)map.render();}
const reduceMotion=()=>settings.motion || matchMedia('(prefers-reduced-motion: reduce)').matches;
function camera(opts){if(!map)return;if(reduceMotion())map.jumpTo(opts);else map.easeTo({...opts,duration:450});}
$('#zoom-in').onclick=()=>{if(map){camera({zoom:Math.min(19,map.getZoom()+1)});announce(`Map zoom ${Math.round(map.getZoom())}.`);}};
$('#zoom-out').onclick=()=>{if(map){camera({zoom:Math.max(13,map.getZoom()-1)});announce(`Map zoom ${Math.round(map.getZoom())}.`);}};
$('#reset-map').onclick=()=>{if(!map)return;if(mapOwner==='journey'){manualSelectionInteraction();const coords=mapSelection?journeyPoints[mapSelection.target]?.coords:null;const points=coords?[coords]:Object.values(journeyPoints).filter(Boolean).map(p=>p.coords);if(points.length)map.fitBounds(mapBounds(points),{padding:48,maxZoom:16,duration:reduceMotion()?0:300});else map.jumpTo({center:[138.6013,-34.9222],zoom:14.4});return;}const points=D.places.filter(p=>selectedLayers.has(p.type));if(!points.length){announce('No point layers are selected. Open Layers to choose places.');return;}const bounds=mapBounds(points.map(p=>p.coordinates));map.fitBounds(bounds,{padding:{top:70,bottom:50,left:40,right:78},maxZoom:16,duration:reduceMotion()?0:450});announce('Map centred on all visible mock places.');};
$$('[data-pan]').forEach(b=>b.onclick=()=>{if(!map)return;manualSelectionInteraction();const dir=b.dataset.pan,offset={north:[0,-90],south:[0,90],west:[-90,0],east:[90,0]}[dir];map.panBy(offset,{duration:reduceMotion()?0:350});announce(`Map moved ${dir}.`);});
$('#online-map').onchange=e=>{if(map)map.setLayoutProperty('basemap','visibility',e.target.checked?'visible':'none');};
// The canvas stays above its controls; the full legend expands in page flow.
function syncMapControlLayout(){
 const panel=$('#map-panel');if(!panel)return;
 const compact=!getTextScale().isLargest;
 panel.classList.toggle('compact-map-controls',compact);
 const layout=compact?'compact':'large';
 if(panel.dataset.controlsLayout!==layout){
  const host=$('.map-primary-controls'),active=document.activeElement;
  const order=compact?['toggle-map-directions','zoom-in','zoom-out','toggle-big-map','reset-map']:['toggle-map-directions','toggle-big-map','zoom-in','zoom-out','reset-map'];
  order.forEach(id=>host.append($('#'+id)));
  panel.dataset.controlsLayout=layout;
  if(active instanceof HTMLElement&&host.contains(active))active.focus({preventScroll:true});
 }
 const sizeButton=$('#toggle-big-map'),sizeLabel=$('[data-map-size-label]',sizeButton)||$('span:last-child',sizeButton);
 sizeButton.setAttribute('aria-label',bigMap?'Normal Map':'Large Map');
 if(sizeLabel)sizeLabel.textContent=bigMap?'Normal Map':'Large Map';
 if(!bigMap||legendOpen){
  document.body.classList.remove('short-map-layout');
  $('.map-control-panel').style.removeProperty('--map-controls-max-height');
  return;
 }
 const available=$('#main').clientHeight,layoutHeight=Math.max(176,available);
 const canvasMinimum=Math.min(160,Math.max(96,layoutHeight*.45));
 document.body.classList.toggle('short-map-layout',available<176);
 $('.map-control-panel').style.setProperty('--map-controls-max-height',Math.max(80,Math.floor(layoutHeight-canvasMinimum))+'px');
}
function keepMapControlVisible(button){
 if(!bigMap||!button)return;
 if(legendOpen){
  if(!button.matches('button,input,a[href]'))return;
  const target=button.closest('label')||button,box=target.getBoundingClientRect(),footer=$('.bottom-stack').getBoundingClientRect();
  if(box.bottom>footer.top-12)window.scrollBy({top:box.bottom-footer.top+12,behavior:'instant'});
  else if(box.top<8)window.scrollBy({top:box.top-8,behavior:'instant'});
  return;
 }
 const panel=$('.map-control-panel'),p=panel.getBoundingClientRect(),b=button.getBoundingClientRect();
 if(b.bottom>p.bottom-8)panel.scrollTop+=b.bottom-p.bottom+8;
 else if(b.top<p.top+8)panel.scrollTop+=b.top-p.top-8;
}
function setMapLegend(open,restoreFocus=false){
 if(open&&mapOwner==='journey')return;
 if(open===legendOpen)return;
 if(open)legendScrollY=window.scrollY;
 legendOpen=open;
 const panel=$('.map-control-panel'),controls=$('#map-controls-view'),legend=$('#map-legend-view'),toggle=$('#toggle-map-legend');
 document.body.classList.toggle('map-legend-expanded',open);
 panel.dataset.legendOpen=String(open);
 controls.inert=open;controls.setAttribute('aria-hidden',String(open));
 legend.hidden=!open;
 toggle.setAttribute('aria-pressed',String(open));toggle.setAttribute('aria-expanded',String(open));
 if(open){$('#map-legend-scroll').scrollTop=0;panel.scrollTop=0;}
 syncMapControlLayout();
 requestAnimationFrame(()=>{
  if(legendOpen!==open)return;
  if(map){map.resize();renderMarkers();}
  if(!['explore','journey'].includes(currentView))return;
  if(open){
   if(bigMap)window.scrollTo({top:0,behavior:'instant'});
   $('#close-map-legend').focus({preventScroll:bigMap});
  }else if(restoreFocus){
   window.scrollTo({top:bigMap?0:legendScrollY,behavior:'instant'});
   toggle.focus({preventScroll:true});
  }
 });
}
function setBigMap(expanded,restoreFocus=false){
 if(expanded&&mapOwner==='journey')return;
 if(expanded===bigMap)return;
 if(expanded){bigMapScroll=window.scrollY;bigMap=true;}
 else bigMap=false;
 document.body.classList.toggle('big-map',expanded);
 const button=$('#toggle-big-map');button.setAttribute('aria-pressed',String(expanded));
 $('#map').setAttribute('aria-describedby',mapOwner==='journey'?'journey-map-description':'map-description');
 syncMapControlLayout();
 if(expanded)window.scrollTo({top:0,behavior:'instant'});
 else if(currentView==='explore')window.scrollTo({top:bigMapScroll,behavior:'instant'});
 requestAnimationFrame(()=>{
  if(map){map.resize();renderMarkers();}
  if(expanded&&bigMap)keepMapControlVisible(button);
  if(restoreFocus)button.focus({preventScroll:true});
 });
}
function resetMapUI(){
 setMapLegend(false);
 setBigMap(false);
 $('#map-directions').hidden=true;
 $('#toggle-map-directions').setAttribute('aria-expanded','false');
 $('#toggle-map-directions').setAttribute('aria-pressed','false');
}
$('#toggle-big-map').onclick=()=>setBigMap(!bigMap,true);
$('#toggle-map-legend').onclick=()=>setMapLegend(!legendOpen,true);
$('#close-map-legend').onclick=()=>setMapLegend(false,true);
$('#toggle-map-directions').onclick=()=>{
 const expanded=$('#map-directions').hidden;
 $('#map-directions').hidden=!expanded;
 $('#toggle-map-directions').setAttribute('aria-expanded',String(expanded));
 $('#toggle-map-directions').setAttribute('aria-pressed',String(expanded));
 if(expanded)requestAnimationFrame(()=>{
  const grid=$('#map-directions');
  if(grid.hidden||!['explore','journey'].includes(currentView)||$('#map-panel').hidden)return;
  const first=grid.querySelector('button');keepMapControlVisible(first);
  first.focus({preventScroll:bigMap});
 });
 announce(expanded?'Direction buttons shown.':'Direction buttons hidden.');
};
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape'||$('dialog[open]'))return;
 if(legendOpen){e.preventDefault();setMapLegend(false,true);}
 else if(bigMap){e.preventDefault();setBigMap(false,true);}
});
$('.map-control-panel').addEventListener('focusin',e=>{if(e.target instanceof HTMLElement)keepMapControlVisible(e.target);});
if(typeof ResizeObserver==='function'){
 new ResizeObserver(()=>{if(map)requestAnimationFrame(()=>{map.resize();renderMarkers();});}).observe($('#map'));
 new ResizeObserver(syncMapControlLayout).observe($('#main'));
 new ResizeObserver(()=>{if(map)requestAnimationFrame(renderMarkers);}).observe($('.map-topbar'));
}

function renderJourneySummaries(){
 for(const target of ['start','end']){
  const point=journeyPoints[target],summary=$(target==='start'?'#origin-summary':'#destination-summary');
  summary.textContent=point?`${point.label} · ${point.kind==='gps'?'GPS location':point.kind==='sample'?'Place point':'Map selection'}`:`No ${target==='start'?'start':'destination'} selected.`;
 }
}
function syncJourneyMarkers(){
 if(!map)return;
 if(route)map.setRouteEndpoints(route.snaps.start.coords,route.snaps.end.coords);
 else map.setRouteEndpoints(mapOwner==='journey'?journeyPoints.start?.coords:null,mapOwner==='journey'?journeyPoints.end?.coords:null);
}
function invalidateJourney(){
 routingTask++;
 $('#calculate-route').disabled=false;$('#calculate-route').removeAttribute('aria-busy');
 $('#routing-status').textContent='';
 if(!route)return;
 $('#journey-result').hidden=true;route=null;removeRouteFromMap();stopSpeech();
}
function cancelLocate(clearStatus=true){
 locationRequest++;
 if(mapSelection)mapSelection.locating=false;
 $('#locate-me').disabled=false;$('#locate-me').removeAttribute('aria-busy');
 $('#locate-button-label').textContent='Locate me';
 if(clearStatus)$('#location-status').textContent='';
}
function manualSelectionInteraction(){
 if(!mapSelection)return;
 cancelLocate();mapSelection.kind='map';
}
$('#map').addEventListener('pointerdown',manualSelectionInteraction);
$('#locate-me').onclick=()=>{
 const selection=mapSelection;if(!selection||selection.target!=='start'||currentView!=='journey')return;
 cancelLocate();const status=$('#location-status');
 if(!window.isSecureContext||!navigator.geolocation){status.textContent='Location is unavailable here. Tap the map or use Move Map, or open the app over HTTPS or localhost.';return;}
 const request=locationRequest;
 const button=$('#locate-me');button.disabled=true;button.setAttribute('aria-busy','true');selection.locating=true;
 $('#locate-button-label').textContent='Locating…';status.textContent='Finding your location…';
 const isCurrent=()=>request===locationRequest&&currentView==='journey'&&mapSelection===selection&&selection.target==='start';
 const finish=()=>{selection.locating=false;button.disabled=false;button.removeAttribute('aria-busy');$('#locate-button-label').textContent='Locate me';};
 navigator.geolocation.getCurrentPosition(position=>{
  if(!isCurrent())return;finish();
  const {latitude,longitude}=position.coords;
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){status.textContent='Your location could not be found. Tap the map or use Move Map.';return;}
  selection.kind='gps';map.jumpTo({center:[longitude,latitude]});
  status.textContent='Location found. Choose Use this start to confirm it.';
 },error=>{
  if(!isCurrent())return;finish();
  status.textContent=error.code===1?'Location permission was not granted. Tap the map or use Move Map.':error.code===3?'Finding your location took too long. Try again or choose a point on the map.':'Your location could not be found. Try again or choose a point on the map.';
 },{enableHighAccuracy:true,timeout:10000,maximumAge:0});
};
['reset-settings','clear-data'].forEach(id=>$('#'+id).addEventListener('click',()=>{resetMapUI();cancelLocate();}));
function resolveJourneyPoint(target){return journeyPoints[target];}
function setJourneyPoint(target,point){
 invalidateJourney();journeyPoints[target]={...point,coords:[...point.coords]};
 renderJourneySummaries();syncJourneyMarkers();
}
function ensureRouter(){
 if(!routingPromise){
  routingPromise=Promise.resolve().then(()=>{
   if(!window.AccessRouting||!window.AccessRoutingData)throw new Error('The local walking network could not load. Reopen the app with its source files available.');
   return window.AccessRouting.create(window.AccessRoutingData);
  }).catch(error=>{routingPromise=null;throw error;});
 }
 return routingPromise;
}
function setSelectionControls(){
 const active=mapSelection;
 $('#map').setAttribute('aria-label',active?(active.target==='start'?'Choose your starting point on the map':'Choose your destination on the map'):(mapOwner==='journey'?'Journey walking map':'Map of central Adelaide'));
 for(const target of ['start','end'])$(target==='start'?'#choose-start-map':'#choose-end-map').setAttribute('aria-pressed',String(active?.target===target));
 $('#map-selection').hidden=!active;$('#selection-crosshair').hidden=!active;
 $('#map-locate').hidden=active?.target!=='start';
 $('#fit-route').hidden=!!active||!route;
 document.body.classList.toggle('choosing-route-location',!!active);
 if(active){$('#map-selection-title').textContent=active.target==='start'?'Choose your starting point':'Choose your destination';$('#confirm-map-location').textContent=active.target==='start'?'Use this start':'Use this destination';}
}
async function showJourneyMap(){
 if(currentView!=='journey')return null;
 journeyMapVisible=true;attachMap('journey');initMap();
 if(!map)throw new Error('The map could not load. Reopen the app with its source files available.');
 const engine=await ensureRouter();
 if(currentView!=='journey'||mapOwner!=='journey')return null;
 map.setNetwork(engine.networkGeoJSON());map.setNetworkVisible(true);map.resize();return map;
}
async function beginMapSelection(target){
 if(currentView!=='journey'||mapSelection?.target===target)return;
 cancelLocate();if($('#calculate-route').disabled)invalidateJourney();
 const selection={target,kind:'map',returnFocus:target==='start'?'#choose-start-map':'#choose-end-map'};
 mapSelection=selection;setSelectionControls();$('#routing-status').textContent='Preparing the local walking network…';
 try{
  // Mount immediately, before network preparation completes, and never navigate away.
  journeyMapVisible=true;attachMap('journey');initMap();
  if(!map)throw new Error('The map could not load. Reopen the app with its source files available.');
  const onSelect=coords=>{if(mapSelection!==selection)return;manualSelectionInteraction();map.setSelection({active:true,coords,onSelect});};
  const centre=journeyPoints[target]?.coords||map.getCenterCoordinates();
  map.setSelection({active:true,coords:centre,onSelect});syncJourneyMarkers();
  await showJourneyMap();if(mapSelection!==selection||currentView!=='journey')return;
  $('#routing-status').textContent='';
  requestAnimationFrame(()=>{if(mapSelection!==selection)return;map.resize();$('#map').focus({preventScroll:true});window.scrollTo({top:window.scrollY+$('#journey-map-slot').getBoundingClientRect().top-8,behavior:'instant'});});
  announce('Choose a point by tapping the map or using Move Map, then confirm it.');
 }catch(error){if(mapSelection===selection){endMapSelection(false,false);$('#routing-status').textContent=error.message;}}
}
function endMapSelection(confirm=false,restoreFocus=true){
 const selection=mapSelection;if(!selection)return;
 if(confirm&&map){const coords=map.getCenterCoordinates(),gps=selection.kind==='gps';setJourneyPoint(selection.target,{coords,label:`${gps?'Current location':'Map point'} (${coords[1].toFixed(5)}, ${coords[0].toFixed(5)})`,kind:gps?'gps':'map'});}
 cancelLocate();mapSelection=null;if(map)map.setSelection(null);$('#routing-status').textContent='';
 setSelectionControls();syncJourneyMarkers();
 if(restoreFocus&&currentView==='journey'){requestAnimationFrame(()=>$(selection.returnFocus).focus());announce(confirm?'Location confirmed.':'Map selection cancelled. Your previous point has been kept.');}
}
$('#choose-start-map').onclick=()=>beginMapSelection('start');$('#choose-end-map').onclick=()=>beginMapSelection('end');
$('#confirm-map-location').onclick=()=>endMapSelection(true);$('#cancel-map-location').onclick=()=>endMapSelection(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mapSelection){e.preventDefault();endMapSelection(false);}});
function routeSteps(segments,destinationLabel){
 const bearing=coords=>{const a=coords[0],b=coords[coords.length-1];return Math.atan2((b[0]-a[0])*Math.cos(a[1]*Math.PI/180),b[1]-a[1])*180/Math.PI;};
 const groups=[];
 for(const segment of segments){
  if(segment.distance<=0)continue;
  const angle=bearing(segment.coords),previous=groups[groups.length-1];
  const delta=previous?((angle-previous.angle+540)%360)-180:0;
  if(previous&&Math.abs(delta)<30&&segment.location===previous.location&&segment.pathType===previous.pathType){previous.distance+=segment.distance;previous.angle=angle;continue;}
  groups.push({...segment,angle,turn:delta});
 }
 if(!groups.length)return [{title:'Start and destination coincide',text:'Both points snap to the same location. There is no walking segment.',distance:0}];
 return groups.map((g,i)=>({
  title:i===0?'Begin on the walking network':Math.abs(g.turn)>150?'Turn back':g.turn>30?'Turn right':g.turn< -30?'Turn left':'Continue',
  text:`${g.location?g.location+' · ':''}${g.pathType}. Follow the path for approximately ${Math.round(g.distance)} metres.${i===groups.length-1?' Finish at the snapped destination near '+destinationLabel+'.':''} Turn estimates are approximate; check actual crossings and conditions.`,
  distance:Math.round(g.distance)
 }));
}
async function calculateJourney(){
 if(mapSelection){$('#routing-status').textContent='Confirm your selected point or cancel map selection before calculating.';$('#confirm-map-location').focus();return;}
 invalidateJourney();cancelLocate();
 const request=routingTask;
 const start=resolveJourneyPoint('start'),end=resolveJourneyPoint('end');
 if(!start||!end){
  const target=!start?'starting point':'destination';
  $('#routing-status').textContent=`Choose and confirm your ${target} on the map before calculating.`;
  $(start?'#choose-end-map':'#choose-start-map').focus();announce($('#routing-status').textContent);return;
 }
 const profile=$('input[name="route-style"]:checked').value,pace=Number(ui.getChoice('pace'));
 const button=$('#calculate-route');button.disabled=true;button.setAttribute('aria-busy','true');$('#routing-status').textContent='Calculating on the local walking network…';
 try{
  const engine=await ensureRouter();if(request!==routingTask)return;
  const result=await engine.calculate({start:start.coords,end:end.coords,profile,pace,cancelled:()=>request!==routingTask});
  if(request!==routingTask)return;
  journeyPoints={start,end};
  route={...result,style:profile,styleName:routeProfiles[profile],pace:String(pace),origin:start.label,destinationLabel:end.label,name:end.label,points:{start,end},needs:$$('input[name="needs"]:checked').map(c=>c.value),steps:routeSteps(result.segments,end.label)};
  renderRoute();$('#routing-status').textContent='';$('#result-title').focus();announce('Walking-network journey calculated. Access and conditions remain unverified.');
 }catch(error){
  if(request!==routingTask||error.code==='CANCELLED')return;
  const recovery=error.code==='DISCONNECTED'?' Choose different points within the same connected walking network.':error.code==='OUTSIDE_COVERAGE'?' Choose a point closer to an eligible path, within 50 metres.':' Choose your points again or try another route type.';
  $('#routing-status').textContent=error.message+recovery;announce($('#routing-status').textContent);
 }finally{if(request===routingTask){button.disabled=false;button.removeAttribute('aria-busy');}}
}
$('#journey-form').onsubmit=e=>{e.preventDefault();calculateJourney();};
$('#journey-form').addEventListener('change',e=>{if(e.target.matches('input'))invalidateJourney();});
function removeRouteFromMap(){if(map)map.setRoute([]);syncJourneyMarkers();$('#fit-route').hidden=true;}
function renderRoute(){
 stepIndex=0;$('#journey-result').hidden=false;const r=route;
 $('#route-summary').innerHTML=`<div class="route-card"><p>${escapeHTML(r.origin)} →</p><h3>${escapeHTML(r.name)}</h3><p>${r.styleName} · calculated walking network</p><div class="route-stats"><div><strong>${Math.round(r.distance)} m</strong><span>Network distance</span></div><div><strong>~${Math.ceil(r.duration)} min</strong><span>Estimated moving time</span></div></div><p class="route-snap-info">Start snapped ${r.snaps.start.distance.toFixed(1)} m; destination snapped ${r.snaps.end.distance.toFixed(1)} m. Limit: 50 m each. These offsets are outside the calculated route.</p></div><div class="route-caveat"><strong>Test route. Access has not been verified.</strong><p>Private, unofficial, proposed and timed paths are excluded.${r.style==='stepfree'?' Recorded stairs and escalators are also excluded; this does not establish wheelchair access.':''}</p><p>Kerb ramps, gradients, widths, surfaces, crossings, closures and facilities have not been checked. ${r.points.start.kind==='sample'||r.points.end.kind==='sample'?'The selected sample place information is invented and its entrance is unverified.':''}</p><p>Preferences not checked: ${escapeHTML(r.needs.join('; ')||'none selected')}. Rest stops and quieter surroundings are not optimised. ETA uses network speed estimates scaled to your ${r.pace} m/min pace; rest time is extra.</p></div>`;
 $('#step-guide').innerHTML=`<p class="small">${r.steps.length} approximate ${r.steps.length===1?'step':'steps'}. Read below or move at your own pace. Nothing advances automatically.</p><ol class="steps" role="list">${r.steps.map((s,i)=>`<li id="step-${i}" role="listitem" tabindex="-1"><span class="step-number" aria-hidden="true">${i+1}</span><div><p><strong>${escapeHTML(s.title)}</strong>${escapeHTML(s.text)}</p><span class="small">${s.distance} m · network segment</span></div></li>`).join('')}</ol><p id="step-progress" class="small">Step 1 of ${r.steps.length}</p><div class="step-controls"><button id="previous-step" class="secondary" disabled>Previous step</button><button id="next-step" class="primary" ${r.steps.length===1?'disabled':''}>Next step</button></div>`;
 $('#previous-step').onclick=()=>moveStep(-1);$('#next-step').onclick=()=>moveStep(1);drawRoute();$('#fit-route').hidden=false;
}
function moveStep(delta){if(!route)return;stepIndex=Math.min(route.steps.length-1,Math.max(0,stepIndex+delta));$$('.steps li').forEach((li,i)=>li.classList.toggle('step-focus',i===stepIndex));const step=$(`#step-${stepIndex}`);step.focus();window.scrollTo({top:window.scrollY+step.getBoundingClientRect().top-30,behavior:'instant'});$('#step-progress').textContent=`Step ${stepIndex+1} of ${route.steps.length}`;$('#previous-step').disabled=stepIndex===0;$('#next-step').disabled=stepIndex===route.steps.length-1;announce(`Step ${stepIndex+1} of ${route.steps.length}. ${route.steps[stepIndex].title}.`);}
function drawRoute(){if(map&&route){map.setRoute(route.coords);map.setRouteEndpoints(route.snaps.start.coords,route.snaps.end.coords);}}
$('#route-map').onclick=async()=>{const result=route;if(!result)return;if(mapSelection)endMapSelection(false,false);try{const active=await showJourneyMap();if(!active||route!==result)return;drawRoute();active.fitBounds(mapBounds(result.coords),{padding:48,maxZoom:17,duration:reduceMotion()?0:200});window.scrollTo({top:window.scrollY+$('#journey-map-slot').getBoundingClientRect().top-8,behavior:'instant'});$('#map').focus({preventScroll:true});}catch(error){$('#routing-status').textContent=error.message;}};
$('#fit-route').onclick=()=>{if(map&&route)map.fitBounds(mapBounds(route.coords),{padding:48,maxZoom:17,duration:settings.motion?0:200});};
function routeText(r){return `ACCESS ADELAIDE — WALKING-NETWORK TEST JOURNEY\nNot a verified navigation or accessibility service.\n\n${r.origin} to ${r.name}\n${r.styleName}\nNetwork distance: ${Math.round(r.distance)} m; estimated moving time: ${Math.ceil(r.duration)} minutes at your chosen ${r.pace} m/min pace. Rest time is extra.\nStart snap: ${r.snaps.start.distance.toFixed(1)} m; destination snap: ${r.snaps.end.distance.toFixed(1)} m (limit 50 m each; offsets excluded from route).\nPreferences not checked: ${r.needs.join('; ')||'none selected'}.\n\n${r.steps.map((s,i)=>`${i+1}. ${s.title} (${s.distance} m)\n${s.text}`).join('\n\n')}\n\nTurn estimates are approximate. Unknown: kerb ramps, gradient, width, surfaces, crossings, closures and facility availability. Sample place information and entrances are unverified. Private, unofficial, proposed and timed paths are excluded; Step-free additionally excludes recorded stairs and escalators. ETA uses Shape_Length / Speed, scaled by 1.39 / (chosen pace / 60).\nNetwork version: ${r.networkVersion}\n`;}
function downloadText(name,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('#download-route').onclick=()=>{if(route){downloadText('Access_Adelaide_Walking_Journey.txt',routeText(route));announce('Walking journey text download requested.');}};
function readSaved(){
 try{
  const x=JSON.parse(localStorage.getItem(SAVED));if(!x||typeof x!=='object')return null;
  if(x.version!==2)return {legacy:true,origin:typeof x.origin==='string'?x.origin.slice(0,160):'',destinationLabel:typeof x.destinationLabel==='string'?x.destinationLabel.slice(0,160):''};
  const validPoint=p=>p&&typeof p.label==='string'&&p.label.length<=160&&['sample','map','gps'].includes(p.kind)&&Array.isArray(p.coords)&&p.coords.length===2&&p.coords.every(Number.isFinite)&&Math.abs(p.coords[0])<=180&&Math.abs(p.coords[1])<=90;
  if(!validPoint(x.points?.start)||!validPoint(x.points?.end)||!Object.hasOwn(routeProfiles,x.profile)||![35,50,70].includes(Number(x.pace)))return null;
  return {...x,needs:Array.isArray(x.needs)?x.needs.filter(n=>$$('input[name="needs"]').some(c=>c.value===n)):[]};
 }catch{return null;}
}
function renderSaved(){const saved=readSaved();$('#saved-plan').hidden=!saved;if(saved)$('#saved-title').textContent=saved.legacy?'Saved illustrative journey: choose both endpoints again before calculating.':`${saved.points.start.label} → ${saved.points.end.label} · recalculated when opened`;}
$('#save-route').onclick=()=>{if(!route)return;try{localStorage.setItem(SAVED,JSON.stringify({version:2,networkVersion:route.networkVersion,points:route.points,profile:route.style,pace:route.pace,needs:route.needs}));renderSaved();announce('Journey endpoints and preferences saved on this device. The route will be recalculated when opened.');}catch{announce('Your browser could not save this journey. You can download its text instead.');}};
$('#load-saved').onclick=()=>{
 cancelLocate();if(mapSelection)endMapSelection(false,false);const spec=readSaved();if(!spec){announce('This saved journey could not be opened. Choose new endpoints.');return;}
 if(spec.legacy){invalidateJourney();journeyPoints={start:null,end:null};renderJourneySummaries();syncJourneyMarkers();$('#routing-status').textContent=`This is an old illustrative journey (${spec.origin||'unknown start'} → ${spec.destinationLabel||'unknown destination'}). Choose and confirm both endpoints on the map, then calculate a walking route.`;$('#choose-start-map').focus();return;}
 setJourneyPoint('start',spec.points.start);setJourneyPoint('end',spec.points.end);$(`input[name="route-style"][value="${spec.profile}"]`).checked=true;ui.setChoice('pace',spec.pace);$$('input[name="needs"]').forEach(c=>c.checked=spec.needs.includes(c.value));calculateJourney();
};
$('#delete-saved').onclick=()=>{try{localStorage.removeItem(SAVED);}catch{}$('#journey-title').focus();renderSaved();announce('Saved journey removed from this device.');};
$('#place-dialog-body').addEventListener('click',e=>{const b=e.target.closest('[data-plan-place]');if(!b)return;const p=D.places.find(x=>x.id===b.dataset.planPlace);if(!p)return;setJourneyPoint('end',{coords:p.coordinates,label:p.name,kind:'sample'});$('#place-dialog').close();location.hash='journey';});
// Speech is opt-in, never an essential channel, and always stoppable.
function restoreSpeechFocus(){if($('#speech-bar').contains(document.activeElement)){if(lastSpeechTrigger?.isConnected&&!lastSpeechTrigger.closest('[hidden]'))lastSpeechTrigger.focus();else $(`#${currentView}-title`).focus();}}
function stopSpeech(){restoreSpeechFocus();if('speechSynthesis'in window)window.speechSynthesis.cancel();speechJob=null;$('#speech-bar').hidden=true;}
function speak(text){if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){announce('Read aloud is unavailable in this browser. All directions are available as text.');return;}stopSpeech();lastSpeechTrigger=document.activeElement;const u=new SpeechSynthesisUtterance(text);u.lang='en-AU';u.rate=Number(settings.speechRate);speechJob=u;u.onstart=()=>{if(speechJob===u)document.dispatchEvent(new CustomEvent('accessadelaide:speech',{detail:{state:'started'}}));};u.onend=()=>{if(speechJob===u){restoreSpeechFocus();speechJob=null;$('#speech-bar').hidden=true;announce('Reading finished.');}};u.onerror=e=>{if(speechJob===u){if(!['interrupted','canceled'].includes(e.error))document.dispatchEvent(new CustomEvent('accessadelaide:speech',{detail:{state:'error'}}));restoreSpeechFocus();speechJob=null;$('#speech-bar').hidden=true;announce('The browser could not read aloud. Written text remains available.');}};$('#speech-bar').hidden=false;window.speechSynthesis.speak(u);announce('Reading aloud. Use Stop reading at any time.');}
$('#stop-speech').onclick=()=>{stopSpeech();announce('Reading stopped.');};
$('#read-route').onclick=()=>{if(route)speak(route.steps.map((s,i)=>`Step ${i+1}. ${s.title}. ${s.text}`).join('\n\n'));};$('#test-speech').onclick=()=>speak('Welcome to Access Adelaide. Your city. Your pace. You can change the way this app looks and feels.');
if(!('speechSynthesis'in window)){$('#speech-support').hidden=false;$('#speech-support').textContent='Read aloud is unavailable in this browser. All content remains available as text.';$('#test-speech').disabled=true;$('#read-route').disabled=true;}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech();});
$$('[data-setting]').forEach(e=>e.addEventListener('change',()=>{
 if(e.type==='radio'&&!e.checked)return;
 settings[e.dataset.setting]=e.type==='checkbox'?e.checked:e.value;applySettings();
 const group=e.closest('fieldset'),label=e.type==='radio'?group?.querySelector('legend')?.textContent:e.closest('label')?.querySelector('span')?.textContent;
 announce(`${(label||'Settings').trim()} updated.`);
}));
$$('[data-preset]').forEach(b=>b.onclick=()=>{const {remember,dyslexicFont,buttonDisplay,longPressTips}=settings;const presets={clear:{textSize:'150',theme:'contrast',targets:true},calm:{simple:true,spacing:true,mapless:true,motion:true},touch:{targets:true,textSize:'125'}};settings={...defaults,remember,dyslexicFont,buttonDisplay,longPressTips,...presets[b.dataset.preset]};applySettings();announce(`${b.querySelector('strong').textContent} setup applied. Adjust individual settings below or use Reset access settings.`);});
$('#reset-settings').onclick=()=>{settings={...defaults};applySettings();setExploreMode(true);announce('Access settings reset. Saved journey is unchanged.');};
$('#clear-data').onclick=()=>{try{localStorage.removeItem(SETTINGS);localStorage.removeItem(SAVED);}catch{}invalidateJourney();endMapSelection(false,false);journeyPoints={start:null,end:null};journeyMapVisible=false;$('#journey-map-slot').hidden=true;$('#selected-locations').open=false;renderJourneySummaries();attachMap('explore');syncJourneyMarkers();settings={...defaults};applySettings(false);setExploreMode(true);renderSaved();announce('Saved settings and journey cleared. Access settings reset.');};
$('#show-card').onclick=()=>{const text=$('#communication').value.trim();if(!text){$('#communication').setAttribute('aria-invalid','true');$('#communication-error').hidden=false;$('#communication').focus();announce('Write what would help in the communication card field first.');return;}$('#communication').removeAttribute('aria-invalid');$('#communication-error').hidden=true;$('#communication-text').textContent=text;openDialog($('#communication-dialog'),$('#show-card'));};
$('#quiet-screen').onclick=()=>{stopSpeech();openDialog($('#quiet-dialog'),$('#quiet-screen'));};
$('#feedback-form').onsubmit=e=>{e.preventDefault();const text=$('#feedback').value.trim();if(!text){$('#feedback').setCustomValidity('Please write a feedback note first.');$('#feedback').reportValidity();return;}$('#feedback').setCustomValidity('');downloadText('Access_Adelaide_Feedback.txt',`Access Adelaide prototype feedback\n\n${text}\n`);$('#feedback-status').textContent='Feedback note download requested. Nothing was sent.';};
$('#feedback').oninput=()=>$('#feedback').setCustomValidity('');
window.addEventListener('pagehide',stopSpeech);
window.addEventListener('resize',()=>{renderJourneySummaries();syncMapControlLayout();if(map)map.resize();});
const mapConfig=window.AccessBasemaps?.getConfig();
function syncMapSettings(){const c=window.AccessBasemaps?.getConfig();if(!c)return;ui.setChoice('basemap-choice',c.preferred);$('#metromap-key').value=c.key;$('#remember-map-key').checked=c.rememberKey;$('#force-2d-map').checked=c.force2D;}
syncMapSettings();
$('#show-metromap-key').onclick=()=>{const input=$('#metromap-key'),show=input.type==='password';input.type=show?'text':'password';$('#show-metromap-key').textContent=show?'Hide API key':'Show API key';$('#show-metromap-key').setAttribute('aria-pressed',String(show));};
$('#apply-basemap').onclick=()=>{const key=$('#metromap-key').value.trim();if(/[\r\n]/.test(key)){$('#map-settings-status').textContent='Please paste only the API key, without line breaks.';$('#metromap-key').focus();return;}window.AccessBasemaps.configure({key,preferred:ui.getChoice('basemap-choice'),rememberKey:$('#remember-map-key').checked,force2D:$('#force-2d-map').checked});$('#metromap-key').type='password';$('#show-metromap-key').textContent='Show API key';$('#show-metromap-key').setAttribute('aria-pressed','false');$('#map-settings-status').textContent=key&&ui.getChoice('basemap-choice')==='metromap'?'MetroMap selected. If its tiles cannot be loaded, the map will use Esri Topography.':'Esri Topography will be used. No MetroMap key is needed for this fallback.';};
$('#remove-map-key').onclick=()=>{window.AccessBasemaps.configure({key:'',rememberKey:false});$('#metromap-key').value='';$('#remember-map-key').checked=false;$('#metromap-key').type='password';$('#show-metromap-key').textContent='Show API key';$('#show-metromap-key').setAttribute('aria-pressed','false');$('#map-settings-status').textContent='API key removed. Esri Topography will be used.';};
$('#clear-data').addEventListener('click',()=>{window.AccessBasemaps?.clear();syncMapSettings();});
$('#factory-reset').onclick=()=>{
 resetMapUI();cancelLocate();stopSpeech();
 $$('dialog[open]').forEach(d=>d.close());lastDialogTrigger=null;lastSpeechTrigger=null;
 for(const key of [SETTINGS,SAVED,'access-adelaide-support-v2']){try{localStorage.removeItem(key);}catch{}}
 invalidateJourney();settings={...defaults};route=null;stepIndex=0;journeyPoints={start:null,end:null};endMapSelection(false,false);journeyMapVisible=false;$('#journey-map-slot').hidden=true;$('#selected-locations').open=false;renderJourneySummaries();attachMap('explore');syncJourneyMarkers();
 $('#journey-form').reset();$('#feedback-form').reset();$('#feedback').setCustomValidity('');
 $$('#communication,#quick-card-editor').forEach(e=>e.value='');
 $$('#route-summary,#step-guide,#saved-title,#communication-text,#quick-card-text,#feedback-status').forEach(e=>e.textContent='');
 $('#journey-result').hidden=true;
 $$('#communication-error,#quick-card-error').forEach(e=>e.hidden=true);
 $$('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));
 $('#filters').hidden=true;$('#open-filters').setAttribute('aria-expanded','false');
 selectedLayers.clear();Object.keys(D.layers).forEach(id=>selectedLayers.add(id));$$('[data-layer]').forEach(e=>e.checked=true);
 $('#explore-results-title').textContent='Mock places';
 setExploreMode(false);removeRouteFromMap();applySettings(false);renderPlaces();renderSaved();
 syncMapSettings();$('#metromap-key').type='password';$('#show-metromap-key').textContent='Show API key';$('#show-metromap-key').setAttribute('aria-pressed','false');$('#map-settings-status').textContent='';
 document.dispatchEvent(new CustomEvent('accessadelaide:factory-reset'));
 history.replaceState(null,'','#setup');
 navigate();$('#setup-title').focus();window.scrollTo({top:0,behavior:'instant'});
 announce('App reset to first-time setup. Your map key and imagery settings have been kept.');
};

window.AccessAdelaide=Object.freeze({
 icon,escapeHTML,announce,speak,stopSpeech,openDialog,
 getView:()=>currentView,
 getSettings:()=>({...settings}),
 getTextScale,normaliseSettings:sanitiseSettings,
 setSettings:patch=>{settings=sanitiseSettings({...settings,...patch});applySettings();},
 setMapVisible:show=>setExploreMode(show,false),
 filterLayers:ids=>{selectedLayers.clear();ids.filter(id=>D.layers[id]).forEach(id=>selectedLayers.add(id));$$('[data-layer]').forEach(e=>e.checked=selectedLayers.has(e.dataset.layer));renderPlaces();},
 mainText:()=>($(`#view-${currentView}`)?.innerText||'').slice(0,14000),
 getPlaceCount:()=>D.places.filter(p=>selectedLayers.has(p.type)).length,
 refreshMap:()=>{if(map)map.resize();}
});
renderPlaces();renderSaved();navigate();
})();
