export function validateRestAssignments(value={},allowed){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Rest placement must list destinations and whole days.');
 const entries=Object.entries(value);
 if(entries.length>600)throw Error('Too many rest placements.');
 for(const [id,days]of entries)if(!id||id.length>100||(allowed&&!allowed.has(id))||!Number.isInteger(days)||days<0||days>365)throw Error('Rest placement needs known destinations and whole days from 0 to 365.');
 return Object.fromEntries(entries.filter(([,days])=>days>0));
}
export function restAfterDays(settings,id){return settings.restAfter?.[id]||0;}
export function restBudget(settings,ids){
 const assignments=validateRestAssignments(settings.restAfter),selected=new Set(ids),total=settings.restDays||0;
 if(!Number.isFinite(total)||total<0||total>365)throw Error('Rest reserve must be between 0 and 365 days.');
 const placed=Object.entries(assignments).reduce((n,[id,days])=>n+(selected.has(id)?days:0),0);
 return {total,placed,unplaced:total-placed,inactive:Object.keys(assignments).filter(id=>!selected.has(id)),overallocated:placed>total};
}
export function requireRestBudget(settings,ids){
 const budget=restBudget(settings,ids);
 if(budget.overallocated)throw Error(`Rest placements use ${budget.placed} days but the reserve has ${budget.total}. Reduce placements or explicitly increase the rest reserve; exploration days were not changed.`);
 return budget;
}
export function restSummary(result){
 return {total:result?.restDays||0,placed:result?.placedRestDays||0,unplaced:result?.unplacedRestDays??result?.restDays??0};
}
