import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildPreparationTasks,validatePreparation,preparationSummary,preparationText,preparationTaskLabel} from '../preparation.mjs';
import {preparationReportHtml} from '../preparation-ui.mjs';
import {DEFAULT_SETTINGS,upgradePlanPreferences} from '../plan-defaults.mjs';
import {runtimeParks,loadExcelJS} from '../scripts/sample-itineraries.mjs';
import {schedule} from '../optimizer.mjs';
import {optimizeTrip} from '../trip-optimizer.mjs';
import {exportTables,xlsxBytes,csvText} from '../trip-export.mjs';
import {createSnapshot,inputDifferences,openScenarioStore} from '../scenarios.mjs';
const research=JSON.parse(fs.readFileSync(new URL('../data/reservation-requirements.json',import.meta.url)));
const settings={...DEFAULT_SETTINGS,autoMonth:false,startDate:'2040-06-01',restDays:2,airportCodes:['SEA']};
const sites=runtimeParks.filter(p=>['arch','cany'].includes(p.id));
const state=()=>({version:1,preferencesRevision:3,settings:structuredClone(settings),selected:sites.map(s=>s.id),days:{},rules:{},priorities:{},custom:[],calibration:{},preparation:{}});
const record=(extra={})=>({status:'booked',notes:'Ask operator about pickup',checkedOn:'2026-10-31',forDate:'2040-06-01',...extra});
const tasks=(s,result=null,inventory=sites)=>buildPreparationTasks({state:s,sites:inventory,result,research});

test('preparation schema validates statuses, exact dates and bounded plain-text notes',()=>{
 const map={'park:arch:access':record()};assert.deepEqual(validatePreparation(map),map);assert.deepEqual(validatePreparation(),{});
 for(const raw of [null,[],{'bad':record()},{'park:arch:access':record({status:'complete'})},{'trip:x':record({status:['booked']})},{'trip:x':record({checkedOn:'2026-02-29'})},{'trip:x':record({forDate:false})},{'trip:x':record({notes:'x'.repeat(1001)})},{'trip:x':record({notes:2})}])assert.throws(()=>validatePreparation(raw));
 assert.equal(validatePreparation({'trip:x':record({checkedOn:'2040-02-29',forDate:null,notes:'🦅\n=SUM(A1)'})})['trip:x'].notes,'🦅\n=SUM(A1)');
 assert.throws(()=>validatePreparation(Object.fromEntries(Array.from({length:1001},(_,i)=>['trip:'+i,record()]))));
});
test('legacy inputs migrate empty preparation without overwriting saved records',()=>{
 const old=state();delete old.preparation;const migrated=upgradePlanPreferences(old);assert.deepEqual(migrated.preparation,{});assert.equal(old.preparation,undefined);
 const current=state();current.preparation={'trip:transport':record()};assert.deepEqual(upgradePlanPreferences(current).preparation,current.preparation);
});
test('selected scoped research creates stable topics without historical programs or future deadlines',()=>{
 const s=state(),list=tasks(s);assert.ok(list.some(t=>t.id==='rule:arch:arch-fiery-self'));assert.ok(!list.some(t=>t.id.includes('arch-entry-pilot')));assert.ok(list.every(t=>!t.due));
 assert.equal(list.filter(t=>!t.siteId).length,4);assert.ok(list.filter(t=>t.siteId).every(t=>t.visitDate===null));assert.ok(list.every(t=>t.status==='unchecked'));assert.equal(tasks({...s,selected:[]}).length,0);
 const total=tasks({...s,selected:runtimeParks.map(p=>p.id)},null,runtimeParks);assert.ok(total.length<400);assert.equal(total.filter(t=>t.id.startsWith('park:')).length,64);assert.equal(new Set(total.map(t=>t.id)).size,total.length);assert.equal(Object.keys(validatePreparation(Object.fromEntries(total.map(t=>[t.id,record()])))).length,total.length);
});
test('deselection and missing research retain records without applying them to unrelated parks',()=>{
 const s=state();s.preparation={'park:arch:access':record()};const serialized=JSON.stringify(s.preparation);s.selected=['cany'];assert.ok(!tasks(s).some(t=>t.id==='park:arch:access'));assert.equal(JSON.stringify(s.preparation),serialized);
 s.selected.push('arch');assert.equal(tasks(s).find(t=>t.id==='park:arch:access').status,'booked');const fallback=buildPreparationTasks({state:s,sites});assert.ok(fallback.some(t=>t.id==='park:arch:access'));assert.ok(!fallback.some(t=>t.id.startsWith('rule:')));
});
test('date changes require review while retaining status and independent solver output',()=>{
 const s=state(),r=schedule(sites,s.settings),date=r.visits.find(v=>v.id==='arch').arrival;s.preparation={'park:arch:access':record({forDate:date})};
 assert.ok(!tasks(s,r).find(t=>t.id==='park:arch:access').contextChanged);const other=schedule(sites,{...s.settings,startDate:'2040-07-01'}),changed=tasks(s,other).find(t=>t.id==='park:arch:access');
 assert.ok(changed.contextChanged);assert.equal(changed.status,'booked');assert.ok(!tasks(s).find(t=>t.id==='park:arch:access').contextChanged,'Reload with no result must not invent a date change');assert.match(preparationText(changed),/DATE CHANGED/);
 assert.deepEqual(schedule(sites,s.settings),r);assert.equal(preparationSummary([changed]).review,1);
 s.preparation['park:arch:access'].forDate=changed.visitDate;assert.ok(!tasks(s,other).find(t=>t.id==='park:arch:access').contextChanged);
});
test('shared arrival and individual remote visits use their actual first exploration dates',()=>{
 const s=state(),r=schedule(sites,s.settings);for(const visit of r.visits)assert.equal(tasks(s,r).find(t=>t.id==='park:'+visit.id+':access').visitDate,visit.arrival);
 const remote=runtimeParks.filter(p=>['hale','havo','npsa'].includes(p.id));s.selected=remote.map(p=>p.id);const result=optimizeTrip(remote,s.settings),list=tasks(s,result,remote);
 for(const visit of result.excursions.flatMap(b=>b.visits))assert.equal(list.find(t=>t.id==='park:'+visit.id+':access').visitDate,visit.arrival);
});
test('JSON and saved alternatives preserve preparation records and frozen report topics',()=>{
 const s=state(),r=schedule(sites,s.settings);s.preparation={'park:arch:access':record()};const list=tasks(s,r),snap=createSnapshot({id:'prep',name:'Booked plan',state:s,sites,result:r,preparationTasks:list,versions:{app:'prep'}});
 s.preparation['park:arch:access'].notes='Changed';assert.notEqual(snap.state.preparation['park:arch:access'].notes,'Changed');assert.notEqual(snap.preparationTasks.find(t=>t.id==='park:arch:access').notes,'Changed');
 let saved=null;const store=openScenarioStore({getItem:()=>saved,setItem:(_,v)=>saved=v},p=>({...p,preparation:validatePreparation(p.preparation)}));store.save(snap);const restored=openScenarioStore({getItem:()=>saved,setItem:()=>{}},p=>p).items[0];assert.deepEqual(restored.preparationTasks,snap.preparationTasks);assert.deepEqual(validatePreparation(JSON.parse(JSON.stringify(snap.state)).preparation),snap.state.preparation);
 assert.ok(inputDifferences({...snap,state:s},snap).some(d=>d.label.startsWith('Preparation')));
});
test('workbook and CSV keep user preparation separate from conflicts and preserve the ledger',async()=>{
 const s=state();s.settings.arrivalWindows={arch:{earliest:null,latest:'2040-05-31'}};s.preparation={'park:arch:access':record({notes:'=1+2\nCall operator'}),'trip:transport':record({status:'ready',notes:'Confirm pickup'})};const r=schedule(sites,s.settings),tables=exportTables({state:s,sites,result:r,research}),doc=tables.travelDocument;
 assert.ok(doc.actions.some(a=>a.status==='User: Booked'));assert.ok(doc.actions.some(a=>a.status==='CONFLICT'));assert.ok(doc.actions.some(a=>a.action.includes('Fiery Furnace self-guided exploration')));assert.equal(doc.accounting.days,r.totalDays);assert.equal(doc.accounting.exploration,r.parkDays);
 const csv=csvText(tables.itinerary);assert.match(csv,/User status: Booked/);assert.match(csv,/Confirm pickup/);assert.match(csv,/Call operator/);
 const ExcelJS=await loadExcelJS(),book=new ExcelJS.Workbook();await book.xlsx.load(await xlsxBytes(tables,ExcelJS));assert.equal(book.worksheets.length,5);const checklist=book.getWorksheet('Checklist'),text=JSON.stringify(checklist.model);assert.match(text,/User: Booked/);assert.match(text,/CONFLICT/);assert.match(text,/Call operator/);assert.match(text,/not verified bookings/);
 let note;checklist.eachRow(row=>{if(String(row.getCell(4).value).includes('Call operator'))note=row.getCell(4).value});assert.equal(typeof note,'string');assert.ok(!note.formula);
});
test('preparation export works without a route and saved reports do not replace snapshot topics',()=>{
 const s=state();s.preparation={'park:arch:access':record()};const frozen=tasks(s),tables=exportTables({state:s,sites,result:null,preparationTasks:frozen});assert.equal(tables.travelDocument.preparationTasks.length,frozen.length);assert.ok(tables.travelDocument.actions.some(a=>a.status==='User: Booked'));assert.ok(tables.travelDocument.preparationTasks.filter(t=>t.siteId).every(t=>t.visitDate===null));
});
test('saved preparation markup escapes names, statuses and notes without editable forms',()=>{
 const html=preparationReportHtml([{place:'<img src=x>',title:'<script>',status:'booked',notes:'<svg onload=x>',checkedOn:'2026-10-31',contextChanged:true}]);assert.doesNotMatch(html,/<img|<script|<svg|<form|<button/);assert.match(html,/&lt;svg/);assert.match(html,/DATE CHANGED/);
});

test('unsafe research links are excluded and inactive records have readable labels',()=>{
 const data=structuredClone(research);for(const rule of data.parks.arch.rules){rule.bookingURL='javascript:alert(1)';rule.sourceIDs=[];}const list=buildPreparationTasks({state:state(),sites,research:data});assert.ok(list.filter(t=>t.siteId==='arch').every(t=>!t.url||t.url.startsWith('https://www.nps.gov/')));
 assert.match(preparationTaskLabel('park:arch:access',sites,data),/Arches.*Verify access/);assert.match(preparationTaskLabel('rule:arch:arch-fiery-self',sites,data),/Fiery Furnace/);assert.match(preparationTaskLabel('rule:gone:old',sites,data),/Previous destination.*Previous research topic/);assert.equal(preparationReportHtml(list),'');
});
