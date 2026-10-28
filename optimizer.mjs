import {monthlyQuality} from './season-quality.mjs';
import {evaluateExcursion} from './excursions.mjs';
import {personalPriority} from './personal-priority.mjs';
export const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY=86400000;
export const dateOf=s=>new Date(s+'T12:00:00Z');
export const iso=d=>d.toISOString().slice(0,10);
export const addDays=(d,n)=>new Date(d.getTime()+n*DAY);
export function haversine(a,b){
 const rad=x=>x*Math.PI/180,dlat=rad(b.lat-a.lat),dlng=rad(b.lng-a.lng);
 const h=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlng/2)**2;
 return 3958.8*2*Math.asin(Math.sqrt(Math.min(1,h)));
}
export const roadPoint=s=>s.access?.gateway||s;
const travelCache=new Map();
export function travel(a,b,settings={}){
 const mph=settings.averageMph??48;
 const factor=settings.distanceFactor??1.28,breakPercent=settings.breakPercent??0;
 const from=roadPoint(a),to=roadPoint(b),key=[from.lat,from.lng,to.lat,to.lng,mph,factor,breakPercent].join(',');
 if(travelCache.has(key))return travelCache.get(key);
 if(haversine(from,to)<.5)return {miles:0,hours:0,breakHours:0,elapsedHours:0,path:[from,to],cautions:[]};
 const northWest=p=>p.lat>45&&p.lng< -87,northEast=p=>p.lat>40&&p.lng> -80;
 const florida=p=>p.lat<29&&p.lng> -83.5;
 const cautions=[];
 if((northWest(from)&&northEast(to))||(northEast(from)&&northWest(to)))cautions.push('Great Lakes / possible Canada routing: road distance and border choice unverified.');
 if((florida(from)&&to.lng< -85)||(florida(to)&&from.lng< -85))cautions.push('Gulf / Florida approach: straight-line geometry does not show the actual mainland driving route.');
 const miles=haversine(from,to)*factor;
 const hours=miles/mph+.25,breakHours=hours*breakPercent/100;
 const result={miles,hours,breakHours,elapsedHours:hours+breakHours,path:[from,to].map(p=>({lat:p.lat,lng:p.lng})),cautions};
 travelCache.set(key,result);return result;
}
export function isClosed(site,date){
 const c=site.closure;if(!c)return false;
 const md=iso(date).slice(5);
 return c.start<=c.end?md>=c.start&&md<=c.end:md>=c.start||md<=c.end;
}
export function season(site,date){
 if(isClosed(site,date))return 'closed';
 const quality=seasonQuality(site,date);
 return quality===null?'unknown':quality<=3?'difficult':quality>=8?'ideal':'mixed';
}
export function seasonQuality(site,date){return !site.profile?null:isClosed(site,date)?0:monthlyQuality(site.profile,date.getUTCMonth()+1);}
export function driveDays(hours,settings){
 const cap=settings.pace==='relaxed'?settings.comfort:settings.pace==='efficient'?settings.maxDrive:settings.stretch;
 return hours===0?0:Math.ceil(hours/Math.min(cap,settings.maxDrive));
}
// Each road day has one activity budget. Credit only the final road day's spare time,
// at the destination; remote access, personal appointments and return-home legs are excluded.
export function arrivalCredit(t,nd,settings){
 if(!settings.sharedDays||!nd)return 0;
 const lastHours=t.hours/nd,elapsed=lastHours*(1+(settings.breakPercent||0)/100)+(settings.setupHours??.75)+(settings.teardownHours??.75);
 return Math.min(1,Math.max(0,Math.floor(((settings.dayBudget??10)-elapsed)/(settings.explorationHours??8)*4)/4));
}
function staySeason(s,date,days,objective){
 let cost=0,qualitySum=0,qualityDays=0,minQuality=10,closedDays=0;
 for(let i=0;i<days;i++){
  const d=addDays(date,i),closed=isClosed(s,d),q=seasonQuality(s,d);
  if(closed){closedDays++;cost+=100;}
  else if(q!==null)cost+=((10-q)/3)**2;
  if(q!==null){qualitySum+=q;qualityDays++;minQuality=Math.min(minQuality,q);}
  if(objective==='quiet'&&s.profile&&!s.profile.quiet.includes(d.getUTCMonth()+1))cost+=3;
 }
 return {cost:cost*personalPriority(s),qualitySum,qualityDays,minQuality:qualityDays?minQuality:null,quality:qualityDays?qualitySum/qualityDays:null,closedDays};
}
const seasonalCost=(s,date,days,objective)=>staySeason(s,date,days,objective).cost;
export function schedule(order,settings,startDate=settings.startDate){
 let now=dateOf(startDate),current=settings.start,miles=0,hours=0,travelDays=0,parkDays=0,transferDays=0,waitDays=0,longDays=0,penalty=0;
 const legs=[],visits=[],warnings=[],excursions=[];let qualitySum=0,qualityDays=0,flightHours=0,remoteDays=0,sharedParkDays=0,mixedDays=0,appointmentConflicts=0,appointmentLateDays=0,appointmentWaitDays=0;
 for(const stop of order){
  const t=travel(current,stop,settings),nd=driveDays(t.hours,settings),daily=nd?t.hours/nd:0;
  const leg={from:current.id||'start',to:stop.id,...t,days:nd,dailyHours:daily,depart:iso(now)};
  now=addDays(now,nd);miles+=t.miles;hours+=t.hours;travelDays+=nd;
  if(daily>settings.comfort)longDays+=nd;
  if(stop.excursion){
   const block=evaluateExcursion(stop,now,settings,{travel,driveDays,dateOf,addDays,iso,seasonQuality,isClosed,haversine});
   excursions.push({...block,id:stop.id});miles+=block.miles;hours+=block.hours;flightHours+=block.flightHours;travelDays+=block.driveDays;transferDays+=block.transferDays;waitDays+=block.wait;longDays+=block.longDays;parkDays+=block.parkDays;qualitySum+=block.qualitySum;qualityDays+=block.qualityDays;penalty+=block.penalty;remoteDays+=block.days-block.parkDays;
   if(block.wait)warnings.push(`${stop.shortName}: ${block.wait} wait days before the draft transport/visit window fits. This is a service assumption, not a park closure.`);
   if(!block.feasible)warnings.push(`${stop.shortName}: no complete stay fits the transport windows or closure rules within a year. All requested days are retained, but this excursion is infeasible.`);
   visits.push({id:stop.id,arrival:block.depart,departure:block.returnDate,days:block.parkDays,status:!block.feasible?'closed':block.minQuality<=3?'difficult':block.quality>=8?'ideal':'mixed',quality:block.quality,minQuality:block.minQuality,wait:block.wait,transferDays:block.days-block.parkDays,excursion:true});
   now=addDays(now,block.days+block.wait);current=stop;legs.push(leg);continue;
  }
  const transfer=stop.access?.transferDays||0;
  // Reserve outbound/inbound transfer days separately from requested full park days.
  now=addDays(now,Math.ceil(transfer/2));transferDays+=transfer;
  const days=stop.days,earliest=now;
  let appointmentWait=0,lateDays=0;
  if(stop.type==='custom'&&stop.fixedDate){const delta=(dateOf(stop.fixedDate)-now)/DAY;if(delta>0){appointmentWait=delta;appointmentWaitDays+=delta;now=addDays(now,delta);}else if(delta<0){lateDays=Math.ceil(-delta);appointmentConflicts++;appointmentLateDays+=lateDays;warnings.push(`${stop.shortName||stop.name}: missed fixed first full day ${stop.fixedDate} by ${lateDays} day(s). This route is not feasible for that appointment.`);}}
  let wait=0;
  while(wait<370 && Array.from({length:days},(_,i)=>isClosed(stop,addDays(now,i))).some(Boolean)){now=addDays(now,1);wait++;}
  if(wait>=370)warnings.push(`${stop.shortName}: requested stay does not fit an available annual opening window.`);
  if(wait){waitDays+=wait;warnings.push(`${stop.shortName}: ${wait} flex/wait days added before the published or user-entered closure window allows this stay.`);}
  const shared=stop.type==='park'&&!transfer&&!wait?Math.min(days,arrivalCredit(t,nd,settings)):0;
  const calendarDays=days-shared;
  sharedParkDays+=shared;if(shared)mixedDays++;
  // The final travel date also contains this destination's credited exploration.
  const arrival=iso(addDays(now,shared?-1:0)),departure=iso(addDays(now,calendarDays));
  const quality=staySeason(stop,now,days,settings.objective);
  const status=quality.closedDays?'closed':quality.quality===null?'unknown':quality.minQuality<=3?'difficult':quality.quality>=8?'ideal':'mixed';
  penalty+=quality.cost;qualitySum+=quality.qualitySum;qualityDays+=quality.qualityDays;
  visits.push({id:stop.id,arrival,departure,days,calendarDays,sharedDays:shared,fixedDate:stop.fixedDate||null,appointmentWait,lateDays,status,priority:personalPriority(stop),quality:quality.quality,minQuality:quality.minQuality,wait,earliest:iso(earliest),transferDays:transfer,quiet:!!stop.profile?.quiet.includes(now.getUTCMonth()+1)});
  now=addDays(now,calendarDays+Math.floor(transfer/2));parkDays+=days;current=stop;legs.push(leg);
 }
 if(settings.end){
  const t=travel(current,settings.end,settings),nd=driveDays(t.hours,settings),daily=nd?t.hours/nd:0;
  legs.push({from:current.id||'start',to:'finish',...t,days:nd,dailyHours:daily,depart:iso(now)});
  now=addDays(now,nd);miles+=t.miles;hours+=t.hours;travelDays+=nd;if(daily>settings.comfort)longDays+=nd;
 }
 const restDays=settings.restDays||0;
 now=addDays(now,restDays);
 const rawDays=(now-dateOf(startDate))/DAY,roundingDays=Math.ceil(rawDays)-rawDays;now=addDays(now,roundingDays);
 const totalDays=Math.ceil(rawDays),overrun=Math.max(0,totalDays-settings.duration);
 const weight=settings.objective==='shortest'?0:settings.objective==='quiet'?2.4:3;
 // Duration is a reporting target. It never changes route ranking or stays.
 const score=appointmentConflicts*1e9+appointmentLateDays*1e6+hours+flightHours+remoteDays*2+penalty*weight+waitDays*10+longDays*(settings.pace==='relaxed'?5:1)+excursions.filter(e=>!e.feasible).length*1e9;
 const breakHours=legs.reduce((n,l)=>n+l.breakHours,0)+excursions.reduce((n,e)=>n+e.breakHours,0);
 return {appointmentConflicts,appointmentLateDays,appointmentWaitDays,sharedParkDays,mixedDays,dedicatedTravelDays:travelDays-mixedDays,roundingDays,order:order.map(s=>s.id),startDate,endDate:iso(now),legs,visits,miles,hours,flightHours,excursions,breakHours,elapsedHours:hours+breakHours,travelDays,parkDays,transferDays,waitDays,restDays,totalDays,remaining:settings.duration-totalDays,overrun,longDays,seasonPenalty:penalty,quality:qualityDays?qualitySum/qualityDays:null,qualityDays,score,warnings};
}
function greedy(stops,settings,date,seasonal,seed){
 const remaining=[...stops],route=[];let current=settings.start,now=dateOf(date);
 while(remaining.length){
  let best=0,value=Infinity;
  for(let i=0;i<remaining.length;i++){
   const s=remaining[i],t=travel(current,s,settings),arrival=addDays(now,driveDays(t.hours,settings));
   const cost=t.hours+(seasonal?seasonalCost(s,arrival,s.days,settings.objective)*2+(isClosed(s,arrival)?180:0):0);
   if(cost<value){value=cost;best=i;}
  }
  if(!route.length&&seed!==undefined)best=remaining.findIndex(s=>s.id===seed);
  const next=remaining.splice(Math.max(0,best),1)[0];
  now=addDays(now,driveDays(travel(current,next,settings).hours,settings)+next.days+(next.access?.transferDays||0));route.push(next);current=next;
 }
 return route;
}
export function routeMiles(order,settings){
 let total=0,prev=settings.start;for(const s of order){total+=travel(prev,s,settings).miles;prev=s;}
 if(settings.end)total+=travel(prev,settings.end,settings).miles;return total;
}
function geometrySearch(input,settings){
 let order=[...input];
 // Exhaustive best-improvement 2-opt passes; travel distances are symmetric in this draft.
 for(let pass=0;pass<25;pass++){
  let improvement=-.001,move=null;
  for(let i=0;i<order.length-1;i++)for(let j=i+1;j<order.length;j++){
   const before=i?order[i-1]:settings.start,after=j+1<order.length?order[j+1]:settings.end;
   const delta=travel(before,order[j],settings).miles-travel(before,order[i],settings).miles+(after?travel(order[i],after,settings).miles-travel(order[j],after,settings).miles:0);
   if(delta<improvement){improvement=delta;move=[i,j];}
  }
  if(!move)break;const [i,j]=move;order.splice(i,j-i+1,...order.slice(i,j+1).reverse());
 }
 return order;
}
function optimizeOneMonth(stops,settings){
 if(!stops.length)return null;
 const dates=[settings.startDate];
 const near=[...stops].sort((a,b)=>travel(settings.start,a,settings).miles-travel(settings.start,b,settings).miles);
 const seeds=[...new Set([0,1,2,4,8].map(n=>Math.min(n,near.length-1)))];
 const geographic=seeds.map(i=>geometrySearch(greedy(stops,settings,settings.startDate,false,near[i].id),settings));
 geographic.sort((a,b)=>routeMiles(a,settings)-routeMiles(b,settings));
 const baselineMiles=routeMiles(geographic[0],settings);
 const detourPercent=settings.objective==='shortest'?0:(settings.seasonDetourPercent??15);
 const maxMiles=baselineMiles*(1+detourPercent/100)+.001;
 const candidates=[];
 for(const date of dates){
  const orders=[...geographic.slice(0,2),...geographic.slice(0,2).map(o=>[...o].reverse()),greedy(stops,settings,date,true)];
  const seen=new Set();
  for(const order of orders){const key=order.map(s=>s.id).join(',');if(seen.has(key))continue;seen.add(key);
   if(routeMiles(order,settings)<=maxMiles)candidates.push({order,result:schedule(order,settings,date)});
  }
 }
 candidates.sort((a,b)=>a.result.score-b.result.score);
 let winner=candidates[0].result;
 const closest=new Map(stops.map(s=>[s.id,new Set([...stops].filter(x=>x.id!==s.id).sort((a,b)=>travel(s,a,settings).miles-travel(s,b,settings).miles).slice(0,6).map(x=>x.id))]));
 // Polish the strongest date/order candidates with systematic local moves, not random swaps.
 for(const candidate of candidates.slice(0,4)){
  let order=[...candidate.order],best=candidate.result;
  for(let pass=0;pass<4;pass++){
   let improvedOrder=null,improved=best;
   const consider=proposed=>{if(routeMiles(proposed,settings)>maxMiles)return;const r=schedule(proposed,settings,best.startDate);if(r.score<improved.score-.00001){improved=r;improvedOrder=proposed;}};
   for(let i=0;i<order.length;i++)for(let j=0;j<order.length;j++){
    if(i===j)continue;
    if(order.length>12&&Math.abs(i-j)>2&&!closest.get(order[i].id).has(order[j].id))continue;
    const relocated=[...order],item=relocated.splice(i,1)[0];relocated.splice(j,0,item);consider(relocated);
    if(i<j){const reversed=[...order];reversed.splice(i,j-i+1,...order.slice(i,j+1).reverse());consider(reversed);}
   }
   if(!improvedOrder)break;best=improved;order=improvedOrder;
  }
  if(best.score<winner.score)winner=best;
 }
 return {...winner,baselineMiles,extraMiles:Math.max(0,winner.miles-baselineMiles),detourPercent,maxMiles};
}
export function optimize(stops,settings,onProgress){
 if(!stops.length)return null;
 if(!settings.autoMonth)return optimizeOneMonth(stops,settings);
 const monthResults=[];
 for(let month=1;month<=12;month++){
  const startDate=`${settings.startDate.slice(0,4)}-${String(month).padStart(2,'0')}-01`;
  onProgress?.({completed:month-1,total:12,startDate});
  monthResults.push(optimizeOneMonth(stops,{...settings,autoMonth:false,startDate}));
 }
 const best=[...monthResults].sort((a,b)=>a.score-b.score)[0];
 onProgress?.({completed:12,total:12,startDate:best.startDate});
 return {...best,monthResults,searchYear:settings.startDate.slice(0,4)};
}
export function detours(candidates,order,settings){
 if(!order.length)return [];
 const points=[settings.start,...order,...(settings.end?[settings.end]:[])];
 return candidates.map(s=>{
  let best={extraHours:Infinity,extraMiles:0,after:0};
  for(let i=0;i<points.length-1;i++){
   const a=travel(points[i],s,settings),b=travel(s,points[i+1],settings),direct=travel(points[i],points[i+1],settings);
   const extraHours=Math.max(0,a.hours+b.hours-direct.hours);
   if(extraHours<best.extraHours)best={extraHours,extraMiles:Math.max(0,a.miles+b.miles-direct.miles),after:i};
  }
  return {id:s.id,...best};
 }).filter(s=>s.extraHours<=settings.detourHours).sort((a,b)=>a.extraHours-b.extraHours).slice(0,8);
}

