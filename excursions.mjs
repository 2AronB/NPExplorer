import {personalPriority} from './personal-priority.mjs';
import {CANADA_CORRIDOR,REGIONAL_GATEWAYS} from './remote-parks.mjs';
const caches=new WeakMap();
const inWindow=(date,w,iso)=>{if(!w)return true;const md=iso(date).slice(5,10);return w.start<=w.end?md>=w.start&&md<=w.end:md>=w.start||md<=w.end;};
export function flightEstimate(from,to,haversine){
 // Every modeled airport can connect to every region; no claim of nonstop service.
 return haversine(from,to)/475+6; // 3 h airport handling + 3 h connection allowance
}
export function evaluateExcursion(stop,date,settings,api){
 const {travel,driveDays,dateOf,addDays,iso,seasonQuality,isClosed,haversine}=api;
 let cache=caches.get(stop);if(!cache){cache=new Map();caches.set(stop,cache);}
 // Insertion searches reuse nodes, including across changed planning settings.
 const key=JSON.stringify([iso(date),settings,stop.excursion]);if(cache.has(key))return cache.get(key);
 const {region,mode,airport,parks}=stop.excursion,gateway=REGIONAL_GATEWAYS[region],buffer=settings.remoteBufferDays??2;
 const point=p=>({lat:p.lat,lng:p.lng});
 const flight=(from,to,label)=>{const hours=flightEstimate(from,to,haversine);return {kind:'flight',label,hours,days:Math.ceil(hours/(settings.flightDayHours??12)),from,to};};
 const drive=(from,to,label)=>{const t=travel(point(from),point(to),{...settings,averageMph:settings.remoteRoadMph??50});return {kind:'drive',label,hours:t.hours,miles:t.miles,breakHours:t.breakHours,days:driveDays(t.hours,settings),from,to};};
 const regional=(s,inbound=false)=>({kind:'transfer',label:(inbound?'Return: ':'Access: ')+s.remote.route,hours:s.id==='gaar'||s.id==='kova'?8:s.id==='lacl'?4:6,days:1,from:inbound?point(s):gateway,to:inbound?gateway:point(s)});
 const park=s=>({kind:'park',park:s,days:s.days});
 let prefix=[],suffix=[],middle=[];
 if(mode==='drive'){
  for(let i=1;i<CANADA_CORRIDOR.length;i++)prefix.push(drive(CANADA_CORRIDOR[i-1],CANADA_CORRIDOR[i],`${CANADA_CORRIDOR[i-1].name} → ${CANADA_CORRIDOR[i].name}`));
  suffix=[...prefix].reverse().map(e=>({...e,from:e.to,to:e.from,label:e.to.name+' → '+e.from.name}));
 }else if(region==='samoa'){
  const hnl=REGIONAL_GATEWAYS.hawaii;prefix=[flight(airport,hnl,airport.code+' → Honolulu (connections allowed)'),flight(hnl,gateway,'Honolulu → Pago Pago (service assumed)')];
  suffix=[flight(gateway,hnl,'Pago Pago → Honolulu (service assumed)'),flight(hnl,airport,'Honolulu → '+airport.code+' (connections allowed)')];
 }else if(region==='hawaii'){
  const island=s=>({name:s.id==='hale'?'Kahului OGG':'Hilo ITO',lat:s.id==='hale'?20.9:19.72,lng:s.id==='hale'?-156.43:-155.05});
  prefix=[flight(airport,island(parks[0]),airport.code+' → '+island(parks[0]).name+' (connections allowed)')];suffix=[flight(island(parks.at(-1)),airport,island(parks.at(-1)).name+' → '+airport.code+' (connections allowed)')];
 }else{prefix=[flight(airport,gateway,`${airport.code} → ${gateway.name} (connections allowed)`)];suffix=[flight(gateway,airport,`${gateway.name} → ${airport.code} (connections allowed)`)];}
 if(region==='alaska'){
  let current=gateway,road=[...parks.filter(s=>s.remote.mode==='road')],roadEvents=[];
  while(road.length){road.sort((a,b)=>haversine(current,a)-haversine(current,b));const s=road.shift();roadEvents.push(drive(current,s,`${current.name||current.shortName} → ${s.shortName}`),park(s));current=s;}
  if(roadEvents.length)roadEvents.push(drive(current,gateway,`${current.shortName} → Anchorage`));
  const remoteOrder=['gaar','kova','lacl','katm','glba'],air=parks.filter(s=>s.remote.mode!=='road').sort((a,b)=>remoteOrder.indexOf(a.id)-remoteOrder.indexOf(b.id));
  const airEvents=air.flatMap(s=>[regional(s),park(s),regional(s,true)]);
  middle=[...airEvents,...roadEvents];
  // Test both regional circuit directions against actual visit dates.
  middle=[middle,[...roadEvents,...[...air].reverse().flatMap(s=>[regional(s),park(s),regional(s,true)])]];
 }else if(region==='hawaii'){
  let previous=null;middle=[];
  for(const s of parks){const island={name:s.id==='hale'?'Kahului OGG':'Hilo ITO',lat:s.id==='hale'?20.9:19.72,lng:s.id==='hale'?-156.43:-155.05};if(previous)middle.push(flight(previous,island,previous.name+' → '+island.name));const outbound=drive(island,s,'Rental car → '+s.shortName),inbound=drive(s,island,s.shortName+' → island airport');middle.push({...outbound,days:Math.max(1,outbound.days)},park(s),{...inbound,days:Math.max(1,inbound.days)});previous=island;}
  middle=[middle];
 }else{
  const s=parks[0];middle=[[{kind:'transfer',label:s.remote.route,hours:region==='virgin'?4:2,days:1,from:gateway,to:point(s)},park(s),{kind:'transfer',label:'Return to '+gateway.name,hours:region==='virgin'?4:2,days:1,from:point(s),to:gateway}]];
 }
 let best=null;
 for(const circuit of middle){
  const events=[...prefix,...circuit,{kind:'buffer',label:'Weather / connection contingency',days:buffer},...suffix];
  let wait=0,visits=[],transport=[],qualitySum=0,qualityDays=0,penalty=0,feasible=false,now;
  while(wait<=371){
   now=addDays(date,wait===371?0:wait);visits=[];transport=[];qualitySum=0;qualityDays=0;penalty=0;feasible=true;
   for(const event of events){
    const depart=iso(now);
    if(event.kind==='park'){
     const s=event.park,w=settings.remoteWindows?.[s.id]===null?null:settings.remoteWindows?.[s.id]||s.remote.window;
     let sum=0,min=10,closed=false;
     for(let i=0;i<s.days;i++){const d=addDays(now,i),q=seasonQuality(s,d)??6;if(!inWindow(d,w,iso)||isClosed(s,d))closed=true;sum+=q;min=Math.min(min,q);penalty+=((10-q)/3)**2*personalPriority(s);if(settings.objective==='quiet'&&!s.profile.quiet.includes(d.getUTCMonth()+1))penalty+=3*personalPriority(s);}
     if(closed&&wait<371){feasible=false;break;}
     qualitySum+=sum;qualityDays+=s.days;visits.push({id:s.id,arrival:depart,departure:iso(addDays(now,s.days)),days:s.days,priority:personalPriority(s),quality:sum/s.days,minQuality:min,status:min<=3?'difficult':sum/s.days>=8?'ideal':'mixed',route:s.remote.route});
    }else transport.push({...event,depart,arrival:iso(addDays(now,event.days))});
    now=addDays(now,event.days);
   }
   if(feasible)break;wait++;
  }
  const failed=wait===371;if(failed)wait=0;
  const miles=transport.reduce((n,e)=>n+(e.miles||0),0),hours=transport.filter(e=>e.kind==='drive').reduce((n,e)=>n+e.hours,0),flightHours=transport.filter(e=>e.kind==='flight'||e.kind==='transfer').reduce((n,e)=>n+e.hours,0),breakHours=transport.reduce((n,e)=>n+(e.breakHours||0),0),driveCount=transport.filter(e=>e.kind==='drive').reduce((n,e)=>n+e.days,0),transferDays=transport.filter(e=>e.kind!=='drive').reduce((n,e)=>n+e.days,0);
  const days=Math.round((now-addDays(date,wait))/86400000),weight=settings.objective==='shortest'?0:settings.objective==='quiet'?2.4:3;
  const out={region,mode,airport,anchor:point(stop),gateway,wait,feasible:!failed,depart:iso(addDays(date,wait)),returnDate:iso(now),days,parkDays:qualityDays,qualityDays,qualitySum,quality:qualityDays?qualitySum/qualityDays:null,minQuality:Math.min(...visits.map(v=>v.minQuality)),penalty,miles,hours,flightHours,breakHours,driveDays:driveCount,transferDays,bufferDays:buffer,longDays:transport.filter(e=>e.kind==='drive'&&e.days&&e.hours/e.days>settings.comfort).reduce((n,e)=>n+e.days,0),visits,transport,score:hours+flightHours+(days-qualityDays)*2+wait*10+penalty*weight+(failed?1e9:0)};
  if(!best||out.score<best.score)best=out;
 }
 if(!best)best={region,mode,airport,feasible:false,wait:0,days:0,parkDays:parks.reduce((n,s)=>n+s.days,0),qualityDays:0,qualitySum:0,quality:null,minQuality:null,penalty:1e6,miles:0,hours:0,flightHours:0,breakHours:0,driveDays:0,transferDays:0,bufferDays:0,longDays:0,visits:[],transport:[],depart:iso(date),returnDate:iso(date),score:1e9};
 cache.set(key,best);return best;
}
