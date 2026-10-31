import test from 'node:test';
import assert from 'node:assert/strict';
import {validVisitDays} from '../visit-durations.mjs';
import {alongCandidates,previewAlong,displayedOrder} from '../along-the-way.mjs';
import {schedule,detours,travel} from '../optimizer.mjs';
import {optimizeTrip} from '../trip-optimizer.mjs';
import {DEFAULT_SETTINGS,upgradePlanPreferences} from '../plan-defaults.mjs';
import {buildCalendarModel} from '../calendar.mjs';
import {exportTables,xlsxBytes} from '../trip-export.mjs';
import {explorationVisits} from '../access-review.mjs';
import {createSnapshot,inputDifferences} from '../scenarios.mjs';
import {runtimeParks,loadExcelJS} from '../scripts/sample-itineraries.mjs';
const profile={scores:Array(12).fill(8),quiet:[]};
const stop=(id,type='site',days=.25,lng=-104.8)=>({id,type,days,name:id,shortName:id,designation:'National Monument',state:'CO',lat:38.8,lng,profile,priority:1});
const settings={...DEFAULT_SETTINGS,startDate:'2040-06-01',autoMonth:false,restDays:0,detourHours:12,objective:'shortest',start:{id:'start',name:'Home',lat:38.8,lng:-104.8},end:{id:'finish',name:'Home',lat:38.8,lng:-104.8}};
const state=(selected,s=settings)=>({version:1,preferencesRevision:3,selected,settings:s,days:{},priorities:{},rules:{},custom:[],calibration:{},preparation:{}});
function reconcile(sites,result,input=settings){
 const s=state(sites.map(p=>p.id),input),tables=exportTables({state:s,sites,result}),model=buildCalendarModel({state:s,sites,result});
 assert.equal(tables.travelDocument.accounting.days,result.totalDays);assert.equal(tables.travelDocument.accounting.exploration,sites.reduce((n,p)=>n+p.days,0));assert.equal(model.days.length,result.totalDays);assert.ok(model.days.every(d=>d.events.length));
 for(const v of explorationVisits(result))assert.deepEqual(v.issues,[]);
 for(const leg of result.legs)for(const day of leg.dailyActivities||[])assert.ok(day.totalHours<=input.dayBudget+1e-9);
 return {tables,model};
}
test('other NPS sites accept quarter days while park and personal stay rules remain whole',()=>{
 for(const n of [.25,.5,.75,1,2.25,365])assert.ok(validVisitDays({type:'site'},n));
 for(const n of [0,.1,.3,365.25,NaN,Infinity,'0.25'])assert.ok(!validVisitDays({type:'site'},n));
 for(const type of ['park','custom']){assert.ok(!validVisitDays({type},.25));assert.ok(validVisitDays({type},1));}
 assert.throws(()=>schedule([stop('bad','site',.3)],settings),/quarter-day/);
});
test('a quarter-day site uses two exploration hours and can share its departure with home driving',()=>{
 const sites=[stop('short')],input={...settings,end:{...settings.end,lng:-104.7}},r=schedule(sites,input),v=r.visits[0];
 assert.equal(v.days,.25);assert.equal(v.departureSharedDays,.25);assert.equal(v.calendarDays,0);assert.equal(r.parkDays,.25);assert.equal(r.totalDays,1);assert.equal(r.legs.at(-1).dailyActivities[0].departureExplorationHours,2);reconcile(sites,r,input);
});
test('arrival-day sharing retains quarter visits without inventing another exploration date',()=>{
 const sites=[stop('short','site',.25,-104.7)],r=schedule(sites,settings),v=r.visits[0];assert.equal(v.sharedDays,.25);assert.equal(v.calendarDays,0);assert.equal(v.arrival,'2040-06-01');assert.equal(r.sharedParkDays,.25);reconcile(sites,r);
 const unshared=schedule(sites,{...settings,sharedDays:false});assert.equal(unshared.visits[0].calendarDays,1);assert.equal(unshared.visits[0].unusedDays,.75);assert.equal(unshared.totalDays,r.totalDays+1);reconcile(sites,unshared,{...settings,sharedDays:false});
});
test('two short sites share road-day hours within the existing two-endpoint model',()=>{
 const sites=[stop('first','site',.75),stop('second','site',.5,-104.7)],r=schedule(sites,settings);assert.equal(r.parkDays,1.25);assert.ok(r.sharedParkDays>0);const {model}=reconcile(sites,r);assert.ok(model.days.some(d=>d.events.filter(e=>e.shared).length===2));
});
test('site closures and placed rest preserve fractional exploration and complete allocations',()=>{
 const site={...stop('short'),closure:{start:'06-01',end:'06-02'}},input={...settings,restDays:2,restAfter:{short:1}},r=schedule([site],input);assert.equal(r.waitDays,2);assert.equal(r.visits[0].arrival,'2040-06-03');assert.equal(r.placedRestDays,1);assert.equal(r.visits[0].departureSharedDays,0);reconcile([site],r,input);
});
test('driving ceiling measures insertion into a leg, not distance from a park marker',()=>{
 const park=stop('anchor','park',2,-103.8),candidate=stop('between','site',.25,-104.3),order=[park],extra=travel(settings.start,candidate,settings).hours+travel(candidate,park,settings).hours-travel(settings.start,park,settings).hours;
 const near=detours([candidate],order,{...settings,detourHours:extra+1e-8},{limit:Infinity});assert.equal(near.length,1);assert.ok(Math.abs(near[0].extraHours-extra)<1e-8);assert.equal(detours([candidate],order,{...settings,detourHours:extra-1e-8}).length,0);
});
test('return-home insertions and open-finish appendices are both eligible',()=>{
 const order=[stop('anchor','park',1,-103.8)],candidate=stop('tail','site',.25,-103.7),list=detours([candidate],order,{...settings,end:null},{limit:Infinity});assert.equal(list[0].after,1);assert.equal(list[0].extraHours,travel(order[0],candidate,settings).hours);
 const homeOrder=[stop('anchor','park',1,-103.8),stop('last','park',1,-105.8)],r=schedule(homeOrder,settings),s=state(homeOrder.map(p=>p.id)),sites=[...homeOrder,stop('homeward','site',.25,-105.3)],match=alongCandidates({state:s,sites,result:r}).find(c=>c.id==='homeward');assert.equal(match.after,2);assert.equal(match.to.id,'finish');
});
test('discovery returns more than eight matches, keeps saved allowances and excludes selected/remote sites',()=>{
 const anchor=stop('anchor','park',2),extra=Array.from({length:20},(_,i)=>stop('s'+i)),sites=[anchor,...extra,{...stop('remote'),remote:{region:'alaska'}}],s=state(['anchor','s0']);s.days.s1=.5;const r=schedule([anchor,extra[0]],settings),list=alongCandidates({state:s,sites,result:r});assert.equal(list.length,19);assert.equal(list.find(c=>c.id==='s1').days,.5);assert.ok(!list.some(c=>c.id==='s0'||c.id==='remote'));assert.equal(alongCandidates({state:s,sites,result:null}).length,0);
});
test('preview preserves active inputs and every existing visit while showing actual ripple effects',()=>{
 const anchor=stop('anchor','park',3,-103.8),candidate=stop('extra','site',.25,-104.3),appointment={...stop('family','custom',1,-103.7),fixedDate:'2040-06-03'},sites=[anchor,candidate,appointment],s=state(['anchor','family']),r=schedule([anchor,appointment],settings),before=JSON.stringify({s,sites,r}),p=previewAlong({state:s,sites,result:r,id:'extra',days:.25});
 assert.equal(JSON.stringify({s,sites,r}),before);assert.equal(p.proposed.parkDays,r.parkDays+.25);assert.equal(p.visitHours,2);assert.equal(p.extraCalendarDays,p.proposed.totalDays-r.totalDays);assert.ok(p.proposed.legs.some(l=>l.to==='finish'));assert.equal(p.afterConflicts,p.proposed.windowConflicts+p.proposed.appointmentConflicts);assert.ok(p.afterLateDays>=p.beforeLateDays);reconcile([anchor,candidate,appointment],p.proposed);
 assert.throws(()=>previewAlong({state:s,sites,result:r,id:'anchor',days:.25}),/selected/);assert.throws(()=>previewAlong({state:s,sites,result:r,id:'extra',days:.3}),/quarter-day/);assert.throws(()=>displayedOrder({order:['missing']},sites),/Recalculate/);
});
test('regional preview preserves excursion gateways, individual visits, rest and home recovery',()=>{
 const parks=runtimeParks.filter(p=>['arch','hale','havo','npsa'].includes(p.id)).map(p=>({...p,days:1})),extra=stop('extra','site',.25),input={...settings,restDays:3,restAfter:{hale:1},airportCodes:['SEA']},s=state(parks.map(p=>p.id),input),r=optimizeTrip(parks,input),p=previewAlong({state:s,sites:[...parks,extra],result:r,id:'extra',days:.25});
 assert.equal(p.proposed.placedRestDays,1);assert.deepEqual(p.proposed.excursions.map(b=>b.airport?.code),r.excursions.map(b=>b.airport?.code));assert.equal(p.proposed.parkDays,4.25);reconcile([...parks,extra],p.proposed,input);
});
test('quarter-day values survive JSON, preferences migration, snapshots, CSV and actual workbook reads',async()=>{
 const sites=[stop('short','site',.25,-104.7)],s=state(['short']);s.days.short=.25;const r=schedule(sites,settings),{tables}=reconcile(sites,r);const restored=upgradePlanPreferences(JSON.parse(JSON.stringify(s)));assert.equal(restored.days.short,.25);
 const snap=createSnapshot({id:'quarter',name:'Quick stop',state:s,sites,result:r,versions:{app:'quarter'}}),other=structuredClone(snap);other.sites[0].days=1;assert.ok(inputDifferences(other,snap).some(d=>d.label.includes('exploration days')));assert.equal(snap.result.visits[0].days,.25);assert.ok(tables.itinerary.some(row=>row[11]===.25));
 const ExcelJS=await loadExcelJS(),book=new ExcelJS.Workbook();await book.xlsx.load(await xlsxBytes(tables,ExcelJS));let exploration=0;book.getWorksheet('Itinerary').eachRow((row,i)=>{if(i>5)exploration+=Number(row.getCell(5).value)||0});assert.equal(exploration,.25);
});

test('every departure month retains fractional site visits with coherent Pacific trips and reconciled days',()=>{
 const parks=runtimeParks.filter(p=>['arch','hale','havo','npsa'].includes(p.id)).map(p=>({...p,days:1})),sites=[...parks,stop('extra','site',.25)],input={...settings,autoMonth:true,airportCodes:['SEA'],restDays:2},r=optimizeTrip(sites,input);assert.equal(r.monthResults.length,12);
 for(const month of r.monthResults){assert.equal(month.parkDays,4.25);assert.equal(month.visits.find(v=>v.id==='extra').days,.25);reconcile(sites,month,input);}
});
