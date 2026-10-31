import {arrivalWindowText} from './arrival-windows.mjs';
import {restSummary} from './rest-days.mjs';
export const SCENARIO_KEY='long-way-scenarios-v1';
export const MAX_SCENARIOS=8;
export const SCENARIO_SCHEMA=1;
export function dataFingerprint(value){
 let hash=2166136261;for(const c of JSON.stringify(value)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16);
}
export function resultVersionMatches(snapshot,versions){return !!snapshot.result&&JSON.stringify(snapshot.versions)===JSON.stringify(versions);}
export function createSnapshot({id,name,state,sites,result,accessReview,versions,now=new Date().toISOString()}){
 name=String(name??'').trim();if(!name||name.length>80)throw Error('Use a trip name between 1 and 80 characters.');
 // Save the displayed month only. Nested alternatives needlessly multiply storage.
 const chosen=result?{...result}:null;if(chosen){delete chosen.monthResults;delete chosen.searchYear;}
 const selected=new Set(state.selected),savedSites=sites.filter(s=>selected.has(s.id));
 const savedReview=chosen&&accessReview?{...accessReview,sources:Object.fromEntries([...new Set((accessReview.visits||[]).flatMap(v=>v.warnings.flatMap(w=>w.sourceIDs||[])))].filter(id=>accessReview.sources?.[id]).map(id=>[id,accessReview.sources[id]]))}:null;
 return structuredClone({id,name,savedAt:now,state,sites:savedSites,result:chosen,accessReview:savedReview,versions});
}

// Persist first, then publish the new in-memory library. Quota failures cannot
// erase a scenario or replace the active plan during restore.
export function openScenarioStore(storage,validatePlan){
 let library={schemaVersion:SCENARIO_SCHEMA,items:[],recovery:null},error=null,raw=null;
 try{
  raw=storage.getItem(SCENARIO_KEY);
  if(raw){
   const saved=JSON.parse(raw);
   if(saved?.schemaVersion!==SCENARIO_SCHEMA||!Array.isArray(saved.items)||saved.items.length>MAX_SCENARIOS)throw Error('Unrecognized saved-trip library version.');
   const all=[...saved.items,...saved.recovery?[saved.recovery]:[]],ids=new Set();
   for(const item of all){
    if(!item||typeof item.id!=='string'||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>80||!Array.isArray(item.sites)||!item.versions||!Number.isFinite(Date.parse(item.savedAt)))throw Error('Invalid saved-trip snapshot.');
    ids.add(item.id);const normalized=validatePlan(item.state);
    if(normalized.selected.length!==item.state.selected.length)throw Error('A saved trip includes unrecognized destinations. Export the library recovery copy to reconcile them.');
    if(JSON.stringify(normalized)!==JSON.stringify(item.state)){item.state=normalized;item.versions={...item.versions,migrated:true};}
   }
   library=saved;
  }
 }catch(e){error=e.message;}
 function commit(next){
  if(error)throw Error('Saved-trip library could not be loaded. Export its recovery copy before changing it. '+error);
  let current;try{current=storage.getItem(SCENARIO_KEY);}catch{throw Error('Browser storage is unavailable. Existing trips were kept.');}
  if(current!==raw)throw Error('Saved trips changed in another tab. Reload before editing the library; existing trips were kept.');
  const serialized=JSON.stringify(next);
  try{storage.setItem(SCENARIO_KEY,serialized);}catch{throw Error('Could not save trips: browser storage is full or unavailable. Export a JSON backup; existing trips were kept.');}
  raw=serialized;library=structuredClone(next);
 }
 return {
  get items(){return structuredClone(library.items);},get recovery(){return structuredClone(library.recovery);},get error(){return error;},get raw(){return raw;},
  save(snapshot){if(library.items.length>=MAX_SCENARIOS)throw Error(`Keep up to ${MAX_SCENARIOS} named trips. Export or delete an alternative before saving another.`);commit({...library,items:[...library.items,snapshot]});},
  rename(id,name){name=String(name).trim();if(!name||name.length>80)throw Error('Use a trip name between 1 and 80 characters.');commit({...library,items:library.items.map(item=>item.id===id?{...item,name}:item)});},
  remove(id){commit({...library,items:library.items.filter(item=>item.id!==id)});},
  preserveRecovery(snapshot){commit({...library,recovery:snapshot});}
 };
}

export function comparisonMetrics(result,review){
 if(!result)return null;
 return {days:result.totalDays,miles:result.miles,hours:result.hours,quality:result.quality,mixed:result.mixedDays,dedicated:result.dedicatedTravelDays+result.transferDays,waits:result.waitDays,restPlaced:restSummary(result).placed,restUnplaced:restSummary(result).unplaced,access:review?.affectedStops??null,unknown:review?.unknownStops??null,appointments:result.appointmentConflicts||0,arrivalConflicts:result.windowConflicts||0,arrivalWaits:result.windowWaitDays||0};
}

// Explain the assumptions behind different totals, using resolved destination
// values so stay presets and explicit per-park overrides compare consistently.
export function inputDifferences(active,saved){
 const rows=[],a=active.state.settings,b=saved.state.settings;
 const add=(label,left,right)=>{if(JSON.stringify(left)!==JSON.stringify(right))rows.push({label,active:String(left??'—'),saved:String(right??'—')});};
 const names=new Map([...active.sites,...saved.sites].map(s=>[s.id,s.shortName||s.name||s.id]));
 const left=new Set(active.state.selected),right=new Set(saved.state.selected);
 const removed=[...left].filter(id=>!right.has(id)),added=[...right].filter(id=>!left.has(id));
 if(removed.length||added.length)rows.push({label:'Selected destinations',active:removed.length?'Only here: '+removed.map(id=>names.get(id)||id).join(', '):'All also in saved trip',saved:added.length?'Only here: '+added.map(id=>names.get(id)||id).join(', '):'All also in active trip'});
 const settings={startDate:'Saved departure date',autoMonth:'Search all departure months',duration:'Trip target · days',objective:'Route priority',pace:'Driving pace',endMode:'Finish strategy',stayMode:'Park stay preset',restDays:'Rest reserve · days',sharedDays:'Share driving / exploration days',comfort:'Comfortable driving · hours',stretch:'Stretch driving · hours',maxDrive:'Driving ceiling · hours',seasonDetourPercent:'Extra seasonal driving · %',dayBudget:'Daily activity budget · hours',explorationHours:'Full exploration day · hours',setupHours:'Camp setup · hours',teardownHours:'Camp teardown · hours',averageMph:'Estimated driving · mph',distanceFactor:'Road-distance multiplier',breakPercent:'Stop allowance · %',detourHours:'Optional detour limit · hours',alaskaMode:'Alaska strategy',remoteBufferDays:'Regional contingency · days',flightDayHours:'Flight day · hours',remoteRoadMph:'Regional driving · mph'};
 const labels={season:'Seasonal fit',shortest:'Less driving',quiet:'Quieter months',balanced:'Balanced',relaxed:'Relaxed',efficient:'Fewer transfer days',return:'Return home',open:'Open-ended',custom:'Different finish',park:'Comfortable Exploration',highlights:'Hit the Highlights',uniform:'Uniform days',compare:'Compare drive / fly',fly:'Fly',drive:'Drive via Canada'};
 const format=value=>typeof value==='boolean'?(value?'Yes':'No'):labels[value]??value;
 for(const [key,label]of Object.entries(settings))add(label,format(a[key]),format(b[key]));
 const point=p=>p?`${p.name} (${p.lat}, ${p.lng})`:'—';
 add('Start',point(a.start),point(b.start));if(a.endMode==='custom'||b.endMode==='custom')add('Custom finish',a.endMode==='custom'?point(a.endLocation):'Not used',b.endMode==='custom'?point(b.endLocation):'Not used');
 add('Enabled mainland airports',[...(a.airportCodes||[])].sort().join(', '),[...(b.airportCodes||[])].sort().join(', '));
 const airports=list=>(list||[]).map(p=>p.code+': '+point(p)).sort().join('; ')||'None';
 add('Custom mainland airports',airports(a.customAirports),airports(b.customAirports));
 const savedSites=new Map(saved.sites.map(s=>[s.id,s]));
 for(const site of active.sites){
  const other=savedSites.get(site.id);if(!other||!left.has(site.id)||!right.has(site.id))continue;
  const name=names.get(site.id);add(name+' · name',site.shortName||site.name,other.shortName||other.name);add(name+' · exploration days',site.days,other.days);add(name+' · priority /5',site.priority??1,other.priority??1);
  add(name+' · arrival window',arrivalWindowText(a.arrivalWindows?.[site.id]),arrivalWindowText(b.arrivalWindows?.[site.id]));
  add(name+' · rest after visit',a.restAfter?.[site.id]||0,b.restAfter?.[site.id]||0);
  add(name+' · first full day',site.fixedDate||'Flexible',other.fixedDate||'Flexible');
  add(name+' · monthly scores Jan–Dec',site.profile?.scores?.join(', ')||'Default scores',other.profile?.scores?.join(', ')||'Default scores');
  add(name+' · quieter months',(site.profile?.quiet||[]).join(', ')||'None',(other.profile?.quiet||[]).join(', ')||'None');
  const window=w=>w?`${w.start} through ${w.end}`:'No annual window';
  add(name+' · annual closure',window(site.closure),window(other.closure));add(name+' · transport window',window(site.remote?.window),window(other.remote?.window));
 }
 if(active.result&&saved.result)add('Displayed route departure',active.result.startDate,saved.result.startDate);
 return rows;
}
