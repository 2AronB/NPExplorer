import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateArrivalWindows,checkArrivalWindow,arrivalWindowText,arrivalReviewHtml,constrainedVisits,arrivalConflictCost} from '../arrival-windows.mjs';
import {schedule,optimize,dateOf,iso,addDays} from '../optimizer.mjs';
import {optimizeTrip} from '../trip-optimizer.mjs';
import {DEFAULT_SETTINGS,upgradePlanPreferences} from '../plan-defaults.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
import {buildCalendarModel,nextDateConflictDate} from '../calendar.mjs';
import {exportTables,xlsxBytes} from '../trip-export.mjs';
import {loadExcelJS} from '../scripts/sample-itineraries.mjs';
import {explorationVisits} from '../access-review.mjs';
import {createSnapshot,inputDifferences,comparisonMetrics} from '../scenarios.mjs';
const base=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
const by=id=>({...[...base,...REMOTE_PARKS].find(s=>s.id===id)});
const plain=(id,days=2)=>({id,name:id,shortName:id,type:'park',lat:38,lng:-105,days,priority:1,profile:{scores:Array(12).fill(8),quiet:[]}});
const home={id:'start',name:'Home',lat:38,lng:-105};
const settings={...DEFAULT_SETTINGS,startDate:'2040-06-01',autoMonth:false,sharedDays:false,restDays:0,start:home,end:{...home,id:'finish'},airportCodes:['SEA'],alaskaMode:'fly'};
const exact=date=>({earliest:date,latest:date});
function reconcile(stops,result,input){
 const state={version:1,selected:stops.map(s=>s.id),custom:[],settings:input},tables=exportTables({state,sites:stops,result}),calendar=buildCalendarModel({state,sites:stops,result});
 assert.equal(tables.travelDocument.accounting.days,result.totalDays);assert.equal(tables.travelDocument.accounting.exploration,result.parkDays);
 assert.equal(calendar.days.length,result.totalDays);for(const day of calendar.days)assert.equal(day.events.filter(e=>!e.shared).length,1,day.date+' has one allocation');
 for(const v of explorationVisits(result)){assert.deepEqual(v.issues,[]);assert.equal(v.requestedDays,v.evaluatedDays);}
 assert.equal(constrainedVisits(result).filter(v=>v.windowConflict).length,result.windowConflicts);
 return {state,tables,calendar};
}
test('arrival window schema supports inclusive exact-year bounds and rejects invalid or reversed dates',()=>{
 assert.deepEqual(validateArrivalWindows({a:{earliest:'2040-02-29'},b:{latest:'2041-01-01'},c:{earliest:'',latest:''}},new Set(['a','b','c'])),{a:{earliest:'2040-02-29',latest:null},b:{earliest:null,latest:'2041-01-01'}});
 for(const raw of [null,[],{a:[]},{a:{earliest:'2041-02-29'}},{a:{latest:'2040-02-30'}},{a:{earliest:false}},{a:{latest:0}},{a:{earliest:'2040-06-02',latest:'2040-06-01'}}])assert.throws(()=>validateArrivalWindows(raw));
 assert.throws(()=>validateArrivalWindows({custom:exact('2040-06-01')},new Set(['a'])),/recognized/);
 assert.deepEqual(checkArrivalWindow(exact('2040-06-01'),'2040-06-01'),{windowConflict:false,windowLateDays:0,windowEarlyDays:0});
 assert.equal(checkArrivalWindow(exact('2040-06-01'),'2040-06-03').windowLateDays,2);
});
test('empty arrival windows preserve previous schedules and upgrade without changing saved preferences',()=>{
 const stops=[by('arch'),by('cany')],{arrivalWindows,...legacy}=settings;
 assert.deepEqual(schedule(stops,legacy),schedule(stops,{...legacy,arrivalWindows:{}}));
 const upgraded=upgradePlanPreferences({version:1,preferencesRevision:3,settings:{restDays:9,restAfter:{arch:2}}});assert.deepEqual(upgraded.settings.arrivalWindows,{});assert.equal(upgraded.settings.restAfter.arch,2);
});
test('earliest exploration waits at the gateway while preserving stays and the home drive',()=>{
 const stops=[plain('a')],input={...settings,arrivalWindows:{a:exact('2040-06-10')}},result=schedule(stops,input),v=result.visits[0];
 assert.equal(v.arrival,'2040-06-10');assert.equal(v.days,2);assert.equal(result.windowWaitDays,9);assert.equal(result.windowConflicts,0);assert.equal(result.waitDays,0);assert.ok(result.legs.some(l=>l.to==='finish'));reconcile(stops,result,input);
});
test('arrival credit before the earliest date is suppressed without inventing a waiting day',()=>{
 const stop={...plain('a'),lat:38,lng:-104.9},input={...settings,startDate:'2040-05-31',sharedDays:true,end:null},before=schedule([stop],input),result=schedule([stop],{...input,arrivalWindows:{a:exact('2040-06-01')}});
 assert.ok(before.visits[0].sharedDays>0);assert.equal(before.visits[0].arrival,'2040-05-31');assert.equal(result.visits[0].sharedDays,0);assert.equal(result.visits[0].arrival,'2040-06-01');assert.equal(result.windowWaitDays,0);assert.equal(result.windowConflicts,0);reconcile([stop],result,input);
});
test('latest date applies to actual shared exploration, not the first standalone day',()=>{
 const stop={...plain('a'),lng:-104.9},input={...settings,startDate:'2040-05-31',sharedDays:true,end:null,arrivalWindows:{a:{earliest:null,latest:'2040-05-31'}}},result=schedule([stop],input),v=result.visits[0];
 assert.equal(v.arrival,'2040-05-31');assert.equal(v.stayStart,'2040-06-01');assert.equal(result.windowConflicts,0);reconcile([stop],result,input);
});
test('park arrival dates are year-specific rather than annually recurring',()=>{
 const stops=[plain('a')],input={...settings,arrivalWindows:{a:exact('2041-06-01')}},result=schedule(stops,input);assert.equal(result.visits[0].arrival,'2041-06-01');assert.equal(result.windowWaitDays,365);reconcile(stops,result,input);
});
test('closure waiting stays separate and flags a missed window without overlapping allocations',()=>{
 const stop={...plain('a'),closure:{start:'06-01',end:'06-03'}},input={...settings,arrivalWindows:{a:exact('2040-06-02')}},result=schedule([stop],input),v=result.visits[0],{tables}=reconcile([stop],result,input);
 assert.equal(v.arrival,'2040-06-04');assert.equal(v.windowLateDays,2);assert.equal(result.windowWaitDays,1);assert.equal(result.waitDays,2);assert.equal(result.windowConflicts,1);assert.equal(v.days,2);
 const waits=tables.travelDocument.events.filter(e=>/wait/i.test(e.event));assert.deepEqual(waits.map(e=>[e.event,e.days]),[['Arrival-window wait',1],['Closure wait',2]]);
});
test('conflicting windows keep all visits and report hard conflicts instead of silently relaxing them',()=>{
 const stops=[plain('a'),plain('b')],input={...settings,arrivalWindows:{a:exact('2040-06-01'),b:exact('2040-06-01')}},result=schedule(stops,input);
 assert.equal(result.parkDays,4);assert.equal(result.windowConflicts,1);assert.equal(result.visits[1].windowLateDays,2);assert.ok(result.score>=1e9);assert.match(result.warnings.join(' '),/has not proved/);reconcile(stops,result,input);
});
test('route search can satisfy compatible window order without a duration-target penalty',()=>{
 const stops=[plain('a'),plain('b')],input={...settings,arrivalWindows:{a:exact('2040-06-03'),b:exact('2040-06-01')}},result=optimize(stops,input),short=optimize(stops,{...input,duration:1});
 assert.deepEqual(result.order,['b','a']);assert.equal(result.windowConflicts,0);assert.equal(result.windowWaitDays,0);assert.equal(result.score,short.score);assert.equal(short.parkDays,4);assert.ok(short.overrun>0);reconcile(stops,result,input);
});
test('personal first-full-day appointments retain their own wait accounting and semantics',()=>{
 const stops=[plain('a',1),{...plain('custom-date',1),type:'custom',fixedDate:'2040-06-06'}],input={...settings,arrivalWindows:{a:exact('2040-06-03')}},result=schedule(stops,input);
 assert.equal(result.windowWaitDays,2);assert.equal(result.appointmentWaitDays,2);assert.equal(result.appointmentConflicts,0);assert.equal(result.visits[1].arrival,'2040-06-06');assert.equal(result.visits[1].dateWindow,null);reconcile(stops,result,input);
});
test('placed rest shifts later constrained dates and preserves the reserve and exploration',()=>{
 const stops=[plain('a'),plain('b')],input={...settings,restDays:3,restAfter:{a:2},arrivalWindows:{b:exact('2040-06-03')}},before=schedule(stops,{...input,restAfter:{}}),result=schedule(stops,input);
 assert.equal(before.windowConflicts,0);assert.equal(result.windowConflicts,1);assert.equal(result.visits[1].windowLateDays,2);assert.equal(result.placedRestDays,2);assert.equal(result.parkDays,4);reconcile(stops,result,input);
});
test('regional earliest dates shift the coherent excursion with an explicit gateway wait',()=>{
 const stops=[by('viis')],before=optimizeTrip(stops,settings),wanted=iso(addDays(dateOf(before.excursions[0].visits[0].arrival),10)),input={...settings,arrivalWindows:{viis:exact(wanted)}},result=optimizeTrip(stops,input),b=result.excursions[0];
 assert.equal(b.visits[0].arrival,wanted);assert.equal(b.windowWait,10);assert.equal(b.serviceWait,0);assert.equal(result.windowWaitDays,10);assert.equal(result.waitDays,0);assert.equal(result.windowConflicts,0);assert.ok(b.serviceFeasible&&b.feasible);reconcile(stops,result,input);
 for(let i=0;i<b.transport.length;i++)assert.equal(b.transport[i].depart,iso(addDays(dateOf(before.excursions[0].transport[i].depart),10)));
});
test('incompatible regional windows are distinct from service infeasibility and are not penalized twice',()=>{
 const stops=[{...by('hale'),days:1},{...by('havo'),days:1}],input={...settings,objective:'shortest',arrivalWindows:{hale:exact('2040-06-10'),havo:exact('2040-06-10')}},result=optimizeTrip(stops,input),b=result.excursions[0];
 assert.ok(b.serviceFeasible);assert.ok(!b.feasible);assert.ok(result.windowConflicts>0);assert.equal(result.parkDays,2);
 const remoteDays=b.days-b.parkDays-(b.restDays||0),expected=arrivalConflictCost(result.windowConflicts,result.windowLateDays)+result.hours+result.flightHours+remoteDays*2+(result.waitDays+result.windowWaitDays)*10+result.longDays;
 assert.ok(Math.abs(result.score-expected)<1e-6);reconcile(stops,result,input);
});
test('regional service delays after the earliest date can conflict with the latest date and stay separately accounted',()=>{
 const stops=[by('katm')],input={...settings,startDate:'2040-01-01',arrivalWindows:{katm:exact('2040-01-10')},remoteWindows:{katm:{start:'06-01',end:'08-31'}}},result=optimizeTrip(stops,input),b=result.excursions[0];
 assert.ok(b.windowWait>0);assert.ok(b.serviceWait>0);assert.ok(b.serviceFeasible);assert.equal(result.windowConflicts,1);assert.equal(result.windowWaitDays,b.windowWait);assert.equal(result.waitDays,b.serviceWait);reconcile(stops,result,input);
});
test('all-month Pacific search retains windows, parks, rest and complete reconciled ledgers',()=>{
 const stops=[{...by('arch'),days:1},...REMOTE_PARKS.filter(s=>['hale','havo','npsa'].includes(s.id)).map(s=>({...s,days:1}))],window={earliest:'2040-06-01',latest:'2041-01-31'},input={...settings,autoMonth:true,restDays:3,restAfter:{hale:1},arrivalWindows:{hale:window,npsa:window}},result=optimizeTrip(stops,input);
 assert.equal(result.monthResults.length,12);for(const r of result.monthResults){assert.equal(r.parkDays,4);assert.equal(r.placedRestDays,1);assert.equal(constrainedVisits(r).length,2);for(const v of constrainedVisits(r))assert.deepEqual(v.dateWindow,window);reconcile(stops,r,input);}
});
test('Calendar, CSV and XLSX show actual first dates, conflicts and exact-date checklist actions',async()=>{
 const stops=[plain('a'),plain('b')],input={...settings,arrivalWindows:{a:exact('2040-06-01'),b:exact('2040-06-01')}},result=schedule(stops,input),{state,tables,calendar}=reconcile(stops,result,input);
 assert.deepEqual(calendar.byDate.get('2040-06-03').dateConflicts,['b']);assert.equal(nextDateConflictDate(calendar,'2040-06-01'),'2040-06-03');assert.equal(nextDateConflictDate(calendar,'2040-06-04'),'2040-06-03');
 assert.ok(tables.itinerary.some(row=>String(row.at(-1)).includes('MISSED by 2')));assert.ok(tables.travelDocument.actions.some(a=>a.status==='CONFLICT'&&a.due==='2040-06-01'));
 const ExcelJS=await loadExcelJS(),book=new ExcelJS.Workbook();await book.xlsx.load(await xlsxBytes(tables,ExcelJS));assert.equal(book.worksheets.length,5);assert.match(JSON.stringify(book.getWorksheet('Overview').model),/Park arrival-date conflicts/);assert.match(JSON.stringify(book.getWorksheet('Checklist').model),/misses this window/);
 const snap=createSnapshot({id:'window',name:'Dated',state,sites:stops,result,versions:{app:'windows'}}),other=structuredClone(snap);other.state.settings.arrivalWindows={};assert.ok(inputDifferences(other,snap).some(r=>r.label.includes('arrival window')));assert.equal(comparisonMetrics(result,null).arrivalConflicts,1);assert.deepEqual(validateArrivalWindows(JSON.parse(JSON.stringify(snap.state)).settings.arrivalWindows),input.arrivalWindows);
});
test('uncomputed reports preserve requested windows without inventing dates or claiming bookings',()=>{
 const stops=[plain('a')],input={...settings,arrivalWindows:{a:exact('2040-06-10')}},tables=exportTables({state:{selected:['a'],settings:input},sites:stops,result:null});
 assert.equal(tables.travelDocument.events[0].start,null);assert.match(tables.travelDocument.events[0].notes,/2040-06-10/);assert.match(tables.travelDocument.events[0].notes,/not scheduled/);assert.match(arrivalWindowText(input.arrivalWindows.a),/First exploration date/);
});
test('arrival review escapes names and persisted derived text',()=>{
 const result={visits:[{id:'a',arrival:'2040-06-03',dateWindow:exact('2040-06-01'),windowConflict:true,windowLateDays:'<img src=x onerror=alert(1)>'}]},html=arrivalReviewHtml(result,[{id:'a',shortName:'<script>bad</script>'}]);
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));assert.match(html,/&lt;img/);
});

test('saved arrival reviews are read-only while active reviews link to editors',()=>{
 const stops=[plain('a')],result=schedule(stops,{...settings,arrivalWindows:{a:exact('2040-06-01')}});
 assert.match(arrivalReviewHtml(result,stops),/data-route-detail/);
 const saved=arrivalReviewHtml(result,stops,{interactive:false});assert.doesNotMatch(saved,/<button|data-route-detail/);assert.match(saved,/Calculated first exploration/);
});
