/* Local walking-network prototype. No routing service, geocoding or inferred junctions. */
(function(root){
'use strict';
const R=6371008.8, DEG=Math.PI/180, COS=Math.cos(-34.93*DEG), CELL=100, MAX_SNAP=50;
const excluded=new Set(['Private Path','Unofficial Path','Timed Path','Timed Underpass']);
const profiles=new Set(['shortest','fastest','stepfree']);
const project=c=>[c[0]*DEG*R*COS,c[1]*DEG*R];
const validCoord=c=>Array.isArray(c)&&c.length>=2&&Number.isFinite(c[0])&&Number.isFinite(c[1])&&Math.abs(c[0])<=180&&Math.abs(c[1])<=90;
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
const now=()=>typeof performance==='object'?performance.now():Date.now();
function failure(code,message){const e=new Error(message);e.code=code;return e;}
function check(cancelled){if(cancelled?.())throw failure('CANCELLED','Route calculation cancelled.');}
function metres(a,b){const p=a[1]*DEG,q=b[1]*DEG,dy=q-p,dx=(b[0]-a[0])*DEG;const h=Math.sin(dy/2)**2+Math.cos(p)*Math.cos(q)*Math.sin(dx/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));}
function eligible(type,profile){return !excluded.has(type)&&!type.includes('Proposed')&&!(profile==='stepfree'&&(type==='Stairs'||type==='Esculator'));}
class Heap{
 constructor(){this.a=[];}
 push(value){const a=this.a;let i=a.length;a.push(value);while(i){const p=(i-1)>>1;if(a[p].cost<=value.cost)break;a[i]=a[p];i=p;}a[i]=value;}
 pop(){const a=this.a,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].cost<a[c].cost)c++;if(a[c].cost>=last.cost)break;a[i]=a[c];i=c;}a[i]=last;}return first;}
 get length(){return this.a.length;}
}
function tuples(data){
 if(Array.isArray(data?.edges))return data.edges.map(e=>({id:String(e[0]),from:String(e[1]),to:String(e[2]),length:e[3],speed:e[4],type:data.types[e[5]],location:data.locations[e[6]],coords:e[7],sourceOID:e[8]}));
 if(data?.type==='FeatureCollection')return data.features.map((f,i)=>{const p=f.properties||{},coords=f.geometry?.type==='LineString'?f.geometry.coordinates:null;const key=c=>c.map(n=>n.toFixed(8)).join(',');return{id:String(p.RouteID??p.SourceOID??`edge-${i}`),from:String(p.FromNode??(coords&&key(coords[0]))),to:String(p.ToNode??(coords&&key(coords.at(-1)))),length:p.Shape_Length,speed:p.Speed,type:p.Path_Type||'',location:p.Location||'',coords,sourceOID:p.SourceOID};});
 throw failure('INVALID_DATA','Walking network data could not be loaded.');
}
function pointAt(edge,fraction){
 const target=Math.max(0,Math.min(1,fraction))*edge.geometryLength;
 if(target<=0)return edge.coords[0].slice();if(target>=edge.geometryLength)return edge.coords.at(-1).slice();
 let lo=0,hi=edge.cumulative.length-1;while(lo+1<hi){const m=(lo+hi)>>1;if(edge.cumulative[m]<=target)lo=m;else hi=m;}
 const length=edge.cumulative[hi]-edge.cumulative[lo],t=length?(target-edge.cumulative[lo])/length:0,a=edge.coords[lo],b=edge.coords[hi];return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
}
function slice(edge,from,to){
 if(from>to)return slice(edge,to,from).reverse();
 const a=from*edge.geometryLength,b=to*edge.geometryLength,coords=[pointAt(edge,from)];
 for(let i=1;i<edge.coords.length-1;i++)if(edge.cumulative[i]>a+1e-8&&edge.cumulative[i]<b-1e-8)coords.push(edge.coords[i].slice());
 coords.push(pointAt(edge,to));return coords;
}
async function create(data,{cancelled}={}){
 check(cancelled);const raw=tuples(data),edges=[],adj=new Map(),grid=new Map(),ids=new Set(),parent=new Map();let tick=now();
 const find=n=>{if(!parent.has(n))parent.set(n,n);let r=n;while(parent.get(r)!==r)r=parent.get(r);while(parent.get(n)!==n){const next=parent.get(n);parent.set(n,r);n=next;}return r;};
 const arc=(from,to,index,a,b)=>{if(!adj.has(from))adj.set(from,[]);adj.get(from).push({to,index,a,b});};
 for(let index=0;index<raw.length;index++){
  check(cancelled);const e=raw[index];
  if(!Array.isArray(e.coords)||e.coords.length<2||!e.coords.every(validCoord)||!Number.isFinite(e.length)||e.length<=0||!Number.isFinite(e.speed)||e.speed<=0||typeof e.type!=='string'||ids.has(e.id))throw failure('INVALID_DATA',`Invalid walking path ${e.id}.`);
  ids.add(e.id);const coords=e.coords.map(c=>c.slice(0,2)),cumulative=[0];for(let i=1;i<coords.length;i++)cumulative.push(cumulative.at(-1)+metres(coords[i-1],coords[i]));
  if(cumulative.at(-1)<=0)throw failure('INVALID_DATA',`Walking path ${e.id} has no usable geometry.`);
  const edge={...e,coords,cumulative,geometryLength:cumulative.at(-1)};edges.push(edge);parent.set(find(e.from),find(e.to));arc(e.from,e.to,index,0,1);arc(e.to,e.from,index,1,0);
  for(let i=1;i<coords.length;i++){
   const a=project(coords[i-1]),b=project(coords[i]),segment={index,vertex:i-1,a,b};
   for(let x=Math.floor(Math.min(a[0],b[0])/CELL);x<=Math.floor(Math.max(a[0],b[0])/CELL);x++)for(let y=Math.floor(Math.min(a[1],b[1])/CELL);y<=Math.floor(Math.max(a[1],b[1])/CELL);y++){const key=`${x},${y}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(segment);}
  }
  if(now()-tick>8){await pause();tick=now();}
 }
 const components=new Map(),counts={};for(const e of edges){const root=find(e.from);components.set(root,(components.get(root)||0)+1);counts[e.type]=(counts[e.type]||0)+1;}
 const excludedCounts={};for(const p of profiles){excludedCounts[p]={};for(const [type,count] of Object.entries(counts))if(!eligible(type,p))excludedCounts[p][type]=count;}
 const stats=Object.freeze({edgeCount:edges.length,nodeCount:parent.size,componentCount:components.size,largestComponentEdges:components.size?Math.max(...components.values()):0,sourceLengthMetres:edges.reduce((sum,e)=>sum+e.length,0),pathTypes:counts,excludedCounts});
 async function snap(coords,profile,cancelled){
  if(!validCoord(coords))throw failure('INVALID_ENDPOINT','Choose a valid start and destination on the map.');
  const p=project(coords),seen=new Set();let best=null,tick=now();
  for(let x=Math.floor((p[0]-MAX_SNAP)/CELL);x<=Math.floor((p[0]+MAX_SNAP)/CELL);x++)for(let y=Math.floor((p[1]-MAX_SNAP)/CELL);y<=Math.floor((p[1]+MAX_SNAP)/CELL);y++)for(const s of grid.get(`${x},${y}`)||[]){
   check(cancelled);const key=`${s.index}:${s.vertex}`;if(seen.has(key))continue;seen.add(key);const e=edges[s.index];if(!eligible(e.type,profile))continue;
   const dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],square=dx*dx+dy*dy,t=square?Math.max(0,Math.min(1,((p[0]-s.a[0])*dx+(p[1]-s.a[1])*dy)/square)):0;
   const distance=Math.hypot(p[0]-s.a[0]-t*dx,p[1]-s.a[1]-t*dy);
   if(distance<=MAX_SNAP&&(!best||distance<best.distance-1e-7||(Math.abs(distance-best.distance)<1e-7&&e.id<edges[best.index].id))){const a=e.coords[s.vertex],b=e.coords[s.vertex+1];best={index:s.index,fraction:(e.cumulative[s.vertex]+t*(e.cumulative[s.vertex+1]-e.cumulative[s.vertex]))/e.geometryLength,coords:[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])],distance};}
   if(now()-tick>8){await pause();tick=now();}
  }
  if(!best)throw failure('OUTSIDE_COVERAGE','No eligible walking path is within 50 metres. Choose another point on the map, closer to the walking network.');return best;
 }
 async function calculate({start,end,profile='shortest',pace=50,cancelled}={}){
  check(cancelled);if(!profiles.has(profile))throw failure('INVALID_PROFILE','Choose Shortest, Fastest or Step-free (provisional).');
  pace=Number(pace);if(!Number.isFinite(pace)||pace<=0)throw failure('INVALID_PACE','Choose a valid walking pace.');
  const s=await snap(start,profile,cancelled),t=await snap(end,profile,cancelled),START=Symbol('start'),END=Symbol('end'),extra=new Map();
  const add=(from,to,index,a,b)=>{if(!extra.has(from))extra.set(from,[]);extra.get(from).push({to,index,a,b});};
  const link=(virtual,p)=>{const e=edges[p.index];add(virtual,e.from,p.index,p.fraction,0);add(e.from,virtual,p.index,0,p.fraction);add(virtual,e.to,p.index,p.fraction,1);add(e.to,virtual,p.index,1,p.fraction);};
  link(START,s);link(END,t);if(s.index===t.index){add(START,END,s.index,s.fraction,t.fraction);add(END,START,s.index,t.fraction,s.fraction);}
  const heap=new Heap(),dist=new Map([[START,0]]),previous=new Map();heap.push({node:START,cost:0});let tick=now();
  while(heap.length){
   check(cancelled);const current=heap.pop();if(current.cost!==dist.get(current.node))continue;if(current.node===END)break;
   for(const arc of [...(adj.get(current.node)||[]),...(extra.get(current.node)||[])]){
    const e=edges[arc.index];if(!eligible(e.type,profile))continue;
    // Shortest/stepfree minimise source metres. Fastest minimises Shape_Length /
    // Speed (m/s), not Walktime. Partial edges use their geometric fraction.
    const cost=current.cost+Math.abs(arc.b-arc.a)*e.length/(profile==='fastest'?e.speed:1);
    if(cost<(dist.get(arc.to)??Infinity)){dist.set(arc.to,cost);previous.set(arc.to,{node:current.node,arc});heap.push({node:arc.to,cost});}
   }
   if(now()-tick>8){await pause();tick=now();}
  }
  check(cancelled);if(!dist.has(END))throw failure('DISCONNECTED','These points are not connected by eligible walking paths for this route type. Move a point or choose another route type. No connecting route has been invented.');
  const arcs=[];for(let node=END;node!==START;){const p=previous.get(node);arcs.push(p.arc);node=p.node;}arcs.reverse();
  // Adjacent pieces of the same source edge are joined without dropping vertices.
  const joined=[];for(const a of arcs){if(Math.abs(a.b-a.a)<1e-12)continue;const last=joined.at(-1);if(last&&last.index===a.index&&Math.abs(last.b-a.a)<1e-10&&(last.b-last.a)*(a.b-a.a)>0)last.b=a.b;else joined.push({...a});}
  // Personalised ETA scales the attribute-based time by the user's pace relative
  // to 1.39 m/s. It preserves source speed penalties and excludes rest time.
  const paceFactor=1.39/(pace/60),segments=[],coords=[];let distance=0,seconds=0;
  for(const a of joined){const e=edges[a.index],fraction=Math.abs(a.b-a.a),d=e.length*fraction,sec=d/e.speed*paceFactor,part=slice(e,a.a,a.b);segments.push({edgeId:e.id,pathType:e.type,location:e.location||'',coords:part,distance:d,seconds:sec});distance+=d;seconds+=sec;for(const c of part){const last=coords.at(-1);if(!last||last[0]!==c[0]||last[1]!==c[1])coords.push(c);}}
  if(!coords.length)coords.push(s.coords.slice());if(coords.length===1)coords.push(t.coords.slice());
  return{coords,distance,duration:seconds/60,seconds,segments,profile,snaps:{start:{coords:s.coords,distance:s.distance,edgeId:edges[s.index].id},end:{coords:t.coords,distance:t.distance,edgeId:edges[t.index].id}},networkVersion:data.version||'development'};
 }
 return Object.freeze({calculate,stats,version:data.version||'development',networkGeoJSON:()=>({type:'FeatureCollection',features:edges.filter(e=>eligible(e.type,'shortest')).map(e=>({type:'Feature',properties:{id:e.id,pathType:e.type},geometry:{type:'LineString',coordinates:e.coords.map(c=>c.slice())}}))})});
}
const api=Object.freeze({create,metres,maxSnapMetres:MAX_SNAP,isEligible:eligible});
if(typeof module==='object'&&module.exports)module.exports=api;else root.AccessRouting=api;
})(typeof globalThis!=='undefined'?globalThis:this);
