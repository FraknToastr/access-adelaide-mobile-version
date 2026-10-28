'use strict';
(() => {
const CONFIG_KEY='access-adelaide-basemap-v1';
const ESRI='https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
const METRO='https://api.metromap.com.au/ogc/key/{key}/wmts/Australia_latest/webmercator/{z}/{x}/{y}.png';
const credits={esri:'Sources: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), © OpenStreetMap contributors, and the GIS User Community.',metromap:'Imagery © Aerometrex / MetroMap. Use is subject to your MetroMap API subscription and imagery licence.'};
let config={preferred:'metromap',key:'',rememberKey:false,force2D:false};
try{const c=JSON.parse(localStorage.getItem(CONFIG_KEY));if(c){config.preferred=c.preferred==='esri'?'esri':'metromap';config.rememberKey=c.rememberKey===true;config.key=config.rememberKey&&typeof c.key==='string'?c.key.slice(0,2000):'';config.force2D=c.force2D===true;}}catch{}
let engine=null;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const world=(coords,zoom)=>{const size=512*2**zoom,lat=clamp(coords[1],-85.051129,85.051129)*Math.PI/180;return[(coords[0]+180)/360*size,(1-Math.log(Math.tan(lat)+1/Math.cos(lat))/Math.PI)/2*size];};
const unworld=(xy,zoom)=>{const size=512*2**zoom,n=Math.PI-2*Math.PI*xy[1]/size;return[xy[0]/size*360-180,180/Math.PI*Math.atan(Math.sinh(n))];};
function boundsArray(points){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const p of points){minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);}return[[minX,minY],[maxX,maxY]];}
function tileTemplate(provider){return provider==='metromap'?METRO.replace('{key}',encodeURIComponent(config.key)):ESRI;}
function tileURL(provider,z,x,y){return tileTemplate(provider).replace('{z}',z).replace('{x}',x).replace('{y}',y);}
function configure(next){config={...config,...next,key:typeof next.key==='string'?next.key.trim().slice(0,2000):config.key};try{localStorage.setItem(CONFIG_KEY,JSON.stringify({...config,key:config.rememberKey?config.key:''}));}catch{}if(engine)engine.restart();document.dispatchEvent(new CustomEvent('accessadelaide:basemap'));}
class AccessMap {
 constructor(options){this.o=options;this.host=document.querySelector('#map');this.native=null;this.ready=false;this.renderer='loading';this.center=[138.6013,-34.9222];this.zoom=14.4;this.route=[];this.markers=[];this.online=document.querySelector('#online-map')?.checked!==false;this.provider=config.preferred==='metromap'&&config.key?'metromap':'esri';this.failedMetro=false;this.failureCount=0;this.tiles=new Map();this.renderGeneration=0;this.epoch=0;this.mapReason='';this.offline=false;this.restart();}
 notice(){
 const creditsTarget=document.querySelector('#map-credits-text');
 if(creditsTarget)creditsTarget.textContent=this.online?credits[this.provider]:'Local schematic outlines. No street tiles are being requested.';
 const runtimeTarget=document.querySelector('#map-runtime-info');
 if(runtimeTarget)runtimeTarget.textContent=this.renderer==='webgl'?'The interactive map renderer is active.':'The map is using 2D safe mode.';
 const badge=document.querySelector('.map-badge');if(badge)badge.textContent='MOCK POINTS';
 const loading=document.querySelector('#map-loading');if(loading)loading.hidden=this.ready;
 document.dispatchEvent(new CustomEvent('accessadelaide:mapstatus',{detail:{renderer:this.renderer,provider:this.provider,online:this.online}}));
 }
 status(){
 this.notice();
 const message=this.offline?'Online map tiles could not be reached. Showing local outlines; the places list is still available.':this.failedMetro?'MetroMap imagery is unavailable. The map is using Esri tiles.':'';
 if(message&&message!==this.lastAnnouncement){
  const status=document.querySelector('#persistent-status');if(status)status.textContent=message;
 }
 this.lastAnnouncement=message;
 }
 restart(){this.epoch++;const epoch=this.epoch;const retryOffline=this.offline;if(retryOffline){this.online=true;const toggle=document.querySelector('#online-map');if(toggle)toggle.checked=true;}clearTimeout(this.watchdog);if(this.native){this.destroying=true;try{this.native.remove();}catch{}this.destroying=false;}this.native=null;this.ready=false;this.tiles.clear();this.host.innerHTML='';this.markers=[];this.failedMetro=false;this.offline=false;this.provider=config.preferred==='metromap'&&config.key?'metromap':'esri';this.failureCount=0;this.mapReason='';if(config.force2D){this.useRaster('2D safe mode is selected.');return;}if(!window.maplibregl){this.useRaster('MapLibre could not load.');return;}
 try{this.native=new maplibregl.Map({container:this.host,style:{version:8,sources:{online:{type:'raster',tiles:[tileTemplate(this.provider)],tileSize:256,maxzoom:19},streets:{type:'geojson',data:this.o.data.streets},parks:{type:'geojson',data:this.o.data.parks}},layers:[{id:'schematic-background',type:'background',paint:{'background-color':'#eeeee2'}},{id:'schematic-parks',type:'fill',source:'parks',paint:{'fill-color':'#d6dfc5'}},{id:'schematic-roads-outline',type:'line',source:'streets',paint:{'line-color':'#adb7a7','line-width':12}},{id:'schematic-roads',type:'line',source:'streets',paint:{'line-color':'#fff','line-width':9}},{id:'basemap',type:'raster',source:'online',layout:{visibility:this.online?'visible':'none'},paint:{'raster-opacity':1}}]},center:this.center,zoom:this.zoom,minZoom:12,maxZoom:19,attributionControl:false,dragRotate:false,pitchWithRotate:false,keyboard:false,cooperativeGestures:true,renderWorldCopies:false});
 const canvas=this.native.getCanvas();canvas.setAttribute('aria-hidden','true');canvas.tabIndex=-1;this.native.scrollZoom.disable();this.native.touchZoomRotate.disableRotation();this.native.doubleClickZoom.disable();this.renderer='webgl';
 this.native.on('style.load',()=>{if(epoch!==this.epoch)return;clearTimeout(this.watchdog);this.ready=true;this.native.setLayoutProperty('basemap','visibility',this.online?'visible':'none');this.setRoute(this.route);this.renderMarkers();this.status();});
 this.native.on('moveend',()=>{if(epoch!==this.epoch||!this.native)return;const c=this.native.getCenter();this.center=[c.lng,c.lat];this.zoom=this.native.getZoom();this.renderMarkers();});
 this.native.on('error',e=>{if(epoch!==this.epoch)return;const detail=String(e.error?.url||e.error?.message||'');const failed=detail.includes('metromap.com.au')?'metromap':detail.includes('arcgisonline.com')?'esri':this.provider;this.providerFailure(failed);});
 const nativeAtCreation=this.native;canvas.addEventListener('webglcontextlost',()=>{if(!this.destroying&&this.native===nativeAtCreation)this.useRaster('The graphics context was lost.');});
 this.watchdog=setTimeout(()=>{if(!this.ready)this.useRaster('MapLibre did not finish starting.');},9000);
 this.status();
 }catch{this.useRaster('WebGL is unavailable on this device.');}}
 providerFailure(failed=this.provider){if(!this.online||failed!==this.provider)return;if(this.provider==='metromap'){this.provider='esri';this.failedMetro=true;this.failureCount=0;if(this.native){this.epoch++;this.useRaster('Using the 2D fallback after a MetroMap tile error.');}else this.renderRaster();this.status();}else{this.failureCount++;if(this.failureCount>=3){this.offline=true;this.online=false;const toggle=document.querySelector('#online-map');if(toggle)toggle.checked=false;if(this.native&&this.ready)this.native.setLayoutProperty('basemap','visibility','none');if(!this.native)this.renderRaster();this.mapReason='Street tiles could not be reached. Use the places list, or try online tiles again.';this.status();}}}
 useRaster(reason){clearTimeout(this.watchdog);if(this.native){this.destroying=true;try{this.native.remove();}catch{}this.destroying=false;}this.native=null;this.host.innerHTML='';this.markers=[];this.ready=true;this.renderer='raster';this.mapReason=reason;this.renderRaster();this.status();}
 project(coords){const c=world(this.center,this.zoom),p=world(coords,this.zoom);return[p[0]-c[0]+(this.host.clientWidth||390)/2,p[1]-c[1]+(this.host.clientHeight||315)/2];}
 render(){if(this.native){if(this.ready)this.renderMarkers();}else this.renderRaster();}
 renderMarkers(){if(!this.native||!this.ready)return;this.markers.forEach(m=>m.remove());this.markers=[];const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;for(const g of this.o.groups(coords=>this.native.project(coords),w,h)){const button=this.o.button(g),p=this.native.unproject([g.x,g.y]);this.markers.push(new maplibregl.Marker({element:button}).setLngLat(p).addTo(this.native));}}
 renderRaster(){if(this.native)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;const generation=++this.renderGeneration;const project=c=>this.project(c);const path=coords=>coords.map((p,i)=>{const q=project(p);return`${i?'L':'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`;}).join(' ');let markup=`<svg class="fallback-base" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" fill="#eeeee2"/>`;for(const f of this.o.data.parks.features)markup+=`<path d="${path(f.geometry.coordinates[0])}Z" fill="#d6dfc5" stroke="none"/>`;for(const f of this.o.data.streets.features)markup+=`<path d="${path(f.geometry.coordinates)}" stroke="#adb7a7" stroke-width="13" fill="none"/><path d="${path(f.geometry.coordinates)}" stroke="#fff" stroke-width="10" fill="none"/>`;markup+='</svg><div class="raster-tiles" aria-hidden="true"></div><svg class="raster-route" viewBox="0 0 '+w+' '+h+'" aria-hidden="true">';if(this.route.length){const d=path(this.route);markup+=`<path d="${d}" stroke="#fff" stroke-width="10" fill="none"/><path d="${d}" stroke="#174f43" stroke-width="5" stroke-dasharray="8 5" fill="none"/>`;}markup+='</svg>';this.host.innerHTML=markup;
 if(this.online){const pane=this.host.querySelector('.raster-tiles'),z=clamp(Math.floor(this.zoom+1),0,19),scale=2**(this.zoom+1-z),c=world(this.center,z-1),left=c[0]-w/(2*scale),top=c[1]-h/(2*scale),minX=Math.floor(left/256),maxX=Math.floor((left+w/scale)/256),minY=Math.floor(top/256),maxY=Math.floor((top+h/scale)/256);for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){const tileId=this.provider+':'+z+':'+x+':'+y;let img=this.tiles.get(tileId);if(!img){img=document.createElement('img');img.alt='';img.draggable=false;img.decoding='async';img.referrerPolicy='no-referrer';const tileProvider=this.provider,tileEpoch=this.epoch;img.addEventListener('error',()=>{if(tileEpoch===this.epoch&&this.online&&this.provider===tileProvider)this.providerFailure();});img.addEventListener('load',()=>{if(tileEpoch===this.epoch&&this.provider===tileProvider&&img.naturalWidth)this.status();});img.src=tileURL(this.provider,z,x,y);this.tiles.set(tileId,img);}img.style.left=(x*256-left)*scale+'px';img.style.top=(y*256-top)*scale+'px';img.style.width=(256*scale+.5)+'px';img.style.height=(256*scale+.5)+'px';pane.append(img);}if(this.tiles.size>80){const keep=new Set([...pane.children]);for(const [id,image] of this.tiles)if(!keep.has(image))this.tiles.delete(id);}}
 for(const g of this.o.groups(project,w,h)){const b=this.o.button(g);b.classList.add('fallback-marker');b.style.left=g.x+'px';b.style.top=g.y+'px';this.host.append(b);}}
 setRoute(coords){this.route=Array.isArray(coords)?coords:[];if(!this.native){this.renderRaster();return;}if(!this.ready)return;const n=this.native;if(!this.route.length){if(n.getLayer('demo-route'))n.removeLayer('demo-route');if(n.getLayer('demo-route-outline'))n.removeLayer('demo-route-outline');if(n.getSource('demo-route'))n.removeSource('demo-route');return;}const data={type:'Feature',properties:{},geometry:{type:'LineString',coordinates:this.route}};if(n.getSource('demo-route'))n.getSource('demo-route').setData(data);else{n.addSource('demo-route',{type:'geojson',data});n.addLayer({id:'demo-route-outline',type:'line',source:'demo-route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#fff','line-width':10}});n.addLayer({id:'demo-route',type:'line',source:'demo-route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#174f43','line-width':5,'line-dasharray':[2,1]}});}}
 resize(){if(this.native)this.native.resize();else this.renderRaster();}
 getZoom(){return this.native?this.native.getZoom():this.zoom;}
 jumpTo(opts){if(this.native){this.native.jumpTo(opts);return;}if(opts.center)this.center=opts.center;if(Number.isFinite(opts.zoom))this.zoom=clamp(opts.zoom,12,19);this.renderRaster();}
 easeTo(opts){if(this.native)this.native.easeTo(opts);else this.jumpTo(opts);}
 panBy(offset,opts){if(this.native){this.native.panBy(offset,opts);return;}const c=world(this.center,this.zoom);this.center=unworld([c[0]+offset[0],c[1]+offset[1]],this.zoom);this.renderRaster();}
 fitBounds(bounds,opts={}){
 const width=this.host.clientWidth||390,height=this.host.clientHeight||315;
 const raw=typeof opts.padding==='number'?{top:opts.padding,right:opts.padding,bottom:opts.padding,left:opts.padding}:opts.padding||{};
 const pad={top:Math.max(0,Number(raw.top)||0),right:Math.max(0,Number(raw.right)||0),bottom:Math.max(0,Number(raw.bottom)||0),left:Math.max(0,Number(raw.left)||0)};
 const horizontal=pad.left+pad.right,vertical=pad.top+pad.bottom;
 const sx=horizontal?Math.min(1,Math.max(0,width-40)/horizontal):1,sy=vertical?Math.min(1,Math.max(0,height-40)/vertical):1;
 pad.left*=sx;pad.right*=sx;pad.top*=sy;pad.bottom*=sy;
 if(this.native){this.native.fitBounds(bounds,{...opts,padding:pad});return;}
 const a=typeof bounds.toArray==='function'?bounds.toArray():bounds,p=world(a[0],0),q=world(a[1],0);
 const usableWidth=Math.max(40,width-pad.left-pad.right),usableHeight=Math.max(40,height-pad.top-pad.bottom);
 const scale=Math.min(usableWidth/Math.max(Math.abs(q[0]-p[0]),.0001),usableHeight/Math.max(Math.abs(q[1]-p[1]),.0001));
 this.zoom=clamp(Math.log2(scale),12,opts.maxZoom||16);
 const z=2**this.zoom;
 this.center=unworld([((p[0]+q[0])/2)*z-(pad.left-pad.right)/2,((p[1]+q[1])/2)*z-(pad.top-pad.bottom)/2],this.zoom);
 this.renderRaster();
 }
 setPaintProperty(id,key,value){if(this.native&&this.ready&&this.native.getLayer(id))this.native.setPaintProperty(id,key,value);}
 setLayoutProperty(id,key,value){if(id==='basemap'&&key==='visibility'){this.online=value==='visible';this.failureCount=0;this.offline=false;if(this.native&&this.ready)this.native.setLayoutProperty(id,key,value);else this.renderRaster();this.status();}}
}
window.AccessBasemaps=Object.freeze({create:options=>{engine=new AccessMap(options);return engine;},configure,getConfig:()=>({...config}),boundsArray,clear:()=>{try{localStorage.removeItem(CONFIG_KEY);}catch{}configure({key:'',rememberKey:false,preferred:'metromap',force2D:false});}});
})();
