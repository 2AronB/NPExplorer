import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {currentInventory} from '../current-inventory.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';

const root=new URL('../',import.meta.url);
export const readData=()=>JSON.parse(fs.readFileSync(new URL('data/reservation-requirements.json',root)));
const categories=new Set(['general_entry','area_entry','hike_lottery','activity_lottery','activity_permit','backcountry','transport','tour','accommodation','parking']);
const statuses=new Set(['active_current','announced_future','discontinued','historical_only','not_announced_unknown']);
const requirements=new Set(['required','recommended','conditional','not_required','unknown']);
const mechanisms=new Set(['rolling_advance','next_day_release','fixed_batch','lottery','assigned_access','walk_up','first_come','commercial_operator','self_registration','manual_application','unknown']);
const events=new Set(['application','result','release','permit_issue','unknown']);
const units=new Set(['days','calendar_days','weeks','calendar_months','calendar_years','hours']);
const entryStatuses=new Set(['confirmed_not_required','no_requirement_found','seasonal_requirement','conflicting_sources','not_announced_unknown']);
const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const http=s=>{try{return new URL(s).protocol==='https:'||new URL(s).protocol==='http:';}catch{return false;}};
const zone=s=>{try{new Intl.DateTimeFormat('en',{timeZone:s});return typeof s==='string';}catch{return false;}};
const clock=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const when=w=>{
 if(w===null)return;
 assert.equal(typeof w,'object');
 if(w.date!==undefined)assert.ok(date(w.date),`Invalid date ${w.date}`);
 if(w.monthDay!==undefined)assert.ok(/^\d{2}-\d{2}$/.test(w.monthDay)&&date(`2000-${w.monthDay}`));
 if(w.dayOfMonth!==undefined)assert.ok(Number.isInteger(w.dayOfMonth)&&w.dayOfMonth>=1&&w.dayOfMonth<=31);
};

/** Review example only: never imported by the application or optimizer.
 * Undated recurring rules are verified solely for the research year. */
export function verifiedRequirementsForYear(data,year){
 const researchYear=Number(data.researchAsOf.slice(0,4));
 return Object.values(data.parks).flatMap(p=>p.rules).filter(r=>{
  if(!['active_current','announced_future'].includes(r.status)||!['required','conditional'].includes(r.requirement)||r.availability.status==='temporarily_unavailable')return false;
  if(r.programYear!==null)return r.programYear===year;
  return year===researchYear;
 });
}

export function validateReservations(d){
 assert.equal(d.schemaVersion,1);assert.ok(date(d.researchAsOf));
 assert.equal(d.informationalOnly,true);assert.equal(d.projectionPolicy.affectsOptimizer,false);assert.equal(d.projectionPolicy.applyToUnverifiedTravelYears,false);
 const land=JSON.parse(fs.readFileSync(new URL('data/sites.json',root))).sites;
 const expected=[...currentInventory(land).filter(p=>p.type==='park'),...REMOTE_PARKS].map(p=>p.id).sort();
 assert.deepEqual(Object.keys(d.parks).sort(),expected,'Reservation coverage must match runtime inventory IDs');
 assert.ok(Object.keys(d.sources).length>0);
 const sourceIDs=new Set();
 for(const [id,s] of Object.entries(d.sources)){
  assert.equal(id,s.sourceID);assert.ok(!sourceIDs.has(id));sourceIDs.add(id);
  assert.ok(http(s.url)&&http(s.finalURL));assert.ok(date(s.checkedAt)&&s.checkedAt<=d.researchAsOf);assert.ok(s.title&&s.issuingAuthority);assert.equal(s.httpStatus,200);
  assert.ok(['nps.gov','www.nps.gov','www.recreation.gov','redwoodparksconservancy.org'].includes(new URL(s.url).hostname),`Non-official evidence URL ${s.url}`);
 }
 const refs=ids=>{assert.ok(Array.isArray(ids)&&ids.length>0);for(const id of ids)assert.ok(sourceIDs.has(id),`Missing source ${id}`);};
 const ruleIDs=new Set();let ruleCount=0,ruleGaps=0;
 for(const [id,p] of Object.entries(d.parks)){
  assert.equal(p.siteID,id);assert.ok(p.name&&date(p.reviewedAt)&&p.reviewedAt<=d.researchAsOf);assert.equal(p.coverageStatus,'reviewed_with_gaps');assert.ok(entryStatuses.has(p.generalEntryStatus));refs(p.generalEntrySourceIDs);assert.ok(p.generalEntryEvidence);
  assert.ok(Array.isArray(p.rules)&&Array.isArray(p.unknowns)&&Array.isArray(p.reviewNotes));
  assert.ok(p.unknowns.length>0,'Future applicability must remain explicitly unverified');
  if(p.generalEntryStatus==='no_requirement_found')assert.ok(p.unknowns.some(u=>u.includes('negative search')));
  if(p.generalEntryStatus==='conflicting_sources')assert.ok(p.generalEntrySourceIDs.length>=2&&p.unknowns.length);
  for(const a of p.assessmentEvidence??[]){refs(a.sourceIDs);assert.ok(a.paraphrase);}
  for(const r of p.rules){
   ruleCount++;assert.equal(r.siteID,id);assert.ok(r.ruleID.startsWith(id+'-'));assert.ok(!ruleIDs.has(r.ruleID),`Duplicate rule ${r.ruleID}`);ruleIDs.add(r.ruleID);
   assert.ok(categories.has(r.category));assert.ok(statuses.has(r.status));assert.ok(requirements.has(r.requirement));assert.ok(r.name&&r.summary&&r.recheckNote&&r.issuingAuthority);
   assert.ok(['park_wide','partial','optional_experience'].includes(r.scope.extent));assert.ok(r.scope.asset&&r.scope.accessType);
   assert.ok(['year_specific','as_published'].includes(r.temporalBasis));
   if(r.temporalBasis==='year_specific')assert.ok(Number.isInteger(r.programYear));else assert.equal(r.programYear,null);
   if(r.status==='discontinued')assert.equal(r.requirement,'not_required');
   assert.equal(r.reservationFlagEligible,['active_current','announced_future'].includes(r.status)&&['required','conditional'].includes(r.requirement)&&r.category!=='parking'&&r.availability.status!=='temporarily_unavailable',`Invalid flag eligibility ${r.ruleID}`);
   if(r.status==='not_announced_unknown')assert.ok(r.unknowns.length);
   assert.ok(r.availability&&r.availability.status);refs(r.sourceIDs);
   assert.ok(Array.isArray(r.evidence)&&r.evidence.length);for(const e of r.evidence){refs(e.sourceIDs);assert.ok(e.claims.length&&e.paraphrase);}
   assert.ok(r.bookingURL===null||http(r.bookingURL));assert.ok(r.bookingURLKind&&r.bookingLinkVerification);for(const u of r.alternativeBookingURLs??[])assert.ok(http(u));
   assert.ok(Array.isArray(r.unknowns)&&Array.isArray(r.exceptions)&&Array.isArray(r.linkedRuleIDs));if(r.unknowns.length)ruleGaps++;
   const w=r.effectiveWindow;for(const k of ['startDate','endDate'])if(w[k]!==null)assert.ok(date(w[k]));if(w.startDate&&w.endDate)assert.ok(w.startDate<=w.endDate);if(w.timeZone!==null)assert.ok(zone(w.timeZone));if(w.hours){assert.ok(clock(w.hours.start)&&clock(w.hours.end));}
   if(r.temporalBasis==='year_specific'&&w.startDate)assert.equal(+w.startDate.slice(0,4),r.programYear);
   assert.ok(Array.isArray(r.releaseRounds));
   for(const q of r.releaseRounds){
    assert.ok(mechanisms.has(q.mechanism));assert.ok(events.has(q.event));refs(q.sourceIDs);assert.ok(q.detail&&q.availability);when(q.opensOn);when(q.closesOn);
    if(q.relativeOffset){assert.ok(Number.isFinite(q.relativeOffset.value)&&q.relativeOffset.value<=0);assert.ok(units.has(q.relativeOffset.unit)&&q.relativeOffset.anchor);}
    for(const k of ['clockTime','closeTime'])if(q[k]!==null)assert.ok(clock(q[k]));
    assert.ok(q.timeZone===null||zone(q.timeZone));
    if(q.clockTime&&q.timeZone===null)assert.ok(r.unknowns.some(u=>/zone|DST|PST|CST/.test(u)),`Silent unknown timezone ${r.ruleID}`);
    if(q.mechanism==='unknown')assert.ok(r.unknowns.length,`Unknown release must be explained ${r.ruleID}`);
    if(q.inventoryShare!==undefined)assert.ok(q.inventoryShare>0&&q.inventoryShare<=1);
   }
  }
 }
 for(const p of Object.values(d.parks))for(const r of p.rules)for(const id of r.linkedRuleIDs)assert.ok(ruleIDs.has(id),`Missing linked rule ${id}`);
 assert.equal(verifiedRequirementsForYear(d,2040).length,0,'Never project current/year-bound facts into 2040');
 return {parks:expected.length,rules:ruleCount,sources:sourceIDs.size,rulesWithGaps:ruleGaps};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===fs.realpathSync(process.argv[1])){
 console.log(JSON.stringify({valid:true,...validateReservations(readData())},null,2));
}
