import {accessForMonth} from './seasonal-access.mjs';
const DAY=86400000;
const shift=(s,n)=>new Date(Date.parse(s+'T00:00:00Z')+n*DAY).toISOString().slice(0,10);
const valid=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&shift(s,0)===s;
const labels={major:'Core highlights restricted',transition:'Seasonal transition · verify access',partial:'Some areas / services restricted',legal:'Published park visitor closure',unknown:'Access needs research'};

// Mirrors staySeason's chronological exploration weights. A final morning
// becomes part of a road date without changing its exploration allocation.
export function explorationVisits(result){
 return (result?.visits||[]).flatMap(v=>v.excursion?(result.excursions?.find(b=>b.id===v.id)?.visits||[]):[v]).map(v=>{
  const samples=[],issues=[];
  const add=(date,weight,source)=>{if(weight>0&&valid(date))samples.push({date,weight,source});else if(weight>0)issues.push('Exploration date unavailable.');};
  const arrival=v.sharedDays||0,departure=v.departureSharedDays||0;
  add(v.arrival,arrival,'arrival');
  let remaining=v.days-arrival-departure;
  const start=v.stayStart??(arrival&&valid(v.arrival)?shift(v.arrival,1):v.arrival),end=v.stayEnd??(departure?v.departureDriveDate:v.departure);
  if(valid(start)&&valid(end)&&end>=start&&(Date.parse(end)-Date.parse(start))/DAY<=1500){
   for(let d=start;d<end&&remaining>1e-9;d=shift(d,1)){const weight=Math.min(1,remaining);add(d,weight,'stay');remaining-=weight;}
  }else issues.push('Exploration interval unavailable or unsupported.');
  add(v.departureDriveDate,departure,'departure');
  const evaluatedDays=samples.reduce((n,s)=>n+s.weight,0);
  if(!Number.isFinite(v.days)||Math.abs(evaluatedDays-v.days)>1e-6||remaining< -1e-6)issues.push('Exploration dates do not reconcile with requested days; review the schedule.');
  return {siteId:v.id,requestedDays:v.days,evaluatedDays,samples:samples.sort((a,b)=>a.date.localeCompare(b.date)),issues};
 });
}

function recurringDateMatches(date,temporal){
 if(temporal?.type!=='fixed_recurring_rule')return false;
 const md=date.slice(5);
 return (temporal.intervals||[]).some(i=>{
  if(!/^\d{2}-\d{2}$/.test(i.start)||!/^\d{2}-\d{2}$/.test(i.end))return false;
  const after=i.startInclusive?md>=i.start:md>i.start,before=i.endInclusive?md<=i.end:md<i.end;
  return i.crossYear?after||before:after&&before;
 });
}

export function reviewTripAccess({result,sites=[],audit,research}){
 const lookup=new Map(sites.map(s=>[s.id,s])),visits=[];
 for(const allocation of explorationVisits(result)){
  const site=lookup.get(allocation.siteId);if(site?.type!=='park')continue;
  const record=audit?.parks?.[site.id],evidence=research?.parks?.[site.id],groups=new Map();
  const add=(kind,samples,message,sourceIDs=[],basis='unknown',confidence='unknown',scope='Conventional park visit')=>{
   if(!samples.length)return;
   const key=kind+'|'+message;let warning=groups.get(key);
   if(!warning){warning={kind,label:labels[kind],message,scope,basis,confidence,sourceIDs,checkedDate:research?.researchAsOf||audit?.reviewed||null,recheckRequired:true,affectedDates:[],affectedExplorationDays:0};groups.set(key,warning);}
   for(const sample of samples){if(!warning.affectedDates.includes(sample.date))warning.affectedDates.push(sample.date);warning.affectedExplorationDays+=sample.weight;}
  };
  if(!record||!evidence)add('unknown',allocation.samples,'Seasonal access research is unavailable for this park. Missing information does not establish availability.');
  else{
   for(const kind of ['major','transition','partial'])add(kind,allocation.samples.filter(s=>accessForMonth(audit,site.id,Number(s.date.slice(5,7)))?.level===kind),record.assessment,record.sourceIDs,'modeled_monthly','modeled');
   for(const rule of evidence.accessRules||[])if(rule.scope==='park'&&rule.impact==='full_closure'&&rule.evidenceStatus==='verified_primary_source'){
    add('legal',allocation.samples.filter(s=>recurringDateMatches(s.date,rule.temporal)),rule.rationale,rule.sourceIDs,'published_recurring',rule.confidence,rule.asset);
   }
   for(const service of evidence.services||[])if(service.temporal?.type==='unknown')add('unknown',allocation.samples,service.asset+': '+service.rationale,service.sourceIDs,'unknown',service.confidence,'Transport / service availability');
  }
  for(const issue of allocation.issues){
   const warning={kind:'unknown',label:labels.unknown,message:issue,scope:'Schedule date accounting',basis:'unknown',confidence:'unknown',sourceIDs:[],affectedDates:allocation.samples.map(s=>s.date),affectedExplorationDays:allocation.evaluatedDays,recheckRequired:true};groups.set(issue,warning);
  }
  visits.push({...allocation,displayName:site.shortName||site.name,warnings:[...groups.values()]});
 }
 const counts=Object.fromEntries(['major','transition','partial','legal','unknown'].map(kind=>[kind,visits.filter(v=>v.warnings.some(w=>w.kind===kind)).length]));
 return {visits,counts,affectedStops:visits.filter(v=>v.warnings.some(w=>w.kind!=='unknown')).length,unknownStops:counts.unknown,limitations:['Monthly assessments are approximate guidance for a conventional highlights visit, not exact road opening dates.','Published recurring closures remain subject to recheck. Temporary or year-specific notices are not projected into future travel years.','No flag is not a guarantee of access. Research is a saved snapshot, not live conditions.'],sources:research?.sources||{}};
}

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function accessWarningText(w){
 const dates=[...new Set(w.affectedDates)].sort(),range=dates.length?(dates[0]+(dates.length>1?' through '+dates.at(-1):'')+` (${dates.length} exploration date${dates.length===1?'':'s'}; ${Math.round(w.affectedExplorationDays*100)/100} day equivalents)`):'Dates need review';
 return `${w.label} · ${range}. ${w.message} ${w.basis==='modeled_monthly'?'Modeled monthly guidance; exact dates vary. ':''}Recheck before travel.`;
}
export function accessWarningsHtml(review,{siteId,date}={}){
 if(!review)return '';
 return review.visits.filter(v=>!siteId||v.siteId===siteId).flatMap(v=>v.warnings.filter(w=>!date||w.affectedDates.includes(date)).map(w=>`<div class="access-visit-warning access-${w.kind}"><strong>${esc(v.displayName)} · ${esc(w.label)}</strong><p>${esc(accessWarningText(w))}</p>${(w.sourceIDs||[]).map(id=>review.sources[id]).filter(s=>s&&/^https:\/\/www\.nps\.gov\//.test(s.url)).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join(' · ')}</div>`)).join('');
}
export function accessSummaryHtml(review){
 if(!review)return '';
 const flagged=review.affectedStops||review.unknownStops;
 return `<details class="${flagged?'warning':'estimate-notes'} access-review"><summary>${flagged?`Core access needs review: ${review.affectedStops} park${review.affectedStops===1?'':'s'}${review.unknownStops?` · research gaps: ${review.unknownStops}`:''}`:'Access review · no modeled flags'}</summary>${accessWarningsHtml(review)||'<p>No modeled access flags on these exploration dates.</p>'}<p class="fineprint">${esc(review.limitations.join(' '))}</p></details>`;
}
