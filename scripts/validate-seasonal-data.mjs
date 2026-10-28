import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {currentInventory} from '../current-inventory.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
const root=new URL('../',import.meta.url);
const load=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const inventory=[...currentInventory(load('data/sites.json').sites).filter(s=>s.type==='park'),...REMOTE_PARKS];
const dims=['accessRules','experienceWindows','climateNotes','crowdEvidence','services'];
const temporalTypes=['fixed_recurring_rule','typical_weather_dependent_range','current_year_published_schedule','temporary_alert','unknown','historical_measurement'];
const impacts=['open_baseline','open_window','full_closure','highlights_restricted','through_route_unavailable','limited_access','alternative_mode_required','advisory'];
const date=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const md=s=>/^\d{2}-\d{2}$/.test(s)&&date('2000-'+s);
export function validate(data,{pilot=false}={}){
 const errors=[];const check=(ok,msg)=>{if(!ok)errors.push(msg);};
 check(data.schemaVersion==='1.0.0-proposal','schemaVersion');
 check(date(data.researchAsOf),'researchAsOf');
 check(data.numericPolicy?.status==='modeled_judgment'&&data.numericPolicy?.officialNPSRating===false,'numeric labeling');
 const expected=(pilot?['romo','yell']:inventory.map(p=>p.id)).sort();
 check(JSON.stringify(Object.keys(data.parks).sort())===JSON.stringify(expected),'runtime park IDs');
 const ids=new Set(), signatures=new Set(),claims=[];const counts={parks:Object.keys(data.parks).length,sources:Object.keys(data.sources).length,claims:0,verifiedPrimary:0,officialQualitative:0,officialMeasured:0,inferredFromPrimary:0,measuredParkYears:0,modeledMonthValues:0,unknownEntries:0,temporalTypes:{},dimensions:{}};
 for(const [key,s] of Object.entries(data.sources)){
  check(/^https:\/\/(www\.|home\.|irma\.)?nps\.gov\//.test(s.url),`${key}: primary URL`);
  check(!!s.title&&!!s.issuingAuthority&&!!s.evidenceType,`${key}: source metadata`);
  check(date(s.checkedDate)&&s.checkedDate<=data.researchAsOf,`${key}: checkedDate`);
 }
 for(const [id,p] of Object.entries(data.parks)){
  check(p.siteID===id&&!!p.name,`${id}: identity`);
  check(Array.isArray(p.unknowns)&&Array.isArray(p.reviewNotes),`${id}: research notes`);
  counts.unknownEntries+=p.unknowns?.length||0;
  for(const dim of dims){
   check(Array.isArray(p[dim]),`${id}: ${dim}`);
   if(!Array.isArray(p[dim]))continue;
   counts.dimensions[dim]=(counts.dimensions[dim]||0)+Number(p[dim].length>0);
   if(!p[dim].length)check(p.unknowns.some(u=>u.dimension===dim),`${id}: undeclared empty ${dim}`);
   for(const c of p[dim]){
    counts.claims++;claims.push(c); check(!ids.has(c.id),`${c.id}: duplicate ID`);ids.add(c.id);
    const sig=JSON.stringify([id,dim,c.asset,c.rationale]);check(!signatures.has(sig),`${c.id}: duplicate claim`);signatures.add(sig);
    check(c.id.startsWith(id+'-'),`${c.id}: ID prefix`);
    check(!!c.asset&&!!c.rationale&&!!c.uncertainty&&!!c.recheck,`${c.id}: claim text`);
    check(['high','medium','low'].includes(c.confidence),`${c.id}: confidence`);
    check(['verified_primary_source','official_qualitative','official_measured','inferred_from_primary'].includes(c.evidenceStatus),`${c.id}: evidenceStatus`);
    if(c.evidenceStatus==='official_measured'){
     counts.officialMeasured++;
     check(c.sourceIDs.every(s=>new URL(data.sources[s].url).searchParams.get('Park')?.toLowerCase()===id),`${c.id}: report park ID`);
     check(c.temporal?.type==='historical_measurement'&&c.measurement?.metric==='recreation_visits',`${c.id}: measurement schema`);
     for(const [year,row] of Object.entries(c.measurement?.series||{})){
      counts.measuredParkYears++;check(['2023','2024','2025'].includes(year)&&c.temporal.years.includes(Number(year)),`${c.id}: measured year`);
      check(row.months?.length===12&&row.months.every(n=>Number.isInteger(n)&&n>=0),`${c.id}: measured months`);
      check(row.months?.reduce((a,b)=>a+b,0)===row.total,`${c.id}: measured annual sum`);
     }
    }
    counts.verifiedPrimary+=Number(c.evidenceStatus==='verified_primary_source');counts.officialQualitative+=Number(c.evidenceStatus==='official_qualitative');
    counts.inferredFromPrimary+=Number(c.evidenceStatus==='inferred_from_primary');
    check(impacts.includes(c.impact),`${c.id}: impact`);
    check(Array.isArray(c.transportModes)&&c.transportModes.length>0,`${c.id}: transportModes`);
    check(c.sourceIDs?.length>0&&c.sourceIDs.every(s=>data.sources[s]),`${c.id}: source reference`);
    check(date(c.checkedDate)&&c.checkedDate<=data.researchAsOf,`${c.id}: checked date`);
    check(c.sourceIDs?.every(s=>!data.sources[s]||data.sources[s].checkedDate===c.checkedDate),`${c.id}: claim/source dates`);
    const t=c.temporal||{};check(temporalTypes.includes(t.type)&&!!t.label&&Array.isArray(t.intervals),`${c.id}: temporal schema`);
    counts.temporalTypes[t.type]=(counts.temporalTypes[t.type]||0)+1;
    if(t.type==='unknown')check(t.intervals?.length===0&&t.year===null,`${c.id}: unknown calendar`);
    if(t.type==='historical_measurement')check(t.intervals?.length===0&&Array.isArray(t.years)&&t.years.every(y=>y<Number(data.researchAsOf.slice(0,4))),`${c.id}: completed historical years`);
    if(t.type==='typical_weather_dependent_range')check(t.year===null,`${c.id}: typical year`);
    if(t.type==='fixed_recurring_rule')check(t.year===null,`${c.id}: recurring year`);
    if(t.type==='temporary_alert')check(t.recheckRequired===true&&Number.isInteger(t.year)&&(t.validUntil===null||date(t.validUntil)),`${c.id}: alert recheck/expiry`);
    if(t.type==='current_year_published_schedule')check(Number.isInteger(t.year)&&t.intervals?.length>0,`${c.id}: dated schedule`);
    for(const i of t.intervals||[]){
     const full=t.type==='current_year_published_schedule';check((full?date(i.start)&&date(i.end):md(i.start)&&md(i.end)),`${c.id}: interval date bounds`);
     check(typeof i.startInclusive==='boolean'&&typeof i.endInclusive==='boolean'&&typeof i.crossYear==='boolean',`${c.id}: interval inclusivity`);
     if(full){check(i.start<=i.end,`${c.id}: reversed dated interval`);check(Number(i.start.slice(0,4))===t.year,`${c.id}: schedule year`);check(i.crossYear===(i.start.slice(0,4)!==i.end.slice(0,4)),`${c.id}: dated cross-year`);}else check(i.crossYear===(i.start>i.end),`${c.id}: annual cross-year`);
     if(i.daysOfWeek)check(i.daysOfWeek.every(d=>Number.isInteger(d)&&d>=1&&d<=7),`${c.id}: ISO weekdays`);
    }
    for(const r of t.calendarRules||[])check(r.month>=1&&r.month<=12&&r.weekday>=1&&r.weekday<=7&&r.ordinal>=1&&r.ordinal<=5,`${c.id}: calendar rule`);
    if(c.impact==='full_closure')check(c.scope==='park'&&t.type==='fixed_recurring_rule'&&c.consumerDecisions.includes('confirmed_legal_infeasibility'),`${c.id}: full-closure scope`);
    if(c.scope==='road')check(!!c.role&&Array.isArray(c.affectedGateways)&&!!c.alternateAccess&&['some','all','none','unknown'].includes(c.essentialHighlightsReachable),`${c.id}: road topology metadata`);
   }
  }
  for(const key of ['highlightsSuitability','hikingSuitability','crowdPressure']){
   const vector=p.monthlyModels?.[key];
   check(vector===null||Array.isArray(vector),`${id}: ${key} unknown representation`);
   if(!Array.isArray(vector))continue;
   check(vector.length===12,`${id}: monthly length`);
   vector.forEach((m,i)=>{counts.modeledMonthValues++;check(m.month===i+1,`${id}: month order`);check(m.value===null||(typeof m.value==='number'&&m.value>=0&&m.value<=10),`${id}: score range`);check(m.status==='modeled_judgment'&&!!m.rationale&&!!m.uncertainty,`${id}: modeled provenance`);check(m.claimIDs?.length>0&&m.claimIDs.every(k=>p[dims.find(d=>p[d].some(c=>c.id===k))||'accessRules'].some(c=>c.id===k)),`${id}: model claim reference`);});
   if(key==='crowdPressure'){
    const measured=p.crowdEvidence.find(c=>c.evidenceStatus==='official_measured');
    const rows=Object.values(measured?.measurement.series||{});
    const means=Array.from({length:12},(_,i)=>rows.reduce((n,r)=>n+r.months[i],0)/rows.length),peak=Math.max(...means);
    check(vector.every((m,i)=>m.value===Math.round(100*means[i]/peak)/10),`${id}: crowd formula`);
   }
  }
 }
 // Exact same asset/calendar with opposing access implications requires a declared conflict.
 const groups=new Map();for(const c of claims){const key=JSON.stringify([c.id.split('-')[0],c.scope,c.asset,c.temporal]);const prev=groups.get(key);if(prev&&prev.impact!==c.impact)check(!!c.conflictNote,`${c.id}: undeclared contradictory calendar`);groups.set(key,c);}
 return {ok:errors.length===0,errors,counts};
}
const path=fileURLToPath(new URL('../data/seasonal-research/seasonal-access.json',import.meta.url));
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const data=load('data/seasonal-research/seasonal-access.json');
 const pilot=process.argv.includes('--pilot');if(pilot)data.parks=Object.fromEntries(['romo','yell'].map(id=>[id,data.parks[id]]));
 const result=validate(data,{pilot});
 if(process.argv.includes('--self-test')){
  const mutations=[d=>{delete d.parks.romo;},d=>{d.parks.romo.accessRules[0].sourceIDs=['missing'];},d=>{d.parks.romo.accessRules[0].temporal.intervals[0].start='02-30';},d=>{d.parks.romo.monthlyModels.hikingSuitability[0].value=11;},d=>{d.parks.romo.accessRules[1].impact='full_closure';},d=>{d.parks.yell.accessRules[3].temporal.year=2040;},d=>{d.parks.romo.accessRules.push(d.parks.romo.accessRules[0]);},d=>{d.parks.romo.monthlyModels.crowdPressure[0].value=9.9;}];
  for(const mutate of mutations){const bad=structuredClone(data);mutate(bad);assert.equal(validate(bad,{pilot}).ok,false,'invalid data must fail');}
  result.negativeChecks=mutations.length;
 }
 console.log(JSON.stringify(result,null,2));
 if(!pilot&&result.ok)fs.writeFileSync(new URL('../data/seasonal-research/validation-summary.json',import.meta.url),JSON.stringify({checkedDate:data.researchAsOf,dataset:path.split(/[\\/]/).at(-1),...result},null,2)+'\n');
 if(!result.ok)process.exitCode=1;
}
