'use strict';
// Requires Playwright; FIREFOX_EXECUTABLE can select an existing Firefox runtime.
const assert=require('node:assert/strict');
const path=require('node:path');
const {firefox}=require(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
(async()=>{
const browser=await firefox.launch({headless:true,...(process.env.FIREFOX_EXECUTABLE?{executablePath:process.env.FIREFOX_EXECUTABLE}:{})});
try {
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.setContent('<style>#map{width:350px;height:320px;position:relative;overflow:hidden}.fallback-base,.raster-route{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.raster-tiles{position:absolute;inset:0}</style><input id="online-map" type="checkbox"><div id="map"></div><p id="map-credits-text"></p><p id="map-runtime-info"></p><p id="persistent-status"></p>');
await page.addScriptTag({path:path.resolve(__dirname,'..','map-engine.js')});
await page.evaluate(()=>{
 window.selected=[];const empty={type:'FeatureCollection',features:[]};
 window.testMap=AccessBasemaps.create({data:{parks:empty,streets:empty},groups:()=>[],button:()=>document.createElement('button')});
 testMap.setNetwork({type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'LineString',coordinates:[[138.600,-34.922],[138.603,-34.922]]},properties:{}}]});
 testMap.setSelection({active:true,onSelect:coords=>selected.push(coords)});
 testMap.setRoute([[138.600,-34.922],[138.603,-34.922]]);
 testMap.setRouteEndpoints([138.600,-34.922],[138.603,-34.922]);
});
assert.equal(await page.locator('.route-endpoint').count(),2);
assert.equal(await page.locator('.fallback-base path').count(),1);
const box=await page.locator('#map').boundingBox();
await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
assert.equal(await page.evaluate(()=>selected.length),1);
const centre=await page.evaluate(()=>({selected:selected[0],center:testMap.getCenterCoordinates()}));
assert.ok(Math.abs(centre.selected[0]-centre.center[0])<1e-9);
assert.ok(Math.abs(centre.selected[1]-centre.center[1])<1e-9);
await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();await page.mouse.move(box.x+80,box.y+20);await page.mouse.up();
assert.equal(await page.evaluate(()=>selected.length),1);
await page.evaluate(()=>{const button=document.createElement('button');button.textContent='Place';button.id='place';button.style.position='absolute';button.style.left='10px';button.style.top='10px';document.querySelector('#map').append(button);});
await page.locator('#place').click();assert.equal(await page.evaluate(()=>selected.length),1);
await page.evaluate(()=>AccessBasemaps.configure({force2D:true}));
assert.equal(await page.locator('.route-endpoint').count(),2);
assert.equal(await page.locator('.fallback-base path').count(),1);
await page.evaluate(()=>testMap.setSelection(null));
assert.equal(await page.locator('.fallback-base path').count(),0);
await page.evaluate(()=>testMap.setRoute([]));assert.equal(await page.locator('.route-endpoint').count(),2);
await page.evaluate(()=>testMap.setRouteEndpoints(null,null));assert.equal(await page.locator('.route-endpoint').count(),0);
await page.evaluate(async()=>{
 const assert=(value,message)=>{if(!value)throw Error(message)};
 let instances=0;
 class FakeMap {
 constructor(options){instances++;this.events={};this.center=options.center;this.zoom=options.zoom;this.layers=new Map();this.sources=new Map();this.canvas=document.createElement('canvas');document.querySelector('#map').append(this.canvas);this.scrollZoom={disable(){}};this.touchZoomRotate={disableRotation(){}};this.doubleClickZoom={disable(){}};queueMicrotask(()=>this.fire('style.load'));}
 on(type,fn){(this.events[type]??=[]).push(fn)}fire(type,e={}){for(const fn of this.events[type]??[])fn(e)}
 getCanvas(){return this.canvas}getCenter(){return{lng:this.center[0],lat:this.center[1]}}getZoom(){return this.zoom}project(){return{x:100,y:100}}unproject(){return{lng:138.601,lat:-34.922}}remove(){this.canvas.remove()}
 getSource(id){return this.sources.get(id)}addSource(id,source){this.sources.set(id,{data:source.data,setData(data){this.data=data}})}removeSource(id){this.sources.delete(id)}
 getLayer(id){return this.layers.get(id)}addLayer(layer){this.layers.set(layer.id,layer)}removeLayer(id){this.layers.delete(id)}setLayoutProperty(id,key,value){const layer=this.layers.get(id);if(layer){layer.layout??={};layer.layout[key]=value}}
 jumpTo(opts){if(opts.center)this.center=opts.center;this.fire('moveend')}resize(){}
 }
 class FakeMarker {constructor({element}){this.element=element}setLngLat(){return this}addTo(){document.querySelector('#map').append(this.element);return this}remove(){this.element.remove()}}
 window.maplibregl={Map:FakeMap,Marker:FakeMarker};
 AccessBasemaps.configure({force2D:false});await Promise.resolve();
 const native=testMap.native;assert(instances===1,'one native map created');
 let moves=0;document.addEventListener('accessadelaide:mapmove',()=>moves++);
 testMap.setSelection({active:true,coords:[138.601,-34.922],onSelect:coords=>selected.push(coords)});
 assert(moves===1,'native centre update event');
 assert(native.getLayer('walking-selection-network').layout.visibility==='visible','offline native network visible');
 native.fire('click',{lngLat:{lng:138.601,lat:-34.922},originalEvent:{target:native.canvas}});
 assert(selected.length===2,'native click selects once');
 const button=document.createElement('button');native.fire('click',{lngLat:{lng:1,lat:1},originalEvent:{target:button}});assert(selected.length===2,'native button click excluded');
 testMap.setRouteEndpoints([138.6,-34.922],[138.602,-34.922]);assert(document.querySelectorAll('.route-endpoint').length===2,'native endpoints');
 testMap.setSelection(null);assert(native.getLayer('walking-selection-network').layout.visibility==='none','native network hidden');
 AccessBasemaps.configure({force2D:false});await Promise.resolve();assert(instances===2,'single restart');assert(document.querySelectorAll('.route-endpoint').length===2,'native endpoint restart persistence');
});
} finally {
 await browser.close();
}
console.log('PASS raster map adapter: taps, drag suppression, marker exclusion, endpoints, network visibility, restart persistence; MapLibre lifecycle/selection stub checks.');
})().catch(e=>{console.error(e);process.exitCode=1});
