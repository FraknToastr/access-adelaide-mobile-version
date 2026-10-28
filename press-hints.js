'use strict';
(() => {
 const id='access-long-press-tip';
 if(document.getElementById(id))return;
 const shell=document.querySelector('.app-shell');
 if(!shell)return;
 const tip=document.createElement('div');
 tip.id=id;tip.setAttribute('role','tooltip');tip.hidden=true;shell.append(tip);
 const delay=620,releaseDelay=2200,movementLimit=10;
 let showTimer=0,dismissTimer=0,pending=null,anchor=null,mode='',press=null,blockedClick=null;
 const pointers=new Set();
 const enabled=()=>window.AccessAdelaide?.getSettings?.().longPressTips===true;
 const eligible=target=>{
  if(!(target instanceof Element))return null;
  const control=target.closest('button,a[href]');
  if(!control||control.disabled||control.getAttribute('aria-disabled')==='true'||control.closest('[hidden],[inert],[aria-hidden="true"]')||!control.isConnected||!control.getClientRects().length)return null;
  return control;
 };
 const usable=control=>!!control&&eligible(control)===control;
 function clearTimers(){clearTimeout(showTimer);clearTimeout(dismissTimer);showTimer=0;dismissTimer=0;pending=null;}
 function removeDescription(control){
  if(!control)return;
  const tokens=(control.getAttribute('aria-describedby')||'').split(/\s+/).filter(token=>token&&token!==id);
  if(tokens.length)control.setAttribute('aria-describedby',tokens.join(' '));else control.removeAttribute('aria-describedby');
 }
 function hide(){
  clearTimers();removeDescription(anchor);tip.hidden=true;tip.textContent='';anchor=null;mode='';
 }
 function cancel(){
  hide();
  if(press)press.cancelled=true;
 }
 function dialogChanged(){
  cancel();
  queueMicrotask(()=>{
   const control=eligible(document.activeElement);
   if(!press&&enabled()&&control?.closest('dialog[open]'))schedule(control,'focus');
  });
 }
 function textFor(control){
  const text=(control.dataset.tip||control.getAttribute('aria-label')||control.getAttribute('title')||control.innerText||'').replace(/\s+/g,' ').trim();
  return text.length>160?text.slice(0,157).replace(/\s+\S*$/,'')+'…':text;
 }
 function show(control,kind){
  if(!enabled()||!usable(control))return false;
  const text=textFor(control);if(!text)return false;
  if(kind==='pointer'&&(!press||press.cancelled||press.control!==control||pointers.size!==1))return false;
  if(kind==='focus'&&document.activeElement!==control)return false;
  hide();
  anchor=control;mode=kind;
  const host=control.closest('dialog[open]')||shell;
  host.append(tip);tip.textContent=text;tip.hidden=false;
  const described=new Set((control.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));described.add(id);control.setAttribute('aria-describedby',[...described].join(' '));
  const viewport=window.visualViewport,hostBox=host.getBoundingClientRect();
  const viewportLeft=viewport?.offsetLeft||0,viewportTop=viewport?.offsetTop||0;
  const viewportRight=viewportLeft+(viewport?.width||innerWidth),viewportBottom=viewportTop+(viewport?.height||innerHeight);
  let left=Math.max(viewportLeft,hostBox.left)+8,right=Math.min(viewportRight,hostBox.right)-8;
  let top=Math.max(viewportTop,hostBox.top)+8,bottom=Math.min(viewportBottom,hostBox.bottom)-8;
  if(right-left<32){left=viewportLeft+8;right=viewportRight-8;}
  if(bottom-top<32){top=viewportTop+8;bottom=viewportBottom-8;}
  tip.style.maxWidth=Math.max(32,right-left)+'px';tip.style.maxHeight=Math.max(32,bottom-top)+'px';
  const box=control.getBoundingClientRect(),width=tip.offsetWidth,height=tip.offsetHeight;
  const x=Math.max(left,Math.min(right-width,box.left+box.width/2-width/2));
  const preferred=box.top-height-10>=top?box.top-height-10:box.bottom+10;
  const y=Math.max(top,Math.min(bottom-height,preferred));
  tip.style.left=x+'px';tip.style.top=y+'px';
  if(kind==='pointer')press.qualified=true;
  return true;
 }
 function schedule(control,kind){
  hide();if(!enabled()||!usable(control))return;
  pending={control,kind};
  showTimer=setTimeout(()=>{
   const request=pending;pending=null;showTimer=0;
   if(request)show(request.control,request.kind);
  },delay);
 }
 document.addEventListener('pointerdown',event=>{
  pointers.add(event.pointerId);
  hide();blockedClick=null;
  if(pointers.size>1||event.isPrimary===false){if(press)press.cancelled=true;return;}
  if(event.button!==0){if(press)press.cancelled=true;return;}
  const control=eligible(event.target);
  press=null;if(!enabled()||!control)return;
  press={control,id:event.pointerId,type:event.pointerType||'mouse',x:event.clientX,y:event.clientY,qualified:false,cancelled:false};
  schedule(control,'pointer');
 },true);
 document.addEventListener('pointermove',event=>{
  if(!press||event.pointerId!==press.id)return;
  if(Math.hypot(event.clientX-press.x,event.clientY-press.y)>movementLimit)cancel();
 },true);
 document.addEventListener('pointerout',event=>{
  if(event.pointerType==='touch'&&!press)return;
  const control=eligible(event.target);
  if(!control||control.contains(event.relatedTarget))return;
  if(press?.control===control)cancel();
  else if(anchor===control||pending?.control===control)hide();
 },true);
 document.addEventListener('pointerover',event=>{
  if(press||event.pointerType!=='mouse')return;
  const control=eligible(event.target);
  if(!control||control.contains(event.relatedTarget))return;
  schedule(control,'hover');
 },true);
 document.addEventListener('pointerup',event=>{
  pointers.delete(event.pointerId);
  if(!press||event.pointerId!==press.id)return;
  const released=press;press=null;
  clearTimeout(showTimer);showTimer=0;pending=null;
  if(released.qualified){
   blockedClick={control:released.control,pointerId:released.id,expires:Date.now()+1200};
   if(anchor===released.control&&!tip.hidden){clearTimeout(dismissTimer);dismissTimer=setTimeout(hide,releaseDelay);}
  }
 },true);
 document.addEventListener('pointercancel',event=>{
  pointers.delete(event.pointerId);
  if(press?.id===event.pointerId){
   if(press.qualified)blockedClick={control:press.control,pointerId:press.id,expires:Date.now()+1200};
   press=null;
  }
  hide();
 },true);
 document.addEventListener('click',event=>{
  if(!blockedClick||event.detail===0||event.button!==0)return;
  const suppressed=blockedClick;blockedClick=null;
  if(Date.now()<=suppressed.expires&&suppressed.control.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 document.addEventListener('contextmenu',event=>{
  const control=eligible(event.target);
  const qualifiedTouch=press?.qualified&&press.type==='touch'&&press.control===control;
  if(enabled()&&qualifiedTouch)event.preventDefault();
  else cancel();
 },true);
 document.addEventListener('focusin',event=>{
  if(press)return;
  const control=eligible(event.target);
  if(control)schedule(control,'focus');else hide();
 },true);
 document.addEventListener('focusout',event=>{
  const control=eligible(event.target);
  if(control&&(anchor===control||pending?.control===control))cancel();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   if(!tip.hidden){event.preventDefault();event.stopImmediatePropagation();}
   cancel();return;
  }
  if(event.key==='Enter'||event.key===' '){hide();blockedClick=null;}
 },true);
 for(const type of ['accessadelaide:settings','accessadelaide:view','accessadelaide:factory-reset'])document.addEventListener(type,cancel);
 document.addEventListener('accessadelaide:dialog',dialogChanged);
 document.addEventListener('scroll',cancel,true);
 document.addEventListener('close',event=>{if(event.target instanceof HTMLDialogElement)cancel();},true);
 document.addEventListener('cancel',event=>{if(event.target instanceof HTMLDialogElement)cancel();},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 window.addEventListener('resize',cancel);
 function leavePage(){cancel();press=null;blockedClick=null;pointers.clear();}
 window.addEventListener('pagehide',leavePage);
 window.addEventListener('blur',leavePage);
 window.visualViewport?.addEventListener('resize',cancel);
 window.visualViewport?.addEventListener('scroll',cancel);
 new MutationObserver(records=>{
  if(records.some(record=>record.type==='attributes'&&record.target instanceof HTMLDialogElement)){dialogChanged();return;}
  if((anchor&&!usable(anchor))||(pending&&!usable(pending.control)))cancel();
 }).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','inert','disabled']});
})();
