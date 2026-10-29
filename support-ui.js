'use strict';
(() => {
const api=window.AccessAdelaide;if(!api)return;
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=api.escapeHTML,icon=api.icon,KEY='access-adelaide-support-v2',ui=window.AccessUI;
const categories=[
 {id:'toilets',name:'Toilets',description:'Find a place to use a toilet',icon:'toilet',layers:['toilet']},
 {id:'transport',name:'Public transport',description:'Bus, tram and station examples',icon:'bus',layers:['entry','transport']},
 {id:'shops',name:'Shops',description:'Places to buy what you need',icon:'shop',layers:['shop']},
 {id:'food',name:'Food & drink',description:'Cafés and restaurants',icon:'food',layers:['food']},
 {id:'rest',name:'A place to rest',description:'Seats and somewhere to pause',icon:'bench',layers:['rest']},
 {id:'quiet',name:'A quieter place',description:'Somewhere with less going on',icon:'leaf',layers:['quiet']},
 {id:'water',name:'Drinking water',description:'Fountains and bottle refills',icon:'water',layers:['water']},
 {id:'activities',name:'Things to do',description:'Places and activities to explore',icon:'activity',layers:['activity']}
];
const needOptions=[
 {id:'seeing',label:'Make things easier to see',text:'Larger text, stronger contrast and bigger controls.',icon:'eye'},
 {id:'reading',label:'Read information aloud',text:'Offer spoken guidance and a reading button.',icon:'volume'},
 {id:'communicating',label:'Help me communicate',text:'Keep a message card close at hand.',icon:'message'},
 {id:'visual',label:'Keep information visual',text:'Show clear text. Keep automatic sound off.',icon:'list'},
 {id:'touch',label:'Make tapping easier',text:'Extra-large controls and one choice at a time.',icon:'hand'},
 {id:'calm',label:'Keep the screen calm',text:'Simple pages, more space and no animated movement.',icon:'leaf'}
];
const toolOptions={communicate:{label:'Message Card',icon:'message',text:'Show my message card'},read:{label:'Read page',icon:'volume',text:'Read the visible page aloud'},text:{label:'Text & contrast',icon:'eye',text:'Adjust reading controls'},quiet:{label:'Quiet moment',icon:'leaf',text:'Take a break from the screen'}};
const appOptions={
 uber:{label:'Uber',href:'https://m.uber.com/looking',image:'uber.svg'},
 taxi:{label:'Taxi',icon:'taxi'},
 phone:{label:'Phone',icon:'phone-call'},
 spotify:{label:'Spotify',href:'https://open.spotify.com/',image:'spotify.svg'}
};
const taxiProviders={
 '13cabs':{label:'13cabs',number:'132227',displayNumber:'13 2227',image:'13cabs.svg'},
 suburban:{label:'Suburban Taxis',number:'131008',displayNumber:'131 008'},
 independent:{label:'Adelaide Independent Taxis',number:'132211',displayNumber:'13 22 11'},
 access:{label:'Access Taxis',number:'1300360940',displayNumber:'1300 360 940'}
};
function emptyShortcuts(){return{pinned:[],taxiProvider:'',taxiNumber:'',phoneMode:'dial',phoneNumber:''};}
function phoneNumber(value){
 const s=String(value||'').trim();
 if(!/^\+?[\d\s().-]+$/.test(s))return '';
 const number=s.replace(/[\s().-]/g,'');
 return /^\+?\d{3,15}$/.test(number)?number:'';
}
function taxiNumber(s){return taxiProviders[s.taxiProvider]?.number||(s.taxiProvider==='other'?phoneNumber(s.taxiNumber):'');}
function cleanShortcuts(value){
 const s=emptyShortcuts();if(!value||typeof value!=='object')return s;
 s.pinned=Object.keys(appOptions).filter(id=>Array.isArray(value.pinned)&&value.pinned.includes(id));
 s.taxiProvider=taxiProviders[value.taxiProvider]||value.taxiProvider==='other'?value.taxiProvider:'';
 s.taxiNumber=phoneNumber(value.taxiNumber);
 s.phoneMode=value.phoneMode==='speed'?'speed':'dial';s.phoneNumber=phoneNumber(value.phoneNumber);
 if(!taxiNumber(s))s.pinned=s.pinned.filter(id=>id!=='taxi');
 if(s.phoneMode==='speed'&&!s.phoneNumber)s.phoneMode='dial';
 return s;
}
function shortcutHost(scope){return $('[data-shortcut-chooser="'+scope+'"]');}
function shortcutChoiceGroup(scope,key,label,options,value){
 return ui.choiceMarkup({id:scope+'-'+key,name:scope+'-'+key,label,value,options});
}
function shortcutChooserMarkup(scope,value,saveButton=false){
 const s={...emptyShortcuts(),...value},pinned=id=>s.pinned.includes(id);
 const numberField=(id,label,value,description)=>'<div class="field"><label for="'+scope+'-'+id+'">'+label+'</label><input id="'+scope+'-'+id+'" type="tel" inputmode="tel" autocomplete="tel" maxlength="32" value="'+esc(value)+'" aria-describedby="'+scope+'-shortcuts-error"'+(description?' aria-label="'+description+'"':'')+'></div>';
 const taxiOptions=Object.entries(taxiProviders).map(([value,p])=>({value,label:p.label,description:'Phone '+p.displayNumber})).concat({value:'other',label:'Other number'});
 const taxi=shortcutChoiceGroup(scope,'taxi-provider','Preferred taxi company',taxiOptions,s.taxiProvider)+'<div id="'+scope+'-taxi-custom-drawer" class="shortcut-drawer shortcut-subdrawer"'+(s.taxiProvider==='other'?'':' hidden')+'><div class="shortcut-drawer-body">'+numberField('taxi-number','Taxi phone number',s.taxiNumber)+'</div></div>';
 const phone=shortcutChoiceGroup(scope,'phone-mode','Phone shortcut',[{value:'dial',label:'Enter a number each time'},{value:'speed',label:'Speed dial'}],s.phoneMode)+'<div id="'+scope+'-phone-speed-drawer" class="shortcut-drawer shortcut-subdrawer"'+(s.phoneMode==='speed'?'':' hidden')+'><div class="shortcut-drawer-body">'+numberField('phone-speed-number','Speed-dial number',s.phoneNumber)+'</div></div>';
 const choices=Object.entries(appOptions).map(([id,app])=>{
  const drawer=id==='taxi'?taxi:id==='phone'?phone:'',drawerId=scope+'-'+id+'-drawer';
  return '<div class="shortcut-choice"><label class="check-row shortcut-pin-row" for="'+scope+'-pin-'+id+'"><input id="'+scope+'-pin-'+id+'" type="checkbox" data-app-pin="'+id+'"'+(pinned(id)?' checked':'')+(drawer?' aria-controls="'+drawerId+'"':'')+'><span class="shortcut-pin-name">'+app.label+'</span>'+(drawer?'<span class="shortcut-pin-chevron" aria-hidden="true">'+icon('chevron-down')+'</span>':'')+'</label>'+(drawer?'<div id="'+drawerId+'" class="shortcut-drawer shortcut-configuration"'+(pinned(id)?'':' hidden')+'><div class="shortcut-drawer-body">'+drawer+'</div></div>':'')+'</div>';
 }).join('');
 return '<fieldset class="settings-group shortcut-chooser" data-shortcut-chooser="'+scope+'"><legend>Optional App Shortcuts</legend><div class="shortcut-choices">'+choices+'</div><p id="'+scope+'-shortcuts-error" class="error" role="alert" hidden></p>'+(saveButton?'<button id="save-app-shortcuts" type="button" class="primary full">Save shortcuts</button><p id="'+scope+'-shortcuts-status" class="small" role="status" aria-live="polite"></p>':'')+'</fieldset>';
}
function readShortcutChooser(scope){
 const host=shortcutHost(scope);
 return{pinned:$$('[data-app-pin]:checked',host).map(input=>input.dataset.appPin),taxiProvider:ui.getChoice(scope+'-taxi-provider')||'',taxiNumber:$('#'+scope+'-taxi-number').value,phoneMode:ui.getChoice(scope+'-phone-mode')||'dial',phoneNumber:$('#'+scope+'-phone-speed-number').value};
}
function clearShortcutErrors(scope){
 const host=shortcutHost(scope);if(!host)return;
 $('#'+scope+'-shortcuts-error').hidden=true;
 $$('[aria-invalid]',host).forEach(input=>input.removeAttribute('aria-invalid'));
}
function showShortcutConfiguration(scope,animate=true){
 const host=shortcutHost(scope);if(!host)return;
 const pinned=id=>$('[data-app-pin="'+id+'"]',host).checked;
 for(const id of ['taxi','phone']){
  const trigger=$('[data-app-pin="'+id+'"]',host);
  ui.setDrawer($('#'+scope+'-'+id+'-drawer'),pinned(id),{animate,trigger});
 }
 ui.setDrawer($('#'+scope+'-taxi-custom-drawer'),ui.getChoice(scope+'-taxi-provider')==='other',{animate,trigger:$('#'+scope+'-taxi-provider input:checked')});
 ui.setDrawer($('#'+scope+'-phone-speed-drawer'),ui.getChoice(scope+'-phone-mode')==='speed',{animate,trigger:$('#'+scope+'-phone-mode input:checked')});
}
function renderShortcutSettings(){
 $('#app-shortcuts-settings').innerHTML=shortcutChooserMarkup('access',profile.appShortcuts,true);
 ui.initializeChoiceGroups?.($('#app-shortcuts-settings'));
 showShortcutConfiguration('access',false);
}
function shortcutError(scope,field,message){
 const group=$('#'+scope+'-'+field),input=group.matches('input')?group:group.querySelector('input');
 group.setAttribute('aria-invalid','true');
 $('#'+scope+'-shortcuts-error').textContent=message;$('#'+scope+'-shortcuts-error').hidden=false;
 input?.focus();
}
function validateShortcutChooser(scope,s){
 clearShortcutErrors(scope);
 if(s.pinned.includes('taxi')){
  if(!s.taxiProvider){shortcutError(scope,'taxi-provider','Choose your taxi company or Other number.');return false;}
  if(!taxiNumber(s)){shortcutError(scope,'taxi-number','Enter a valid taxi phone number.');return false;}
 }
 if(s.pinned.includes('phone')&&s.phoneMode==='speed'&&!phoneNumber(s.phoneNumber)){shortcutError(scope,'phone-speed-number','Enter a valid speed-dial number.');return false;}
 return true;
}
document.addEventListener('change',e=>{
 const host=e.target.closest('[data-shortcut-chooser]');if(!host)return;
 const scope=host.dataset.shortcutChooser;clearShortcutErrors(scope);
 const status=$('#'+scope+'-shortcuts-status');if(status)status.textContent='';
 showShortcutConfiguration(scope);
 if(scope==='setup'&&draft)draft.appShortcuts=readShortcutChooser(scope);
});
document.addEventListener('input',e=>{
 const host=e.target.closest('[data-shortcut-chooser]');if(!host)return;
 const scope=host.dataset.shortcutChooser;clearShortcutErrors(scope);
 if(scope==='setup'&&draft)draft.appShortcuts=readShortcutChooser(scope);
});
$('#app-shortcuts-settings').addEventListener('click',e=>{
 if(!e.target.closest('#save-app-shortcuts'))return;
 const s=readShortcutChooser('access');if(!validateShortcutChooser('access',s))return;
 profile.appShortcuts=cleanShortcuts(s);persist();renderDock();
 $('#access-shortcuts-status').textContent=s.pinned.length?'Your app shortcuts are ready.':'App shortcuts are hidden.';
});
function shortcutsMarkup(s){
 if(!s.pinned.length)return '';
 return '<section class="app-shortcuts-bar" role="group" aria-label="App shortcuts"><div class="app-shortcut-links" style="--shortcut-count:'+s.pinned.length+'">'+s.pinned.map(id=>{
  const app=appOptions[id],image=id==='taxi'?taxiProviders[s.taxiProvider]?.image:app.image;
  const artwork=image?'<img class="shortcut-logo shortcut-logo-'+id+'" src="vendor/shortcuts/'+image+'" alt="">':'<span class="shortcut-symbol" aria-hidden="true">'+icon(app.icon)+'</span>';
  const label=id==='taxi'?taxiProviders[s.taxiProvider]?.label||'Taxi':app.label;
  if(id==='phone'&&s.phoneMode==='dial')return '<button type="button" class="app-shortcut" data-app-shortcut="phone" aria-label="Phone: enter a number">'+artwork+'</button>';
  const href=id==='taxi'?'tel:'+taxiNumber(s):id==='phone'?'tel:'+s.phoneNumber:app.href;
  const name=id==='taxi'?'Call '+label:id==='phone'?'Call my saved number':'Open '+app.label;
  return '<a class="app-shortcut" href="'+esc(href)+'" aria-label="'+esc(name)+'">'+artwork+'</a>';
 }).join('')+'</div></section>';
}
$('#support-dock').addEventListener('click',e=>{
 const button=e.target.closest('[data-app-shortcut="phone"]');if(!button)return;
 $('#phone-shortcut-form').reset();$('#phone-dial-error').hidden=true;$('#phone-dial-number').removeAttribute('aria-invalid');
 api.openDialog($('#phone-shortcut-dialog'),button);$('#phone-dial-number').focus();
});
$('#phone-shortcut-form').onsubmit=e=>{
 e.preventDefault();const input=$('#phone-dial-number'),number=phoneNumber(input.value);
 if(!number){input.setAttribute('aria-invalid','true');$('#phone-dial-error').hidden=false;input.focus();return;}
 input.removeAttribute('aria-invalid');$('#phone-dial-error').hidden=true;window.location.href='tel:'+number;
};
$('#phone-dial-number').oninput=()=>{$('#phone-dial-number').removeAttribute('aria-invalid');$('#phone-dial-error').hidden=true;};
$('#phone-shortcut-dialog').addEventListener('close',()=>$('#phone-shortcut-form').reset());

const SETUP_STEPS=['welcome','needs','tools','shortcuts','browse','review'];
function fresh(){return{version:2,complete:false,appShortcuts:emptyShortcuts(),needs:[],tools:['communicate','read'],speech:'ask',dock:'dock',browse:'grid',swipe:false,shakeWanted:false,card:'Please give me time to respond. I can use this card to communicate.',remember:false,settings:{...api.getSettings(),mapless:true,motion:true}};}
function clean(p){const out=fresh();if(!p||p.version!==2)return out;out.complete=p.complete===true;out.appShortcuts=cleanShortcuts(p.appShortcuts);out.needs=Array.isArray(p.needs)?p.needs.filter(x=>needOptions.some(n=>n.id===x)):[];out.tools=Array.isArray(p.tools)?[...new Set(p.tools.filter(x=>toolOptions[x]))]:out.tools;for(const [key,allowed] of Object.entries({speech:['off','ask','screens'],dock:['dock','floating'],browse:['grid','single','list']}))if(allowed.includes(p[key]))out[key]=p[key];for(const k of ['swipe','shakeWanted','remember'])out[k]=p[k]===true;if(typeof p.card==='string'&&p.card.trim())out.card=p.card.trim().slice(0,500);if(p.settings&&typeof p.settings==='object')out.settings={...api.getSettings(),...p.settings,remember:out.remember};out.settings=api.normaliseSettings(out.settings);if(out.speech==='screens'&&!out.tools.includes('read'))out.tools.push('read');return out;}
let profile=fresh();try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored?.remember&&stored.complete)profile=clean(stored);}catch{}
let setupMode='full',setupReturnView=['explore','journey'].includes(api.getView())?api.getView():'explore';
let draft=null,step=0,voiceUnlocked=false,categoryIndex=0,selectedCategory=null,toolsInvoker=null,dockKey='',motionEnabled=false,motionListening=false,motionPrevious=null,lastShake=0,lastPeak=0,peaks=0,swipeStart=null,suppressUntil=0,navigationHidden=false;
function current(){return api.getView()==='setup'&&draft?draft:profile;}
function persist(){profile.settings=api.getSettings();try{if(profile.remember&&profile.complete)localStorage.setItem(KEY,JSON.stringify(profile));else localStorage.removeItem(KEY);return true;}catch{api.announce('Your setup works for this visit, but this browser could not save it.');return false;}}
function syncSettings(){const s=api.getSettings();ui.setChoice('quick-text-size',s.textSize);ui.setChoice('quick-theme',s.theme);$('#setup-text-label').textContent=api.getTextScale(s).buttonLabel;$('#setup-dyslexic').setAttribute('aria-pressed',String(s.dyslexicFont));}
function applyProfile(){api.setSettings({...profile.settings,remember:profile.remember});profile.settings=api.getSettings();api.setMapVisible(!profile.settings.mapless);renderDock();renderCatalog();renderSummary();updateMotionUI();}
function renderSummary(){const labels=profile.tools.map(k=>toolOptions[k].label);$('#my-setup-summary').textContent=profile.complete?`${labels.length?labels.join(' · '):'Tools available in Access settings'} · ${profile.browse==='single'?'one choice at a time':profile.browse==='list'?'list choices':'large tiles'}${profile.speech==='screens'?' · spoken screens':''}.`:'Set up the app for the support you want.';}
function setupIntro(){if(setupMode==='shortcuts')return 'Choose optional tool and app shortcuts. Taxi and Phone can be configured directly below their choices. Save your choices or go back.';return ['Make this work for you. Choose the support you want. You can change it later.','What would help? Choose as many options as you like. You do not need to tell us a diagnosis.','Keep useful tools close. Choose a communication card, reading, text controls or a quiet screen.','Choose app shortcuts. Pin the apps you use, or leave every app off. Taxi and Phone can be configured here.','Choose how to browse. Large tiles, one choice at a time, or a list. Swiping and shaking are optional.','Your setup is ready. Check your choices. You can choose whether this browser remembers them.'][step];}
function sayScreen(view){if(!voiceUnlocked||document.hidden||$('dialog[open]'))return;const p=current();if(p.speech!=='screens')return;const messages={explore:'Find a place. Choose toilets, public transport, shops, food and drink, a place to rest, a quieter place, drinking water, or things to do. All places are mock examples.',journey:'Plan a sample visit. Describe a starting place and destination. The app does not look up these places or calculate real routes.',access:'Access settings. Change your setup, tools, text size, contrast and other preferences.',help:'Help. You can use a communication card, take a quiet moment, and read about browser and native app capabilities.',platform:'Browser or native app guide. Compare a browser tab, installed web app, iPhone app or Android app. No permissions are requested on this page.',setup:setupIntro()};api.speak(messages[view]||'Access Adelaide');}
function unlockVoice(){voiceUnlocked=true;renderVoiceStart();api.speak(api.getView()==='setup'?setupIntro():api.mainText());}
function renderVoiceStart(){const p=current();$('#voice-start').hidden=p.speech!=='screens'||voiceUnlocked;}
function openCard(trigger){toolsInvoker=trigger||document.activeElement;$('#quick-card-text').textContent=current().card;$('#quick-card-editor').value=current().card;$('#quick-card-edit').hidden=true;$('#edit-quick-card').hidden=false;$('#quick-card-error').hidden=true;api.openDialog($('#quick-card-dialog'),toolsInvoker);}
function openDisplay(trigger){syncSettings();api.openDialog($('#quick-display-dialog'),trigger||document.activeElement);}
function doTool(name,trigger){if(name==='communicate')openCard(trigger);if(name==='text')openDisplay(trigger);if(name==='quiet'){api.stopSpeech();api.openDialog($('#quiet-dialog'),trigger||document.activeElement);}if(name==='read'){voiceUnlocked=true;renderVoiceStart();api.speak(api.getView()==='setup'?setupIntro():api.mainText());}}
function openTools(trigger){toolsInvoker=trigger||document.activeElement;const p=current();$('#tools-menu').innerHTML=Object.entries(toolOptions).map(([key,t])=>`<button class="tool-menu-button" type="button" data-menu-tool="${key}"><span aria-hidden="true">${icon(t.icon)}</span><span><strong>${t.label}</strong><span class="sub">${t.text}${p.tools.includes(key)?' · chosen tool':''}</span></span></button>`).join('')+`<div class="motion-card"><h3>Optional shake control</h3><p class="small">Shake cycles one-at-a-time choices. It never confirms a choice or grants permission.</p><button type="button" id="tools-motion" class="secondary full">${motionEnabled?'Turn shake off':'Enable optional shake'}</button><p id="tools-motion-status" class="small" role="status"></p></div>`;$('#tools-menu').insertAdjacentHTML('beforeend','<button type="button" id="toggle-spoken-screens" class="secondary full">'+(p.speech==='screens'?'Pause spoken screens':'Read each new screen')+'</button><button type="button" id="tools-map-settings" class="secondary full">Map & imagery settings</button>');api.openDialog($('#tools-dialog'),toolsInvoker);$('#toggle-spoken-screens').onclick=()=>{const target=current();target.speech=target.speech==='screens'?'ask':'screens';if(target.speech==='screens'&&!target.tools.includes('read'))target.tools.push('read');if(target===profile)persist();renderDock();$('#toggle-spoken-screens').textContent=target.speech==='screens'?'Pause spoken screens':'Read each new screen';if(target.speech==='screens'){voiceUnlocked=true;api.speak('Spoken screens are on. You can stop the current reading, or pause spoken screens in Tools.');}else{api.stopSpeech();api.announce('Spoken screen introductions paused. Read page still works when you ask.');}};$('#tools-map-settings').onclick=()=>{const focusMap=()=>{$('#map-settings').scrollIntoView({block:'start',behavior:'instant'});($('#basemap-choice input:checked')||$('#basemap-choice input')).focus({preventScroll:true});};if(api.getView()==='access'){$('#tools-dialog').addEventListener('close',focusMap,{once:true});$('#tools-dialog').close();}else{const onView=e=>{if(e.detail.view==='access'){document.removeEventListener('accessadelaide:view',onView);focusMap();}};document.addEventListener('accessadelaide:view',onView);$('#tools-dialog').close();location.hash='access';}};$('#tools-motion').onclick=()=>motionEnabled?disableMotion():enableMotion();updateMotionUI();}
function syncNavigation(){
 const hidden=api.getView()==='setup'||navigationHidden;
 $('#bottom-nav').hidden=hidden;$('.skip.second').hidden=hidden;
 $('.bottom-stack').classList.toggle('navigation-hidden',hidden&&!$('#support-dock').hidden);
 const toggle=$('[data-dock-tool="navigation"]');
 if(toggle){
  toggle.setAttribute('aria-expanded',String(!hidden));
  toggle.setAttribute('aria-label',hidden?'Show navigation':'Hide navigation');
  $('[data-navigation-icon]',toggle).innerHTML=icon(hidden?'chevron-up':'chevron-down');
 }
}
function layoutAccessToolbar(){
 const host=$('#support-dock'),row=$('.access-tool-row',host);if(host.hidden||!row)return;
 const tools=$$('[data-dock-tool]:not([data-dock-tool="navigation"])',row),nav=$('[data-dock-tool="navigation"]',row);
 const settings=api.getSettings(),minimum=settings.targets?60:48,gap=8;
 const width=row.clientWidth,available=Math.max(minimum,width-(nav?minimum+gap:0));
 let desired=minimum;
 if(settings.buttonDisplay!=='icons'){
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
  for(const button of tools){
   const label=$('.dock-tool-label',button),style=getComputedStyle(label);
   if(context)context.font=style.font;
   const spacing=parseFloat(style.letterSpacing)||0;
   for(const word of label.textContent.split(/\s+/)){
    const measured=context?context.measureText(word).width:word.length*parseFloat(style.fontSize)*.65;
    desired=Math.max(desired,Math.ceil(measured+spacing*Math.max(0,word.length-1)+24));
   }
  }
 }
 const cols=Math.max(1,Math.min(tools.length||1,Math.floor((available+gap)/(desired+gap))||1)),rows=Math.max(1,Math.ceil(tools.length/cols));
 row.style.setProperty('--tool-columns',String(cols));row.style.setProperty('--toolbar-target',minimum+'px');
 row.dataset.empty=String(!tools.length);row.dataset.navigation=String(Boolean(nav));
 tools.forEach((button,i)=>{button.style.gridColumn=String(i%cols+1);button.style.gridRow=String(Math.floor(i/cols)+1);});
 if(nav){nav.style.gridColumn=String(cols+1);nav.style.gridRow='1 / span '+rows;}
}
function renderDock(){
 const p=current(),canToggle=api.getView()!=='setup',always=p.dock==='floating'?p.tools.filter(k=>['communicate','read'].includes(k)):p.tools;
 const hasSelections=always.length>0||(canToggle&&p.appShortcuts.pinned.length>0);
 const show=hasSelections&&(canToggle||step>0);
 if(!hasSelections)navigationHidden=false;
 const key=always.join(',')+'|'+p.dock+'|'+show+'|'+canToggle+'|'+JSON.stringify(p.appShortcuts),host=$('#support-dock');host.hidden=!show;
 if(key!==dockKey){
  dockKey=key;const previousButtons=new Map($$('[data-dock-tool]',host).map(b=>[b.dataset.dockTool,b]));
  host.dataset.mode=p.dock;
  host.innerHTML='<div class="access-tool-row">'+always.map(k=>`<button type="button" data-dock-tool="${k}" aria-label="${toolOptions[k].label}"><span class="tool-button-content"><span class="tool-icon" aria-hidden="true">${icon(toolOptions[k].icon)}</span><span class="dock-tool-label">${toolOptions[k].label}</span></span></button>`).join('')+(canToggle?'<button class="navigation-toggle" type="button" data-dock-tool="navigation" aria-controls="bottom-nav" aria-expanded="true" aria-label="Hide navigation"><span class="tool-button-content"><span class="tool-icon navigation-icon" data-navigation-icon aria-hidden="true"></span></span></button>':'')+'</div>'+(canToggle?shortcutsMarkup(p.appShortcuts):'');
  $$('[data-dock-tool]',host).forEach(b=>{const old=previousButtons.get(b.dataset.dockTool);if(old)b.replaceWith(old);});
 }
 syncNavigation();renderVoiceStart();requestAnimationFrame(layoutAccessToolbar);
}
if(typeof ResizeObserver==='function')new ResizeObserver(layoutAccessToolbar).observe($('#support-dock'));
window.addEventListener('resize',layoutAccessToolbar);
document.fonts?.ready.then(layoutAccessToolbar);
document.fonts?.addEventListener('loadingdone',layoutAccessToolbar);
$('#support-dock').addEventListener('click',e=>{const b=e.target.closest('[data-dock-tool]');if(!b)return;if(b.dataset.dockTool==='navigation'){if(api.getView()==='setup')return;navigationHidden=!navigationHidden;syncNavigation();api.announce(navigationHidden?'Navigation hidden. Use Show navigation to reveal it.':'Navigation shown.');return;}b.dataset.dockTool==='tools'?openTools(b):doTool(b.dataset.dockTool,b);});
$('#tools-menu').addEventListener('click',e=>{const b=e.target.closest('[data-menu-tool]');if(!b)return;const trigger=toolsInvoker;$('#tools-dialog').close();doTool(b.dataset.menuTool,trigger);});
$('#edit-tools').onclick=e=>openTools(e.currentTarget);
$('#tools-setup-link').onclick=$('#tools-guide-link').onclick=()=>$('#tools-dialog').close();
$('#start-voice').onclick=unlockVoice;
$('#setup-hear').onclick=unlockVoice;
$('#setup-smaller').onclick=()=>{api.setSettings({textSize:api.getTextScale().nextSize});if(draft){draft.settings=api.getSettings();draft.baseSettings={...draft.settings};}api.announce(`Text size ${api.getSettings().textSize} percent.`);};
$('#setup-contrast').onclick=()=>{const theme=api.getSettings().theme==='contrast'?'light':'contrast';api.setSettings({theme});if(draft){draft.settings=api.getSettings();draft.baseSettings={...draft.settings};}api.announce(`Colour theme ${theme}.`);};
$('#setup-communicate').onclick=e=>openCard(e.currentTarget);
$('#setup-dyslexic').onclick=()=>{const dyslexicFont=!api.getSettings().dyslexicFont;api.setSettings({dyslexicFont});if(draft){draft.settings=api.getSettings();draft.baseSettings={...draft.settings};}api.announce(dyslexicFont?'Dyslexic font on.':'Dyslexic font off.');};
$('#quick-text-size').addEventListener('change',()=>api.setSettings({textSize:ui.getChoice('quick-text-size')}));$('#quick-theme').addEventListener('change',()=>api.setSettings({theme:ui.getChoice('quick-theme')}));
$('#edit-quick-card').onclick=()=>{$('#quick-card-edit').hidden=false;$('#edit-quick-card').hidden=true;$('#quick-card-editor').focus();};
$('#save-quick-card').onclick=()=>{const t=$('#quick-card-editor').value.trim();if(!t){$('#quick-card-error').hidden=false;$('#quick-card-editor').setAttribute('aria-invalid','true');$('#quick-card-editor').focus();return;}const p=current();p.card=t;p===profile?persist():null;$('#quick-card-text').textContent=t;$('#quick-card-edit').hidden=true;$('#quick-card-editor').removeAttribute('aria-invalid');$('#edit-quick-card').hidden=false;$('#edit-quick-card').focus();$('#communication').value=t;api.announce('Your message card is ready.');};
$('#speak-quick-card').onclick=()=>{spokenDialog='quick-card-dialog';voiceUnlocked=true;api.speak(current().card);};$('#stop-quick-card').onclick=()=>api.stopSpeech();
function beginDraft(){setupMode='full';draft=clean({...profile,settings:api.getSettings()});draft.baseSettings={...api.getSettings()};step=0;renderSetup(false);}
function choiceCards(){return needOptions.map(n=>`<label class="need-card"><input type="checkbox" value="${n.id}" data-need ${draft.needs.includes(n.id)?'checked':''}><span class="need-icon" aria-hidden="true">${icon(n.icon)}</span><span><strong>${n.label}</strong><span class="sub">${n.text}</span></span></label>`).join('');}
function setupReturnLabel(){return setupReturnView==='journey'?'Journey Mapping':'Explore Adelaide';}
function toolShortcutChooserMarkup(){return '<fieldset class="settings-group setup-tool-choices"><legend>Optional Tool Shortcuts</legend>'+Object.entries(toolOptions).map(([key,tool])=>'<label class="check-row"><input type="checkbox" data-setup-tool="'+key+'"'+(draft.tools.includes(key)?' checked':'')+'><span><strong>'+esc(tool.label)+'</strong><span class="sub">'+esc(tool.text)+'</span></span></label>').join('')+'</fieldset>';}
function startShortcutsOnly(){
 setupMode='shortcuts';draft=clean({...profile,settings:api.getSettings()});draft.baseSettings={...api.getSettings()};step=3;renderShortcutsOnly();
}
function renderShortcutsOnly(focus=true){
 $('.setup-quick').hidden=true;$('.setup-top').hidden=true;$('#setup-progress').textContent='';
 $('#setup-title').innerHTML='Set up my<br><span>shortcuts.</span>';
 $('#setup-content').innerHTML=toolShortcutChooserMarkup()+shortcutChooserMarkup('setup',draft.appShortcuts)+'<label class="check-row"><input id="setup-remember" type="checkbox"'+(draft.remember?' checked':'')+'><span>Remember my choices on this device<span class="sub">Leave off on a shared phone.</span></span></label>';
 $('#setup-actions').innerHTML='<button type="button" id="setup-back" class="secondary">Back</button><button type="button" id="setup-save-shortcuts" class="primary">Save shortcuts</button>';
 ui.initializeChoiceGroups?.($('#setup-content'));showShortcutConfiguration('setup',false);
 $('#setup-back').onclick=()=>{setupMode='full';draft=clean({...profile,settings:api.getSettings()});draft.baseSettings={...api.getSettings()};step=0;renderSetup();};
 $('#setup-save-shortcuts').onclick=()=>{
  const shortcuts=readShortcutChooser('setup');if(!validateShortcutChooser('setup',shortcuts))return;
  profile=clean({...profile,tools:[...draft.tools],appShortcuts:cleanShortcuts(shortcuts),remember:$('#setup-remember').checked,complete:true,settings:api.getSettings()});
  profile.settings={...api.getSettings(),remember:profile.remember};applyProfile();persist();draft=null;setupMode='full';location.hash=setupReturnView;
 };
 renderDock();if(focus){$('#setup-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}sayScreen('setup');
}
function validateDraftShortcuts(){
 const shortcuts=draft.appShortcuts;
 const invalid=shortcuts.pinned.includes('taxi')&&!taxiNumber(shortcuts)||shortcuts.pinned.includes('phone')&&shortcuts.phoneMode==='speed'&&!phoneNumber(shortcuts.phoneNumber);
 if(invalid){step=3;renderSetup();validateShortcutChooser('setup',shortcuts);return false;}
 draft.appShortcuts=cleanShortcuts(shortcuts);return true;
}
function renderSetup(focus=true){if(!draft)beginDraft();if(setupMode==='shortcuts'){renderShortcutsOnly(focus);return;}$('.setup-quick').hidden=false;$('#setup-next',$('.setup-quick'))?.remove();const titles=['Make this<br><span>work for you.</span>','What would<br><span>help?</span>','Keep your<br><span>tools close.</span>','Choose your<br><span>app shortcuts.</span>','Choose your<br><span>way.</span>','Ready to<br><span>explore.</span>'];$('#setup-title').innerHTML=titles[step];$('.setup-top').hidden=step===0;$('#setup-progress').textContent=step===0?'':`Step ${step} of ${SETUP_STEPS.length-1}`;
 let body='';
 if(step===0)body='<p class="setup-prompt">We can make the app easier to see, hear and use.</p><p>Choose what would help. You can change it at any time.</p>';
 if(step===1)body='<p class="setup-prompt">Choose as many as you like.</p><p class="small">You do not need to tell us a diagnosis.</p><fieldset class="needs-fieldset"><legend class="sr-only">Support I would like</legend>'+choiceCards()+'</fieldset>';
 if(step===2)body=`<p class="setup-prompt">These are your suggested tools. Change any of them.</p><fieldset class="setup-tool-choices"><legend>Keep these tools close</legend>${Object.entries(toolOptions).map(([k,t])=>`<label class="check-row"><input type="checkbox" data-setup-tool="${k}" ${draft.tools.includes(k)?'checked':''}><span><strong>${t.label}</strong><span class="sub">${t.text}</span></span></label>`).join('')}</fieldset>${ui.choiceMarkup({id:'setup-speech',label:'Spoken information',value:draft.speech,options:[{value:'off',label:'Keep automatic sound off'},{value:'ask',label:'Read only when I ask'},{value:'screens',label:'Read each new screen'}]}).replace('class="choice-group"','class="choice-group setup-spoken-frame"')}<fieldset class="settings-group setup-message-frame"><legend>Message Card</legend><textarea id="setup-card" maxlength="500" rows="4" aria-label="Message Card text">${esc(draft.card)}</textarea></fieldset>`;
 if(step===3)body=shortcutChooserMarkup('setup',draft.appShortcuts);
 if(step===4)body=`<p class="setup-prompt">Choose how to move through categories.</p><fieldset><legend>My browsing style</legend>${[['grid','Large tiles','See several choices together.'],['single','One choice at a time','Use large previous and next buttons.'],['list','A simple list','Read choices in one column.']].map(([v,t,d])=>`<label class="radio-card"><input type="radio" name="browse-mode" value="${v}" ${draft.browse===v?'checked':''}><span><strong>${t}</strong><span class="sub">${d}</span></span></label>`).join('')}</fieldset><fieldset class="settings-group setup-button-options"><legend>Buttons &amp; shortcuts</legend><label class="radio-card"><input type="radio" name="setup-button-display" value="labels" ${api.getSettings().buttonDisplay!=='icons'?'checked':''}><span><strong>Icons and labels</strong></span></label><label class="radio-card"><input type="radio" name="setup-button-display" value="icons" ${api.getSettings().buttonDisplay==='icons'?'checked':''}><span><strong>Icons only</strong></span></label><label class="check-row"><input type="checkbox" id="setup-long-press" ${api.getSettings().longPressTips?'checked':''}><span>Long press for a short button tip</span></label></fieldset><fieldset class="settings-group setup-gesture-frame"><legend>Optional Gesture Controls</legend><label class="check-row"><input type="checkbox" id="setup-swipe" ${draft.swipe?'checked':''}><span>Offer optional left/right swipes<span class="sub">Only for one-at-a-time choices. Buttons remain available.</span></span></label><div class="setup-gesture-shake"><h2>Optional shake control</h2><p class="small">A shake moves to the next one-at-a-time category. It never selects a place or confirms anything.</p><button type="button" id="setup-motion" class="secondary full">${motionEnabled?'Turn shake off':'Enable optional shake'}</button><p id="setup-motion-status" class="small" role="status"></p></div><p class="small">Voice Control, Voice Access and switch input can also operate the app’s labelled buttons. Set those up in your phone’s accessibility settings.</p></fieldset>`;
 if(step===5){const t=draft.tools.map(k=>toolOptions[k].label);body=`<p class="setup-prompt">You are in control. You can come back and change these choices.</p><fieldset class="settings-group setup-choices-summary"><legend>My Choices</legend><dl class="setup-review"><dt>My tools</dt><dd>${esc(t.join(', ')||'Tools available in Access settings')}</dd><dt>App Shortcuts</dt><dd>${esc(draft.appShortcuts.pinned.map(id=>appOptions[id].label).join(', ')||'None selected')}</dd><dt>Spoken information</dt><dd>${{off:'Automatic sound off',ask:'Only when I ask',screens:'Read each new screen'}[draft.speech]}</dd><dt>Browsing</dt><dd>${{grid:'Large tiles',single:'One choice at a time',list:'Simple list'}[draft.browse]}</dd><dt>Reading</dt><dd>${api.getSettings().textSize}% text · ${esc(api.getSettings().theme)} theme</dd><dt>Tool position</dt><dd>${draft.dock==='dock'?'Bottom tool dock':'Compact floating tray, inside this app'}</dd></dl><label class="check-row"><input type="checkbox" id="setup-remember" ${draft.remember?'checked':''}><span>Remember my setup on this device<span class="sub">Saves my choices and card text in this browser. Leave off on a shared phone.</span></span></label></fieldset>`;}
 $('#setup-content').innerHTML=body;$('#setup-actions').innerHTML=step===0?'<button type="button" id="setup-next" class="primary full setup-start"><span data-icon="sliders" aria-hidden="true">'+icon('sliders')+'</span><span>Set up my app and shortcuts</span></button><button type="button" id="setup-shortcuts-only" class="secondary full"><span data-icon="grid" aria-hidden="true">'+icon('grid')+'</span><span>Set up my shortcuts only</span></button><button type="button" id="setup-skip" class="secondary full"><span data-icon="phone" aria-hidden="true">'+icon('phone')+'</span><span>Use my phone&#39;s settings</span></button>':`<button type="button" id="setup-back" class="secondary">Back</button><button type="button" id="setup-next" class="primary">${step===SETUP_STEPS.length-1?setupReturnLabel():'Continue'}</button>${step===SETUP_STEPS.length-1?'':'<button type="button" id="setup-done" class="secondary">Done</button>'}`;

 $('#setup-next').onclick=nextStep;if($('#setup-done'))$('#setup-done').onclick=finishSetup;if($('#setup-back'))$('#setup-back').onclick=()=>{collectDraft();step--;renderSetup();};if($('#setup-skip'))$('#setup-skip').onclick=skipSetup;if($('#setup-shortcuts-only'))$('#setup-shortcuts-only').onclick=startShortcutsOnly;
 if(step===2)ui.setChoice('setup-speech',draft.speech);
 if(step===3){ui.initializeChoiceGroups?.($('#setup-content'));showShortcutConfiguration('setup',false);}
 if(step===4){$('#setup-motion').onclick=()=>motionEnabled?disableMotion():enableMotion();updateMotionUI();}
 renderDock();if(focus){$('#setup-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}sayScreen('setup');}
function collectDraft(){
 if(step===2){draft.speech=ui.getChoice('setup-speech');draft.card=$('#setup-card').value.trim()||draft.card;if(draft.speech==='screens'&&!draft.tools.includes('read'))draft.tools.push('read');}
 if(step===3)draft.appShortcuts=readShortcutChooser('setup');
 if(step===4){draft.browse=$('input[name="browse-mode"]:checked').value;draft.swipe=$('#setup-swipe').checked;api.setSettings({buttonDisplay:$('input[name="setup-button-display"]:checked').value,longPressTips:$('#setup-long-press').checked});}
 if(step===5)draft.remember=$('#setup-remember').checked;
 draft.settings=api.getSettings();
}
function finishSetup(){
 collectDraft();
 if(!validateDraftShortcuts())return;
 profile=clean({...draft,complete:true,version:2});
 profile.settings={...api.getSettings(),remember:profile.remember};
 applyProfile();persist();draft=null;setupMode='full';
 location.hash=setupReturnView;
}
function nextStep(){
 if(step===SETUP_STEPS.length-1){finishSetup();return;}
 collectDraft();
 if(step===3){if(!validateShortcutChooser('setup',draft.appShortcuts))return;draft.appShortcuts=cleanShortcuts(draft.appShortcuts);}
 if(step===2&&draft.speech==='screens')voiceUnlocked=true;
 step++;renderSetup();
}
function skipSetup(){profile=clean({...fresh(),complete:true,tools:[],settings:{...api.getSettings(),textSize:'100',theme:'light',mapless:true}});profile.remember=false;categoryIndex=0;selectedCategory=null;api.filterLayers(Object.keys(window.ACCESS_DEMO.layers));$('#explore-results-title').textContent='Mock places';applyProfile();persist();draft=null;setupMode='full';setupReturnView='explore';location.hash='explore';}
$('#setup-content').addEventListener('change',e=>{if(!draft)return;if(e.target.matches('[data-need]')){draft.needs=$$('[data-need]:checked').map(c=>c.value);const n=new Set(draft.needs),s={...draft.baseSettings,mapless:true,motion:true};const tools=new Set();if(n.has('seeing')){s.textSize=api.getTextScale(s).maxSize;s.theme='contrast';s.targets=true;tools.add('text');tools.add('read');}if(n.has('reading'))tools.add('read');if(n.has('communicating')||n.has('visual'))tools.add('communicate');if(n.has('touch')){s.targets=true;draft.browse='single';tools.add('text');}if(n.has('calm')){s.simple=true;s.spacing=true;tools.add('quiet');}draft.speech=n.has('visual')?'off':n.has('reading')||n.has('seeing')?'screens':'ask';draft.tools=[...tools];api.setSettings(s);draft.settings=api.getSettings();renderDock();}if(e.target.matches('[data-setup-tool]')){draft.tools=$$('[data-setup-tool]:checked').map(c=>c.dataset.setupTool);renderDock();}if(e.target.closest('#setup-speech')){draft.speech=ui.getChoice('setup-speech');if(draft.speech==='screens'&&!draft.tools.includes('read')){draft.tools.push('read');$('[data-setup-tool="read"]').checked=true;}renderDock();}if(e.target.name==='setup-button-display'||e.target.id==='setup-long-press'){api.setSettings({buttonDisplay:$('input[name="setup-button-display"]:checked').value,longPressTips:$('#setup-long-press').checked});draft.settings=api.getSettings();draft.baseSettings={...draft.settings};}});
function categoryButton(c,index,mode){return `<button type="button" class="category-choice" aria-label="${c.name}" data-category="${c.id}" ${selectedCategory===c.id?'aria-pressed="true"':'aria-pressed="false"'}><span class="category-icon" aria-hidden="true">${icon(c.icon)}</span><span><strong>${c.name}</strong><span class="sub">${c.description}</span></span></button>`;}
function renderCatalog(){const p=profile;const host=$('#category-browser');const mode=p.browse;let content='';if(mode==='single'){const c=categories[categoryIndex];content=`<div class="single-choice" id="single-choice">${categoryButton(c,categoryIndex,mode)}</div><p id="category-position" class="small">Choice ${categoryIndex+1} of ${categories.length}</p><div class="category-cycle"><button type="button" id="category-previous" class="secondary">← Previous</button><button type="button" id="category-next" class="primary">Next →</button></div><p class="small">${p.swipe?'You can also swipe left or right. ':''}${motionEnabled?'Shake control is on. ':''}Tap the category to see mock places.</p>`;}else content=`<div class="category-${mode}">${categories.map((c,i)=>categoryButton(c,i,mode)).join('')}</div>`;
 host.innerHTML=`<fieldset class="browse-styles"><legend>How would you like to browse?</legend><div class="browse-buttons" role="group" aria-label="Category browsing style">${[['grid','Tiles'],['single','One at a time'],['list','List choices']].map(([v,l])=>`<button type="button" data-browse="${v}" aria-pressed="${mode===v}">${l}</button>`).join('')}</div></fieldset>${content}<p id="catalog-status" class="small" role="status" aria-live="polite">${selectedCategory?categories.find(c=>c.id===selectedCategory).name+' selected.':''}</p>`;
 if(mode==='single'){$('#category-previous').onclick=()=>cycle(-1);$('#category-next').onclick=()=>cycle(1);}
}
function cycle(direction){categoryIndex=(categoryIndex+direction+categories.length)%categories.length;const focusId=document.activeElement?.id;renderCatalog();if(focusId&&$('#'+focusId))$('#'+focusId).focus({preventScroll:true});$('#catalog-status').textContent=`Choice ${categoryIndex+1} of ${categories.length}: ${categories[categoryIndex].name}.`;if(profile.speech==='screens'&&voiceUnlocked)api.speak(`${categories[categoryIndex].name}. Choice ${categoryIndex+1} of ${categories.length}. Tap to open, or move to the next choice.`);}
$('#category-browser').addEventListener('click',e=>{if(Date.now()<suppressUntil&&e.target.closest('.single-choice')){e.preventDefault();return;}const mode=e.target.closest('[data-browse]');if(mode){profile.browse=mode.dataset.browse;persist();renderCatalog();$(`[data-browse="${profile.browse}"]`).focus({preventScroll:true});api.announce(`Browsing style: ${profile.browse==='single'?'one choice at a time':profile.browse}.`);return;}const b=e.target.closest('[data-category]');if(!b)return;const c=categories.find(c=>c.id===b.dataset.category);const clear=selectedCategory===c.id;selectedCategory=clear?null:c.id;categoryIndex=categories.indexOf(c);api.filterLayers(clear?Object.keys(window.ACCESS_DEMO.layers):c.layers);$('#explore-results-title').textContent=clear?'Mock places':c.name+' · mock places';renderCatalog();$('#explore-results-title').focus();$('#explore-results-title').scrollIntoView({block:'start',behavior:'instant'});api.announce(clear?`Showing all ${api.getPlaceCount()} mock places. Access details are unverified.`:`${api.getPlaceCount()} mock places for ${c.name}. Access details are unverified.`);if(profile.speech==='screens'&&voiceUnlocked)api.speak(clear?`Showing all ${api.getPlaceCount()} mock places. These are examples, not verified locations.`:`${c.name}. ${api.getPlaceCount()} mock places. These are examples, not verified locations.`);});
$('#category-browser').addEventListener('pointerdown',e=>{if(profile.swipe&&profile.browse==='single'&&e.target.closest('.single-choice'))swipeStart={x:e.clientX,y:e.clientY};else swipeStart=null;});
$('#category-browser').addEventListener('pointerup',e=>{if(!swipeStart)return;const x=e.clientX-swipeStart.x,y=e.clientY-swipeStart.y;swipeStart=null;if(Math.abs(x)>60&&Math.abs(x)>Math.abs(y)*1.6){suppressUntil=Date.now()+450;cycle(x<0?1:-1);}});
$('#category-browser').addEventListener('pointercancel',()=>swipeStart=null);
function updateMotionUI(message){for(const id of ['setup','tools']){const b=$('#'+id+'-motion'),s=$('#'+id+'-motion-status');if(b)b.textContent=motionEnabled?'Turn shake off':'Enable optional shake';if(s)s.textContent=message||(motionEnabled?'Shake control is on for one-at-a-time category browsing.':'Shake control is off. Buttons always work.');}}
function detachMotion(){if(motionListening){window.removeEventListener('devicemotion',onMotion);motionListening=false;}motionPrevious=null;peaks=0;}
function attachMotion(){if(motionEnabled&&!document.hidden&&!motionListening){window.addEventListener('devicemotion',onMotion,{passive:true});motionListening=true;}}
function disableMotion(){motionEnabled=false;detachMotion();profile.shakeWanted=false;if(draft)draft.shakeWanted=false;persist();updateMotionUI('Shake control is off.');renderCatalog();}
async function enableMotion(){if(!window.isSecureContext){updateMotionUI('Motion needs a secure website. Use the previous and next buttons.');return;}if(!('DeviceMotionEvent'in window)){updateMotionUI('This browser does not expose motion events. Use the buttons instead.');return;}try{if(typeof DeviceMotionEvent.requestPermission==='function'){const permission=await DeviceMotionEvent.requestPermission();if(permission!=='granted'){updateMotionUI('Motion access was not granted. Buttons remain available.');return;}}motionEnabled=true;current().shakeWanted=true;attachMotion();updateMotionUI('Shake control is enabled. This device must provide motion data; use one-at-a-time browsing to try it.');renderCatalog();}catch{updateMotionUI('Motion access is unavailable. Buttons remain available.');}}
function onMotion(e){if(api.getView()!=='explore'||profile.browse!=='single'||$('dialog[open]'))return;const a=e.accelerationIncludingGravity||e.acceleration;if(!a||[a.x,a.y,a.z].some(x=>typeof x!=='number'))return;const values=[a.x,a.y,a.z];if(motionPrevious){const delta=values.reduce((sum,x,i)=>sum+Math.abs(x-motionPrevious[i]),0),now=Date.now();if(delta>20&&now-lastShake>2000){peaks=now-lastPeak<800?peaks+1:1;lastPeak=now;if(peaks>=2){lastShake=now;peaks=0;cycle(1);}}}motionPrevious=values;}
document.addEventListener('visibilitychange',()=>document.hidden?detachMotion():attachMotion());window.addEventListener('pagehide',detachMotion);
let spokenDialog=null;
$$('dialog').forEach(dialog=>{if(!['quick-card-dialog','quiet-dialog'].includes(dialog.id)){const actions=document.createElement('div');actions.className='dialog-reading-controls';actions.innerHTML='<button type="button" class="secondary" data-read-dialog>Read this dialog</button><button type="button" class="secondary" data-stop-dialog>Stop reading</button>';dialog.append(actions);actions.querySelector('[data-read-dialog]').onclick=()=>{spokenDialog=dialog.id;voiceUnlocked=true;api.speak(dialog.innerText.slice(0,2500));};actions.querySelector('[data-stop-dialog]').onclick=()=>api.stopSpeech();}dialog.addEventListener('close',()=>{if(spokenDialog===dialog.id){api.stopSpeech();spokenDialog=null;}});});
document.addEventListener('accessadelaide:dialog',e=>{if(current().speech==='screens'&&voiceUnlocked&&e.detail.id!=='quiet-dialog'){const dialog=$('#'+e.detail.id);if(dialog){spokenDialog=dialog.id;api.speak(dialog.innerText.slice(0,2500));}}});
document.addEventListener('accessadelaide:speech',e=>{if(e.detail.state==='started')voiceUnlocked=true;if(e.detail.state==='error')voiceUnlocked=false;renderVoiceStart();});
document.addEventListener('accessadelaide:view',e=>{if(e.detail.view==='explore'||e.detail.view==='journey')setupReturnView=e.detail.view;if(e.detail.view==='setup')beginDraft();if(e.detail.view==='access')renderShortcutSettings();renderDock();if(e.detail.view!=='setup')sayScreen(e.detail.view);});
document.addEventListener('accessadelaide:settings',e=>{syncSettings();renderDock();if(draft&&api.getView()==='setup')draft.settings={...e.detail};else{profile.settings={...e.detail};profile.remember=e.detail.remember===true;persist();}renderSummary();});
$('#clear-data').addEventListener('click',()=>{try{localStorage.removeItem(KEY);}catch{}profile=fresh();draft=null;setupReturnView='explore';setupMode='full';renderShortcutSettings();navigationHidden=false;disableMotion();renderDock();renderSummary();api.announce('Saved setup, settings and journey cleared.');});
document.addEventListener('accessadelaide:factory-reset',()=>{profile=fresh();draft=null;step=0;setupReturnView='explore';setupMode='full';voiceUnlocked=false;categoryIndex=0;selectedCategory=null;toolsInvoker=null;dockKey='';swipeStart=null;suppressUntil=0;spokenDialog=null;navigationHidden=false;renderShortcutSettings();$('#phone-shortcut-form').reset();disableMotion();renderDock();renderCatalog();renderSummary();renderVoiceStart();syncSettings();});
$('#reset-settings').addEventListener('click',()=>{profile.speech='ask';voiceUnlocked=false;api.stopSpeech();profile.settings=api.getSettings();navigationHidden=false;persist();renderDock();});
// Keep keyboard focus above the sticky tools when a focused field would be covered.
document.addEventListener('focusin',e=>{const footer=$('.bottom-stack'),el=e.target;if(!(el instanceof HTMLElement)||footer.contains(el)||el.closest('dialog')||(document.body.classList.contains('big-map')&&$('.map-control-panel')?.dataset.legendOpen!=='true')||['main','section'].includes(el.tagName.toLowerCase())||window.innerHeight<600)return;const box=el.getBoundingClientRect(),f=footer.getBoundingClientRect();if(box.height&&box.bottom>f.top-12&&box.top<window.innerHeight)window.scrollTo({top:Math.max(0,window.scrollY+box.top-Math.max(12,(f.top-box.height)/2)),behavior:'instant'});});
if(typeof ResizeObserver==='function')new ResizeObserver(()=>{document.documentElement.style.scrollPaddingBottom=($('.bottom-stack').offsetHeight+24)+'px';}).observe($('.bottom-stack'));
if(profile.complete)applyProfile();else{profile.settings={...api.getSettings(),mapless:true};api.setMapVisible(false);renderDock();renderCatalog();renderSummary();}
if(api.getView()==='setup')beginDraft();renderShortcutSettings();renderVoiceStart();syncSettings();
// A remembered request for spoken screens is honoured where autoplay is allowed.
// The Start voice button remains until speech actually starts.
if(profile.complete&&profile.remember&&profile.speech==='screens'&&api.getView()!=='setup'){voiceUnlocked=true;sayScreen(api.getView());voiceUnlocked=false;renderVoiceStart();}
})();
