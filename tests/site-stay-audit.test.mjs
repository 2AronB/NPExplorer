import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SITE_STAYS,resolveSiteDays} from '../site-stays.mjs';
import {currentInventory} from '../current-inventory.mjs';
import {buildSiteStays} from '../scripts/build-site-stays.mjs';
import {alongCandidates,previewAlong} from '../along-the-way.mjs';
import {familyStayExplanation,siteVisitReviewHtml} from '../site-stay-ui.mjs';
import {siteVisitText} from '../site-visit-review.mjs';
import {buildPreparationTasks,validatePreparation,preparationTaskLabel} from '../preparation.mjs';
import {createSnapshot} from '../scenarios.mjs';
import {schedule} from '../optimizer.mjs';
import {DEFAULT_SETTINGS,MAX_PLAN_IMPORT_BYTES} from '../plan-defaults.mjs';
import {exportTables,csvText,xlsxBytes} from '../trip-export.mjs';
import {loadExcelJS} from '../scripts/sample-itineraries.mjs';
import {buildCalendarModel,nextAccessWarningDate} from '../calendar.mjs';
const inventory=currentInventory(JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites);
const settings={...DEFAULT_SETTINGS,autoMonth:false,stayMode:'highlights',startDate:'2040-06-01',detourHours:12};
const state=ids=>({version:1,selected:ids,settings:structuredClone(settings),days:{},rules:{},custom:[],priorities:{},calibration:{},preparation:{}});
const resolved=ids=>inventory.filter(s=>ids.includes(s.id)).map(s=>({...s,days:resolveSiteDays(s,settings)}));
function parseCsv(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}return rows;}
test('canonical source, generated module and public CSV are reproducible and retain every reviewed ID',async()=>{
 await buildSiteStays({check:true});const data=JSON.parse(fs.readFileSync(new URL('../data/site-stay-audit.json',import.meta.url)));assert.deepEqual(SITE_STAYS,data.records);
 const rows=parseCsv(fs.readFileSync(new URL('../data/site-stays.csv',import.meta.url),'utf8').replace(/^\uFEFF/,''));assert.equal(rows.length,335);assert.equal(new Set(rows.slice(1).map(r=>r[0])).size,334);
 for(const row of rows.slice(1)){assert.equal(row.length,rows[0].length);const p=SITE_STAYS[row[0]];assert.equal(+row[3],p.fast);assert.equal(+row[4],p.slow);assert.equal(row[11],p.fastScope);assert.equal(row[12],p.slowScope);assert.equal(row[13],p.caveat);assert.equal(row[10],p.sourceChecked);assert.ok(p.sources.every(s=>s.url.startsWith('https://')&&s.reviewed===data.reviewed));}
});
test('high-risk access and inventory issues are explicit rather than an acreage-to-duration claim',()=>{
 assert.equal(SITE_STAYS.pima.discovery,'not-public');assert.equal(SITE_STAYS.naca.discovery,'umbrella');assert.match(SITE_STAYS.rrbh.reference,/^https:\/\/yaf\.org\//);assert.match(SITE_STAYS.rrbh.caveat,/not assumed to be an NPS-run/);
 assert.match(SITE_STAYS.rabr.caveat,/No road/);assert.match(SITE_STAYS.poch.caveat,/military/);assert.match(SITE_STAYS.orca.caveat,/42 inches/);assert.match(SITE_STAYS.mimi.caveat,/six years/);assert.match(SITE_STAYS.wefa.caveat,/cannot accommodate RVs/);assert.match(SITE_STAYS.sacr.caveat,/not open/);assert.match(SITE_STAYS.crmp.caveat,/same monument loop/);
 assert.equal(SITE_STAYS.moru.slow,.5);assert.equal(SITE_STAYS.tupe.slow,.25);
});
test('automatic discovery omits non-public and administrative records while saved selections and overrides survive',()=>{
 for(const id of ['pima','naca']){const stop=inventory.find(s=>s.id===id),anchor={...stop,id:'anchor',type:'park',days:1},s=state(['anchor']),result=schedule([anchor],s.settings);assert.equal(alongCandidates({state:s,sites:[anchor,stop],result}).length,0);assert.throws(()=>previewAlong({state:s,sites:[anchor,stop],result,id,days:.25}));s.selected=[id];s.days[id]=.75;assert.equal(resolveSiteDays(stop,s.settings,s.days),.75);const kept=schedule([{...stop,days:.75}],s.settings);assert.equal(kept.parkDays,.75);assert.ok(siteVisitText(stop));}
});
test('every selected other site gets a stable preparation topic and all inventory tasks fit the bounded schema',()=>{
 const all=inventory.map(s=>s.type==='site'?{...s,days:resolveSiteDays(s,settings)}:s),s=state(all.map(s=>s.id)),tasks=buildPreparationTasks({state:s,sites:all});assert.equal(tasks.filter(t=>t.id.startsWith('site:')).length,334);assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 const records=Object.fromEntries(tasks.map(t=>[t.id,{status:'researched',notes:'Family plan',checkedOn:null,forDate:null}]));assert.deepEqual(validatePreparation(records),records);assert.ok(tasks.length<1000);assert.match(preparationTaskLabel('site:orca:visit',all),/Oregon Caves.*family outing/);
 const pima=tasks.find(t=>t.id==='site:pima:visit');assert.match(pima.title,/non-public/);assert.match(pima.summary,/not open/);
});
test('a full bounded preparation history with Unicode notes remains within the JSON import allowance',()=>{
 const records=Object.fromEntries(Array.from({length:1000},(_,i)=>['site:history-'+i+':visit',{status:'researched',notes:'森'.repeat(1000),checkedOn:null,forDate:null}]));const s=state(['flfo']);s.preparation=validatePreparation(records);const serialized=JSON.stringify(s),bytes=new TextEncoder().encode(serialized).byteLength;assert.ok(bytes>2_000_000,'This valid history exceeded the former file cap');assert.ok(bytes<MAX_PLAN_IMPORT_BYTES);assert.deepEqual(validatePreparation(JSON.parse(serialized).preparation),records);
});
test('site preparation uses first exploration, retains notes across deselection and flags changed dates',()=>{
 const sites=resolved(['flfo','chcu']),s=state(sites.map(s=>s.id)),r=schedule(sites,s.settings);const id='site:flfo:visit',visitDate=r.visits.find(v=>v.id==='flfo').arrival;s.preparation[id]={status:'booked',notes:'Confirm child access',checkedOn:'2026-11-01',forDate:visitDate};
 const tasks=result=>buildPreparationTasks({state:s,sites,result});assert.equal(tasks(r).find(t=>t.id===id).visitDate,visitDate);assert.equal(tasks(r).find(t=>t.id===id).contextChanged,false);assert.equal(tasks(null).find(t=>t.id===id).contextChanged,false);
 const changed=schedule(sites,{...s.settings,startDate:'2040-07-01'});assert.equal(tasks(changed).find(t=>t.id===id).contextChanged,true);assert.equal(tasks(changed).find(t=>t.id===id).status,'booked');s.selected=['chcu'];assert.ok(!tasks(r).some(t=>t.id===id));assert.equal(s.preparation[id].notes,'Confirm child access');s.selected.push('flfo');assert.equal(tasks(r).find(t=>t.id===id).status,'booked');
});
test('CSV and workbook retain site caveats without changing the travel ledger or suppressing non-public warnings',async()=>{
 const sites=resolved(['pima','orca','crmp']),s=state(sites.map(s=>s.id)),r=schedule(sites,s.settings);s.preparation['site:pima:visit']={status:'booked',notes:'User-entered status',checkedOn:null,forDate:null};const tables=exportTables({state:s,sites,result:r});assert.equal(tables.travelDocument.accounting.days,r.totalDays);assert.equal(tables.travelDocument.accounting.exploration,r.parkDays);assert.match(csvText(tables.itinerary),/not open to the public/);assert.match(csvText(tables.itinerary),/42 inches/);
 const ExcelJS=await loadExcelJS(),book=new ExcelJS.Workbook();await book.xlsx.load(await xlsxBytes(tables,ExcelJS));assert.match(JSON.stringify(book.getWorksheet('Itinerary').model),/not open to the public/);assert.match(JSON.stringify(book.getWorksheet('Checklist').model),/not open to the public/);assert.match(JSON.stringify(book.getWorksheet('Checklist').model),/User: Booked/);
});
test('saved alternatives freeze reviewed scopes and legacy saved reports do not acquire current audit facts',()=>{
 const sites=resolved(['orca']),s=state(['orca']),r=schedule(sites,s.settings),snap=createSnapshot({id:'audit',name:'Family tour',state:s,sites,result:r,versions:{data:'audit'}});snap.sites[0].familyVisit.caveat='Archived family caveat';const tables=exportTables({state:s,sites:snap.sites,result:r,preparationTasks:[],reportContext:{name:snap.name}});assert.match(csvText(tables.itinerary),/Archived family caveat/);assert.doesNotMatch(csvText(tables.itinerary),/42 inches/);assert.match(SITE_STAYS.orca.caveat,/42 inches/);
 const legacy=exportTables({state:s,sites,result:r,preparationTasks:[],reportContext:{name:'Before audit'}});assert.doesNotMatch(csvText(legacy.itinerary),/42 inches/);
 const legacyCalendar=buildCalendarModel({state:s,sites,result:r,reportContext:{name:'Before audit'}});assert.doesNotMatch(JSON.stringify(legacyCalendar.days),/42 inches/);assert.match(JSON.stringify(legacyCalendar.days),/no archived site audit/);
});
test('a site fully shared with driving keeps its audit caveat on the actual Calendar activity',()=>{
 const sites=resolved(['flfo']),s=state(['flfo']),r=schedule(sites,s.settings),calendar=buildCalendarModel({state:s,sites,result:r});const shared=calendar.days.flatMap(d=>d.events).filter(e=>e.siteId==='flfo'&&e.shared);assert.ok(shared.length>0);assert.ok(shared.every(e=>e.notes.includes(SITE_STAYS.flfo.caveat)));assert.equal(calendar.days.length,r.totalDays);
});
test('Calendar concern navigation includes site tour and non-public cautions regardless of user booking status',()=>{
 const sites=resolved(['orca','pima']),s=state(sites.map(s=>s.id)),r=schedule(sites,s.settings);for(const site of sites)s.preparation['site:'+site.id+':visit']={status:'booked',notes:'User says booked',checkedOn:null,forDate:null};const calendar=buildCalendarModel({state:s,sites,result:r}),ids=new Set(calendar.days.flatMap(d=>d.accessWarnings).map(w=>w.siteId));assert.deepEqual([...ids].sort(),['orca','pima']);const first=nextAccessWarningDate(calendar,'1900-01-01');assert.ok(calendar.byDate.get(first).accessWarnings.length);assert.ok(calendar.days.some(d=>d.accessWarnings.some(w=>w.message.includes('not open to the public'))));assert.equal(calendar.days.length,r.totalDays);
});
test('audit markup makes access visible and escapes user-provided names',()=>{
 const pima=inventory.find(s=>s.id==='pima');assert.match(familyStayExplanation(pima),/not open to the public/);assert.match(familyStayExplanation(inventory.find(s=>s.id==='orca')),/42 inches/);const html=siteVisitReviewHtml([{...pima,name:'<script>',shortName:'<img src=x>'}]);assert.doesNotMatch(html,/<script|<img/);assert.match(html,/&lt;img/);assert.equal(siteVisitReviewHtml([]),'');
});
