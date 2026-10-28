import test from 'node:test';
import assert from 'node:assert/strict';
import {readData,validateReservations,verifiedRequirementsForYear} from '../scripts/validate-reservations.mjs';
import {runtimeFiles} from '../scripts/build-site.mjs';
const d=readData();
const get=id=>Object.values(d.parks).flatMap(p=>p.rules).find(r=>r.ruleID===id);

test('covers the exact runtime inventory with referentially valid official evidence',()=>{assert.equal(validateReservations(d).parks,64);});
test('a named-hike lottery does not make Zion reservation-only',()=>{assert.equal(d.parks.zion.generalEntryStatus,'confirmed_not_required');assert.equal(get('zion-angels-landing').scope.extent,'partial');assert.ok(get('zion-angels-landing').exceptions.some(s=>s.includes('Scout Lookout')));});
test('advance and last-minute inventory survive as distinct rounds',()=>{const r=get('acad-cadillac');assert.deepEqual(r.releaseRounds.map(q=>q.relativeOffset.value),[-90,-2]);assert.equal(r.releaseRounds.reduce((sum,q)=>sum+q.inventoryShare,0),1);assert.ok(get('romo-timed-entry').releaseRounds.some(q=>q.mechanism==='next_day_release'));});
test('discontinued entry pilot never becomes a verified requirement',()=>{assert.equal(get('arch-entry-pilot').status,'discontinued');assert.ok(!verifiedRequirementsForYear(d,2026).some(r=>r.ruleID==='arch-entry-pilot'));assert.ok(verifiedRequirementsForYear(d,2026).some(r=>r.ruleID==='arch-fiery-self'));});
test('year-specific and as-published programs never imply a 2040 requirement',()=>{assert.equal(get('romo-timed-entry').programYear,2026);assert.equal(get('noca-backcountry').programYear,2027);assert.deepEqual(verifiedRequirementsForYear(d,2040),[]);assert.deepEqual(verifiedRequirementsForYear(d,2042),[]);});
test('unknown timezone and suspended boat tours remain explicit',()=>{const r=get('shen-old-rag');assert.equal(r.releaseRounds[0].timeZone,null);assert.ok(r.unknowns.some(s=>/timezone/.test(s)));assert.equal(get('crla-boat-tour').availability.status,'temporarily_unavailable');assert.equal(d.parks.crla.generalEntryStatus,'conflicting_sources');});
test('calendar months and days are not interchangeable',()=>{assert.equal(get('sequ-wilderness').releaseRounds[0].relativeOffset.unit,'calendar_months');assert.equal(get('hale-sunrise').releaseRounds[0].relativeOffset.unit,'days');});
test('published research remains informational and outside optimizer behavior',()=>{assert.ok(runtimeFiles.includes('data/reservation-requirements.json'));assert.equal(d.informationalOnly,true);assert.equal(d.projectionPolicy.affectsOptimizer,false);assert.equal(get('grsm-parking-tag').reservationFlagEligible,false);assert.equal(get('crla-boat-tour').reservationFlagEligible,false);});
test('validation rejects duplicate IDs, orphan sources, missing parks and silent timezone loss',()=>{
 const duplicate=structuredClone(d);duplicate.parks.acad.rules.push(structuredClone(duplicate.parks.acad.rules[0]));assert.throws(()=>validateReservations(duplicate),/Duplicate rule/);
 const orphan=structuredClone(d);orphan.parks.acad.rules[0].sourceIDs=['missing'];assert.throws(()=>validateReservations(orphan),/Missing source/);
 const missing=structuredClone(d);delete missing.parks.npsa;assert.throws(()=>validateReservations(missing),/runtime inventory/);
 const silent=structuredClone(d);silent.parks.shen.rules.find(r=>r.ruleID==='shen-old-rag').unknowns=[];assert.throws(()=>validateReservations(silent),/Silent unknown timezone/);
});

 test('UI keeps discontinued entry out of badges and exposes scope, multiple releases and future-year caveats',async()=>{const {planningRules,reservationDetails,reservationBadge}=await import('../reservation-ui.mjs');assert.ok(!planningRules(d.parks.arch).some(r=>r.ruleID==='arch-entry-pilot'));assert.match(reservationBadge(d.parks.zion),/booking topic/);const html=reservationDetails(d,'romo',2040);assert.match(html,/Trip year 2040/);assert.match(html,/not confirmed requirements/);assert.match(html,/next day release/);assert.match(html,/19:00/);assert.match(html,/Bear Lake/);assert.match(reservationDetails(d,'arch',2040),/Historical \/ discontinued/);});
