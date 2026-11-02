import {planningRules} from './reservation-ui.mjs';
import {siteVisitProfile} from './site-visit-review.mjs';
export const PREPARATION_STATUSES={unchecked:'Not checked',researched:'Researched',ready:'Ready to book',booked:'Booked',unneeded:'Not needed'};
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function validatePreparation(raw={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length>1000)throw Error('Preparation records must be a list of up to 1000 task IDs.');
 const out={};
 for(const [id,r]of Object.entries(raw)){
  if(!/^(trip|park|rule|site):[a-z0-9:_-]{1,170}$/.test(id)||!r||typeof r!=='object'||Array.isArray(r)||(typeof r.status!=='string'||!Object.hasOwn(PREPARATION_STATUSES,r.status))||typeof r.notes!=='string'||r.notes.length>1000)throw Error('Invalid preparation status, task or notes (up to 1000 characters).');
  if((r.checkedOn!==null&&!validDate(r.checkedOn))||(r.forDate!==null&&!validDate(r.forDate)))throw Error('Preparation dates must be valid YYYY-MM-DD dates or blank.');
  out[id]={status:r.status,notes:r.notes,checkedOn:r.checkedOn,forDate:r.forDate};
 }
 return out;
}
const safe=url=>{try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
export function buildPreparationTasks({state,sites,result,research}){
 const lookup=new Map(sites.map(s=>[s.id,s])),selected=state.selected.map(id=>lookup.get(id)).filter(Boolean),visits=(result?.visits||[]).flatMap(v=>v.excursion?result.excursions?.find(b=>b.id===v.id)?.visits||[]:[v]),dates=new Map(visits.map(v=>[v.id,v.arrival]));
 const tasks=[],add=t=>{const record=state.preparation?.[t.id]||{status:'unchecked',notes:'',checkedOn:null,forDate:t.visitDate};tasks.push({...t,...record,recorded:!!state.preparation?.[t.id],calculated:!!result,contextChanged:!!result&&!!state.preparation?.[t.id]&&record.forDate!==t.visitDate});};
 const logistics=[['overnights','Overnight stops','Choose campsites or lodging and verify any reservations. Park and gateway overnight bases are unassigned.'],['transport','Transport and access','Verify road access, flight connections, ferries, local transfers and operator availability for your dates.'],['vehicle','Vehicle and border arrangements','Check truck/camper suitability, storage, recovery, rentals and any border arrangements that apply.'],['cat-care','Cat care','Plan pet access restrictions, boarding or care during excursions, and overnight arrangements.']];
 if(selected.length)for(const [key,title,summary]of logistics)add({id:'trip:'+key,siteId:null,place:'Whole trip',title,summary,url:null,visitDate:result?.startDate||state.settings.startDate,researchAsOf:null});
 for(const site of selected.filter(s=>s.type==='park')){
  const park=research?.parks?.[site.id],visitDate=dates.get(site.id)||null;
  add({id:'park:'+site.id+':access',siteId:site.id,place:site.name||site.shortName,title:'Verify access and entry',summary:'Verify current roads, park access, permits and services for your travel year. Published research does not establish future requirements.',url:safe(site.url),visitDate,researchAsOf:park?.reviewedAt||null});
  for(const rule of planningRules(park))add({id:'rule:'+site.id+':'+rule.ruleID,siteId:site.id,place:site.name||site.shortName,title:rule.name,summary:rule.summary+' '+(rule.programYear?'Published program year: '+rule.programYear+'. ':'')+'Recheck the scoped activity, release rounds, exceptions and travel-year applicability with the issuing authority. No deadline or availability is inferred.',url:safe(rule.bookingURL)||safe((rule.sourceIDs||[]).map(id=>research.sources?.[id]?.url).find(safe))||safe(site.url),visitDate,researchAsOf:park.reviewedAt});
 }
 for(const site of selected.filter(s=>s.type==='site')){
  const p=siteVisitProfile(site);if(!p)continue;
  add({id:'site:'+site.id+':visit',siteId:site.id,place:site.name||site.shortName,title:p.discovery==='not-public'?'Resolve non-public site selection':'Verify the family outing and access',summary:`Fast outing: ${p.fastScope} Slow outing: ${p.slowScope} ${p.caveat} These are editorial time estimates, not verified future bookings or opening-hour fits.`,url:safe(p.reference),visitDate:dates.get(site.id)||null,researchAsOf:p.sourceChecked});
 }
 return tasks;
}
export function preparationSummary(tasks){
 const counts=Object.fromEntries(Object.keys(PREPARATION_STATUSES).map(k=>[k,tasks.filter(t=>t.status===k).length]));
 return {...counts,total:tasks.length,review:tasks.filter(t=>t.contextChanged).length};
}
export const preparationText=t=>`${t.title} · User status: ${PREPARATION_STATUSES[t.status]||'Not checked'}${t.checkedOn?' · checked '+t.checkedOn:''}${t.visitDate?' · visit/departure '+t.visitDate:' · visit dates not calculated'}${t.contextChanged?' · DATE CHANGED: review this record (saved for '+(t.forDate||'uncalculated dates')+')':''}${t.notes?' · '+t.notes:''}`;

export function preparationTaskLabel(id,sites,research){
 const [kind,siteId,...rest]=id.split(':'),site=sites.find(s=>s.id===siteId),name=site?.shortName||site?.name||'Previous destination';
 if(kind==='trip')return 'Whole trip · '+({overnights:'Overnight stops',transport:'Transport and access',vehicle:'Vehicle and border arrangements','cat-care':'Cat care'}[siteId]||'Previous logistics topic');
 return name+' · '+(kind==='park'?'Verify access and entry':kind==='site'?'Verify the family outing and access':research?.parks?.[siteId]?.rules?.find(r=>r.ruleID===rest.join(':'))?.name||'Previous research topic');
}
