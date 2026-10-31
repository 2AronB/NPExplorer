import {siteStay} from './site-stays.mjs';
import {detours,schedule} from './optimizer.mjs';
import {validVisitDays,durationHelp} from './visit-durations.mjs';
export function displayedOrder(result,sites){
 const lookup=new Map([...sites,...result?.nodes||[]].map(s=>[s.id,s]));
 const order=(result?.order||[]).map(id=>lookup.get(id));
 if(order.some(s=>!s))throw Error('Recalculate the route before previewing extra stops.');
 return order;
}
export function alongCandidates({state,sites,result}){
 if(!result)return [];
 const selected=new Set(state.selected),lookup=new Map(sites.map(s=>[s.id,s])),order=displayedOrder(result,sites);
 return detours(sites.filter(s=>s.type==='site'&&!s.remote&&!selected.has(s.id)),order,state.settings,{limit:Infinity}).map(d=>({
  ...d,site:lookup.get(d.id),from:order[d.after-1]||state.settings.start,to:order[d.after]||state.settings.end||null,
  days:state.days[d.id]??siteStay(lookup.get(d.id),state.settings.stayMode)?.days??.25
 }));
}
const individual=result=>(result.visits||[]).flatMap(v=>v.excursion?result.excursions?.find(b=>b.id===v.id)?.visits||[]:[v]);
export function previewAlong({state,sites,result,id,days}){
 if(!result)throw Error('Calculate a route before previewing an extra stop.');
 const insertion=alongCandidates({state,sites,result}).find(d=>d.id===id);
 if(!insertion)throw Error('This stop is selected or exceeds the current added-driving limit.');
 if(!validVisitDays(insertion.site,days))throw Error(durationHelp(insertion.site));
 const order=displayedOrder(result,sites),stop={...insertion.site,days};order.splice(insertion.after,0,stop);
 const proposed={...schedule(order,state.settings,result.startDate),nodes:order.filter(s=>s.excursion)};
 const old=new Map(individual(result).map(v=>[v.id,v])),names=new Map(sites.map(s=>[s.id,s.shortName||s.name]));
 const shifts=individual(proposed).filter(v=>old.has(v.id)&&(old.get(v.id).arrival!==v.arrival||old.get(v.id).departure!==v.departure)).map(v=>({id:v.id,name:names.get(v.id)||v.id,before:old.get(v.id).arrival,after:v.arrival,beforeEnd:old.get(v.id).departure,afterEnd:v.departure}));
 return {id,days,insertion,proposed,shifts,visitHours:days*(state.settings.explorationHours??8),extraHours:proposed.hours-result.hours,extraMiles:proposed.miles-result.miles,extraCalendarDays:proposed.totalDays-result.totalDays,
  beforeConflicts:(result.windowConflicts||0)+(result.appointmentConflicts||0),afterConflicts:proposed.windowConflicts+proposed.appointmentConflicts,
  beforeLateDays:(result.windowLateDays||0)+(result.appointmentLateDays||0),afterLateDays:proposed.windowLateDays+proposed.appointmentLateDays,
  beforeServiceConflicts:(result.excursions||[]).filter(b=>!(b.serviceFeasible??b.feasible)).length,afterServiceConflicts:proposed.excursions.filter(b=>!(b.serviceFeasible??b.feasible)).length};
}
