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
    ids.add(item.id);validatePlan(item.state);
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
 return {days:result.totalDays,miles:result.miles,hours:result.hours,quality:result.quality,mixed:result.mixedDays,dedicated:result.dedicatedTravelDays+result.transferDays,waits:result.waitDays,access:review?.affectedStops??null,unknown:review?.unknownStops??null,appointments:result.appointmentConflicts||0};
}
