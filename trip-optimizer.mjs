import {optimize,schedule,detours,routeMiles} from './optimizer.mjs';
import {MAINLAND_AIRPORTS,REGION_NAMES,CANADA_CORRIDOR,REMOTE_DEFAULTS} from './remote-parks.mjs';
export function airportCandidates(settings){
 const all=[...MAINLAND_AIRPORTS,...(settings.customAirports||[])];
 return all.filter(a=>(settings.airportCodes||REMOTE_DEFAULTS.airportCodes).includes(a.code));
}
function options(region,parks,settings){
 const make=(mode,airport)=>{const p=mode==='drive'?CANADA_CORRIDOR[0]:airport;return {id:`excursion-${region}`,name:REGION_NAMES[region]+' excursion',shortName:REGION_NAMES[region]+' · '+(mode==='drive'?'drive via Canada':'fly from '+airport.code),lat:p.lat,lng:p.lng,days:0,type:'excursion',excursion:{region,mode,airport:mode==='drive'?null:airport,parks}};};
 const out=region==='alaska'&&settings.alaskaMode==='drive'?[]:airportCandidates(settings).map(a=>make('fly',a));
 if(region==='alaska'&&settings.alaskaMode!=='fly')out.push(make('drive',null));
 if(!out.length)throw Error('Select at least one mainland airport for flying excursions.');
 return region==='pacific'?out.flatMap(node=>['hawaii-first','samoa-first'].flatMap(pacificOrder=>[false,true].map(reverseIslands=>({...node,excursion:{...node.excursion,pacificOrder,reverseIslands}})))):out;
}
function bestInsertion(order,candidates,settings){
 let best=null;const byMode=new Map();
 for(const node of candidates)for(let gap=0;gap<=order.length;gap++){
  const proposed=[...order.slice(0,gap),node,...order.slice(gap)],r=schedule(proposed,settings);
  const item={node,gap,order:proposed,result:r};
  if(!best||r.score<best.result.score)best=item;
  if(!byMode.has(node.excursion.mode)||r.score<byMode.get(node.excursion.mode).result.score)byMode.set(node.excursion.mode,item);
 }
 return {best,byMode};
}
function oneMonthLayout(stops,settings,combined=false){
 const mainland=stops.filter(s=>!s.remote),remote=stops.filter(s=>s.remote),groups=new Map();
 for(const s of remote){const key=s.remote.region;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(s);}
 if(combined&&groups.has('hawaii')&&groups.has('samoa')){groups.set('pacific',[...groups.get('hawaii'),...groups.get('samoa')]);groups.delete('hawaii');groups.delete('samoa');}
 const land=mainland.length?optimize(mainland,{...settings,autoMonth:false}):null;
 const lookup=new Map(mainland.map(s=>[s.id,s]));let order=land?land.order.map(id=>lookup.get(id)):[];
 const variants=new Map([...groups].map(([region,parks])=>[region,options(region,parks,settings)]));
 // Alaska first: its restrictive transport season matters most. Revisit each
 // inserted block after all others are present to account for shifted dates.
 const regions=[...groups.keys()].sort((a,b)=>(a==='alaska'?-1:b==='alaska'?1:a.localeCompare(b)));
 for(const region of regions)order=bestInsertion(order,variants.get(region),settings).best.order;
 const comparisons=[];
 for(const region of regions){
  const without=order.filter(s=>s.excursion?.region!==region),choice=bestInsertion(without,variants.get(region),settings);order=choice.best.order;
  comparisons.push({region,chosen:choice.best.node.excursion.mode,airportsTested:variants.get(region).filter(s=>s.excursion.mode==='fly').length,alternatives:[...choice.byMode].map(([mode,item])=>{const b=item.result.excursions.find(e=>e.region===region);return {mode,airport:item.node.excursion.airport?.code||null,score:item.result.score,tripDays:item.result.totalDays,miles:item.result.miles,drivingHours:item.result.hours,flightHours:item.result.flightHours,quality:item.result.quality,excursionQuality:b.quality,depart:b.depart,returnDate:b.returnDate,waitDays:b.wait,blockDays:b.days,feasible:b.feasible};})});
 }
 // Re-score short mainland rearrangements after excursions shift visit dates.
 // Preserve the geographic budget on the mainland stops themselves.
 let polished=schedule(order,settings);
 for(let pass=0;pass<2;pass++){
  let winner=null;
  for(let i=0;i<order.length-1;i++)for(let size=2;size<=4&&i+size<=order.length;size++){
   if(order.slice(i,i+size).some(s=>s.excursion))continue;
   const proposed=[...order];proposed.splice(i,size,...order.slice(i,i+size).reverse());
   if(land&&routeMiles(proposed.filter(s=>!s.excursion),settings)>land.maxMiles)continue;
   const candidate=schedule(proposed,settings);
   if(candidate.score<polished.score&&(!winner||candidate.score<winner.result.score))winner={order:proposed,result:candidate};
  }
  if(!winner)break;order=winner.order;polished=winner.result;
 }
 // Refresh comparison metrics with every other block in its final position.
 for(const comparison of comparisons){
  const region=comparison.region,without=order.filter(s=>s.excursion?.region!==region);
  const choice=bestInsertion(without,variants.get(region),settings);
  comparison.alternatives=[...choice.byMode].map(([mode,item])=>{const b=item.result.excursions.find(e=>e.region===region);return {mode,airport:item.node.excursion.airport?.code||null,score:item.result.score,tripDays:item.result.totalDays,miles:item.result.miles,drivingHours:item.result.hours,flightHours:item.result.flightHours,quality:item.result.quality,excursionQuality:b.quality,depart:b.depart,returnDate:b.returnDate,waitDays:b.wait,blockDays:b.days,feasible:b.feasible};});
 }
 const r=schedule(order,settings);
 // The highlighted comparison must describe the actual chosen itinerary,
 // even when a later local move makes another insertion look competitive.
 for(const c of comparisons){const b=r.excursions.find(e=>e.region===c.region);c.alternatives=c.alternatives.map(a=>a.mode!==b.mode?a:{mode:b.mode,airport:b.airport?.code||null,score:r.score,tripDays:r.totalDays,miles:r.miles,drivingHours:r.hours,flightHours:r.flightHours,quality:r.quality,excursionQuality:b.quality,depart:b.depart,returnDate:b.returnDate,waitDays:b.wait,blockDays:b.days,feasible:b.feasible});}
 const mainlandMiles=routeMiles(order.filter(s=>!s.excursion),settings);
 return {...r,nodes:order.filter(s=>s.excursion),remoteComparisons:comparisons,requestedIds:stops.map(s=>s.id),baselineMiles:land?.baselineMiles||0,extraMiles:Math.max(0,mainlandMiles-(land?.baselineMiles||0)),detourPercent:land?.detourPercent||0,maxMiles:land?.maxMiles||0,mainlandMiles};
}
function oneMonth(stops,settings){
 const separate=oneMonthLayout(stops,settings);
 if(!stops.some(s=>s.remote?.region==='hawaii')||!stops.some(s=>s.remote?.region==='samoa'))return separate;
 const combined=oneMonthLayout(stops,settings,true),chosen=combined.score<separate.score?combined:separate;
 return {...chosen,pacificComparison:{chosen:chosen===combined?'combined':'separate',alternatives:[['separate',separate],['combined',combined]].map(([strategy,r])=>({strategy,score:r.score,days:r.totalDays,flightHours:r.flightHours,quality:r.quality,feasible:!r.appointmentConflicts&&r.excursions.every(e=>e.feasible),airports:r.excursions.filter(e=>['hawaii','samoa','pacific'].includes(e.region)).map(e=>e.airport?.code),order:r.excursions.find(e=>e.region==='pacific')?.visits.map(v=>v.id)||[]}))}};
}
export function optimizeTrip(stops,settings,onProgress){
 if(!stops.some(s=>s.remote))return optimize(stops,settings,onProgress);
 const s={...REMOTE_DEFAULTS,...settings};
 if(!s.autoMonth)return oneMonth(stops,s);
 const monthResults=[];
 for(let month=1;month<=12;month++){
  const startDate=`${s.startDate.slice(0,4)}-${String(month).padStart(2,'0')}-01`;
  onProgress?.({completed:month-1,total:12,startDate});monthResults.push(oneMonth(stops,{...s,autoMonth:false,startDate}));
 }
 const best=[...monthResults].sort((a,b)=>a.score-b.score)[0];onProgress?.({completed:12,total:12,startDate:best.startDate});
 return {...best,monthResults,searchYear:s.startDate.slice(0,4)};
}
export function tripDetours(candidates,result,lookup,settings){
 const nodes=new Map([...(result.nodes||[]).map(s=>[s.id,s]),...lookup]);
 return detours(candidates.filter(s=>!s.remote),result.order.map(id=>nodes.get(id)),settings);
}
