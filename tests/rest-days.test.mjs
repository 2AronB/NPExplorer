import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {restBudget,requireRestBudget,validateRestAssignments,restSummary} from '../rest-days.mjs';
import {schedule,dateOf,iso,addDays} from '../optimizer.mjs';
import {optimizeTrip} from '../trip-optimizer.mjs';
import {DEFAULT_SETTINGS,upgradePlanPreferences} from '../plan-defaults.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
import {buildCalendarModel} from '../calendar.mjs';
import {exportTables,xlsxBytes} from '../trip-export.mjs';
import {loadExcelJS} from '../scripts/sample-itineraries.mjs';
import {explorationVisits} from '../access-review.mjs';
import {createSnapshot,comparisonMetrics,inputDifferences} from '../scenarios.mjs';
const base=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
const by=id=>({...[...base,...REMOTE_PARKS].find(s=>s.id===id)});
const settings={...DEFAULT_SETTINGS,startDate:'2040-06-01',autoMonth:false,restDays:6,airportCodes:['SEA'],end:{...DEFAULT_SETTINGS.start,id:'finish'}};
const plain=(id,days=2)=>({id,name:id,shortName:id,type:'park',lat:38,lng:-105,days,profile:{scores:Array(12).fill(8),ideal:[],bad:[],quiet:[]}});
function reconcile(stops,result,input){
 const state={selected:stops.map(s=>s.id),settings:input},tables=exportTables({state,sites:stops,result}),calendar=buildCalendarModel({state,sites:stops,result});
 assert.equal(tables.travelDocument.accounting.days,result.totalDays);assert.equal(tables.travelDocument.accounting.exploration,result.parkDays);
 for(const day of calendar.days)assert.equal(day.events.filter(e=>!e.shared).length,1,'one allocation on '+day.date);
 assert.equal((calendar.counts.rest||0),result.restDays);assert.equal(result.placedRestDays+result.unplacedRestDays,result.restDays);
 assert.equal(result.restBlocks.reduce((n,b)=>n+b.days,0),result.placedRestDays);
 for(const visit of explorationVisits(result)){assert.deepEqual(visit.issues,[]);assert.equal(visit.evaluatedDays,visit.requestedDays);}
 return {state,tables,calendar};
}
test('assignments take from the reserve, ignore deselected stops and reject invalid or excessive allocations',()=>{
 const s={restDays:5,restAfter:{a:3,b:4}};assert.deepEqual(restBudget(s,['a']),{total:5,placed:3,unplaced:2,inactive:['b'],overallocated:false});
 assert.throws(()=>requireRestBudget(s,['a','b']),/use 7 days.*reserve has 5/);
 assert.deepEqual(validateRestAssignments({a:0,b:2},new Set(['a','b'])),{b:2});
 for(const raw of [null,[],{a:-1},{a:.5},{a:366},{a:'2'}])assert.throws(()=>validateRestAssignments(raw));
 assert.throws(()=>validateRestAssignments({unknown:2},new Set(['a'])),/known destinations/);
});
test('empty placement defaults preserve old scheduling and saved plans',()=>{
 const stops=[by('arch'),by('cany')],{restAfter,...legacy}=settings;
 assert.deepEqual(schedule(stops,legacy),schedule(stops,{...legacy,restAfter:{}}));
 const upgraded=upgradePlanPreferences({version:1,preferencesRevision:3,settings:{restDays:8}});assert.deepEqual(upgraded.settings.restAfter,{});assert.equal(upgraded.settings.restDays,8);
 assert.deepEqual(restSummary({restDays:8}),{total:8,placed:0,unplaced:8});
});
test('mainland placed rest shifts later exploration without reducing stays, inflating the reserve or losing the return drive',()=>{
 const stops=[plain('a'),plain('b')],input={...settings,sharedDays:false,start:stops[0],end:{...stops[0],id:'finish'},restAfter:{a:3}},before=schedule(stops,{...input,restAfter:{}}),result=schedule(stops,input);
 assert.equal(result.visits[1].arrival,iso(addDays(dateOf(before.visits[1].arrival),3)));assert.equal(result.parkDays,4);assert.equal(result.totalDays,before.totalDays);assert.equal(result.restDays,6);assert.equal(result.unplacedRestDays,3);
 assert.ok(result.legs.some(l=>l.to==='finish'));assert.equal(result.restBlocks[0].start,result.visits[0].departure);reconcile(stops,result,input);
});
test('a departure morning cannot be reclaimed from a placed rest day, and any extra calendar cost stays explicit',()=>{
 const a=by('arch'),b=by('cany'),stops=[{...a,days:2},{...b,days:2}],input={...settings,start:a,restAfter:{arch:2}},before=schedule(stops,{...input,restAfter:{}}),result=schedule(stops,input),v=result.visits[0],rest=result.restBlocks[0];
 assert.ok(before.visits[0].departureSharedDays>0);assert.equal(v.departureSharedDays,0);assert.ok(result.totalDays>=before.totalDays);
 assert.equal(result.legs[1].depart,rest.end);for(const leg of result.legs)for(const activity of leg.dailyActivities||[])assert.ok(activity.date<rest.start||activity.date>=rest.end);
 reconcile(stops,result,input);
});
test('rest follows the mainland return park-access transfer and never becomes more park exploration',()=>{
 const stop={...by('isro'),days:2},input={...settings,startDate:'2040-07-01',sharedDays:true,start:stop.access.gateway,restAfter:{isro:2}},result=schedule([stop],input),v=result.visits[0];
 assert.equal(result.restBlocks[0].start,iso(addDays(dateOf(v.departure),Math.floor(v.transferDays/2))));assert.equal(result.parkDays,2);reconcile([stop],result,input);
});
test('placed rest can turn an on-time personal appointment into an explicit conflict without dropping days',()=>{
 const a=plain('a'),appointment={...plain('custom-date',1),type:'custom',fixedDate:'2040-06-03'},stops=[a,appointment],input={...settings,sharedDays:false,start:a,restAfter:{a:4}};
 const before=schedule(stops,{...input,restAfter:{}}),result=schedule(stops,input);assert.equal(before.appointmentConflicts,0);assert.equal(result.appointmentConflicts,1);assert.equal(result.visits[1].days,1);assert.ok(result.warnings.some(w=>w.includes('missed fixed')));reconcile(stops,result,input);
});
test('remote rest shifts remaining regional visits and follows immediate return transfers in the ledger',()=>{
 const stops=REMOTE_PARKS.filter(s=>['gaar','kova'].includes(s.id)),input={...settings,alaskaMode:'fly',restAfter:{gaar:2,kova:1}},result=optimizeTrip(stops,input),block=result.excursions[0];
 assert.equal(block.restDays,3);assert.equal(result.placedRestDays,3);assert.equal(result.unplacedRestDays,3);
 for(const rest of block.restBlocks){const v=block.visits.find(v=>v.id===rest.siteId),transfer=block.transport.find(t=>t.depart===v.departure);assert.equal(rest.start,transfer.arrival);assert.ok(!block.transport.some(t=>t.depart>=rest.start&&t.depart<rest.end));}
 assert.equal(block.days,block.parkDays+block.driveDays+block.transferDays+block.restDays);reconcile(stops,result,input);
});
test('moving reserve after a single regional visit adds no direct rest penalty or double-counted transfer days',()=>{
 const stops=[by('viis')],input={...settings,startDate:'2040-04-01',restAfter:{viis:3}},before=optimizeTrip(stops,{...input,restAfter:{}}),result=optimizeTrip(stops,input);
 assert.equal(result.score,before.score);assert.equal(result.parkDays,before.parkDays);assert.equal(result.transferDays,before.transferDays);assert.equal(result.totalDays,before.totalDays);reconcile(stops,result,input);
});
test('Pacific combined/separate comparison keeps every park and places reserve once in the selected strategy',()=>{
 const stops=REMOTE_PARKS.filter(s=>['hale','havo','npsa'].includes(s.id)),input={...settings,restAfter:{hale:2,npsa:2}},result=optimizeTrip(stops,input);
 assert.ok(result.pacificComparison);assert.equal(result.placedRestDays,4);assert.deepEqual(result.restBlocks.map(b=>b.siteId).sort(),['hale','npsa']);assert.equal(result.unplacedRestDays,2);reconcile(stops,result,input);
});
test('rest can make formerly feasible regional service windows conflict while retaining every requested day',()=>{
 const stops=[{...by('hale'),days:1},{...by('havo'),days:1}],baseline=optimizeTrip(stops,settings),windows=Object.fromEntries(baseline.excursions[0].visits.map(v=>[v.id,{start:v.arrival.slice(5),end:v.arrival.slice(5)}]));
 const input={...settings,remoteWindows:{...settings.remoteWindows,...windows},restAfter:{hale:2}},before=optimizeTrip(stops,{...input,restAfter:{}}),result=optimizeTrip(stops,input);
 assert.ok(before.excursions[0].feasible);assert.ok(!result.excursions[0].feasible);assert.equal(result.parkDays,2);assert.equal(result.placedRestDays,2);assert.ok(result.warnings.some(w=>w.includes('infeasible')));reconcile(stops,result,input);
});
test('all departure months retain placed rest, full visits and reconciled Pacific ledgers',()=>{
 const stops=[{...by('arch'),days:2},...REMOTE_PARKS.filter(s=>['hale','havo','npsa'].includes(s.id)).map(s=>({...s,days:1}))],input={...settings,autoMonth:true,restAfter:{arch:1,hale:2,npsa:1}},result=optimizeTrip(stops,input);
 assert.equal(result.monthResults.length,12);for(const r of result.monthResults){assert.equal(r.parkDays,5);assert.equal(r.placedRestDays,4);assert.equal(r.unplacedRestDays,2);reconcile(stops,r,input);}
});
test('Calendar, CSV and workbook account for placed plus unplaced reserve and scenario comparisons preserve inputs',async()=>{
 const stops=[by('arch'),by('cany')],input={...settings,restAfter:{arch:2,cany:1}},result=schedule(stops,input),{state,tables}=reconcile(stops,result,input);
 assert.equal(tables.travelDocument.events.filter(e=>e.event==='Placed rest').reduce((n,e)=>n+e.days,0),3);assert.equal(tables.travelDocument.events.find(e=>e.event==='Rest-day reserve').days,3);
 const ExcelJS=await loadExcelJS(),book=new ExcelJS.Workbook();await book.xlsx.load(await xlsxBytes(tables,ExcelJS));assert.equal(book.worksheets.length,5);assert.match(JSON.stringify(book.getWorksheet('Overview').model),/Placed rest days/);assert.match(JSON.stringify(book.getWorksheet('Checklist').model),/Arrange rest base/);
 const snapshot=createSnapshot({id:'rest',name:'Rested',state:{...state,version:1,custom:[]},sites:stops,result,versions:{app:'rest'}}),other=structuredClone(snapshot);other.state.settings.restAfter={};
 assert.equal(comparisonMetrics(snapshot.result,null).restPlaced,3);assert.ok(inputDifferences(other,snapshot).some(r=>r.label.includes('rest after visit')));assert.deepEqual(JSON.parse(JSON.stringify(snapshot.state)).settings.restAfter,input.restAfter);
});
