'use strict';
(() => {
 const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const element=value=>typeof value==='string'?document.getElementById(value):value;
 function choiceMarkup({id,label,name=id,value='',options=[],setting,description=''}){
  const esc=escapeHTML;
  return '<fieldset class="choice-group" id="'+esc(id)+'" data-choice-group><legend>'+esc(label)+'</legend>'+(description?'<p class="small">'+esc(description)+'</p>':'')+'<div class="choice-options">'+options.map((option,index)=>{
   const selected=String(option.value)===String(value);
   return '<label class="radio-card choice-card" for="'+esc(id)+'-option-'+index+'"><input type="radio" id="'+esc(id)+'-option-'+index+'" name="'+esc(name)+'" value="'+esc(option.value)+'"'+(setting?' data-setting="'+esc(setting)+'"':'')+(selected?' checked':'')+'><span><strong>'+esc(option.label)+'</strong>'+(option.description?'<span class="sub">'+esc(option.description)+'</span>':'')+'</span></label>';
  }).join('')+'</div></fieldset>';
 }
 function getChoice(id){return element(id)?.querySelector('input[type="radio"]:checked')?.value||'';}
 function setChoice(id,value){element(id)?.querySelectorAll('input[type="radio"]').forEach(input=>{input.checked=input.value===String(value);});}
 function bindChoices(id,handler){
  const group=element(id);if(!group)return ()=>{};
  const listener=event=>{if(event.target.matches('input[type="radio"]')&&event.target.checked)handler(event.target.value,event);};
  group.addEventListener('change',listener);return ()=>group.removeEventListener('change',listener);
 }
 function initializeChoiceGroups(root=document){
  const groups=[...(root.querySelectorAll?.('[data-choice-group]')||[])];
  if(root.matches?.('[data-choice-group]'))groups.unshift(root);
  for(const group of groups)group.classList.add('choice-group');
 }
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const reducedMotion=()=>window.AccessAdelaide?.getSettings().motion!==false||media.matches;
 const states=new WeakMap(),active=new Set();
 function setDrawer(target,open,{animate=true,trigger}={}){
  const drawer=element(target);if(!drawer)return Promise.resolve(false);
  const previous=states.get(drawer),startHeight=drawer.hidden?0:drawer.getBoundingClientRect().height;
  const startOpacity=drawer.hidden?0:Number(getComputedStyle(drawer).opacity)||0;
  if(previous){active.delete(previous);previous.animation?.cancel();}
  const state={drawer,open:Boolean(open),animation:null,finish:null};
  states.set(drawer,state);
  if(trigger){
   if(drawer.id)trigger.setAttribute('aria-controls',drawer.id);
   if(trigger.tagName==='BUTTON'||trigger.getAttribute('role')==='button')trigger.setAttribute('aria-expanded',String(state.open));
  }
  if(!state.open&&drawer.contains(document.activeElement))trigger?.focus();
  drawer.hidden=false;drawer.inert=!state.open;drawer.setAttribute('aria-hidden',String(!state.open));
  drawer.dataset.open=String(state.open);
  state.finish=()=>{
   if(states.get(drawer)!==state)return false;
   drawer.hidden=!state.open;drawer.inert=!state.open;
   drawer.style.height='';drawer.style.opacity='';drawer.style.overflow='';
   state.animation?.cancel();active.delete(state);return true;
  };
  if(!animate||reducedMotion()||typeof drawer.animate!=='function'){
   state.finish();return Promise.resolve(true);
  }
  drawer.style.height='auto';
  const endHeight=state.open?drawer.getBoundingClientRect().height:0;
  if(Math.abs(endHeight-startHeight)<1){state.finish();return Promise.resolve(true);}
  drawer.style.overflow='hidden';
  state.animation=drawer.animate([{height:startHeight+'px',opacity:startOpacity},{height:endHeight+'px',opacity:state.open?1:0}],{duration:300,easing:'cubic-bezier(0.22,1,0.36,1)',fill:'both'});
  active.add(state);
  return state.animation.finished.then(()=>state.finish(),()=>false);
 }
 function finishDrawers(){for(const state of [...active])state.finish();}
 document.addEventListener('accessadelaide:settings',finishDrawers);
 media.addEventListener('change',()=>{if(reducedMotion())finishDrawers();});
 window.addEventListener('resize',finishDrawers);
 document.fonts?.addEventListener('loadingdone',finishDrawers);
 document.addEventListener('focusin',event=>{for(const state of [...active])if(state.open&&state.drawer.contains(event.target))state.finish();});
 window.AccessUI=Object.freeze({choiceMarkup,getChoice,setChoice,bindChoices,initializeChoiceGroups,setDrawer,reducedMotion});
 initializeChoiceGroups();
})();
