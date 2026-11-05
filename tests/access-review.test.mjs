import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadExcelJS} from '../scripts/sample-itineraries.mjs';
import {explorationVisits,reviewTripAccess,accessSummaryHtml,accessWarningsHtml} from '../access-review.mjs';

test('zero access flags use a quiet summary while actual flags and research gaps retain warnings',()=>{
 const base={visits:[],sources:{},affectedStops:0,unknownStops:0,limitations:['No flag is not a guarantee of access.']};
 const clean=accessSummaryHtml(base);
 assert.match(clean,/Access review · no modeled flags/);assert.doesNotMatch(clean,/class="warning/);
 assert.match(clean,/No flag is not a guarantee/);
 for(const change of [{affectedStops:1},{unknownStops:1}])assert.match(accessSummaryHtml({...base,...change}),/class="warning access-review"/);
});
import {schedule} from '../optimizer.mjs';
import {optimizeTrip} from '../trip-optimizer.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
import {currentInventory} from '../current-inventory.mjs';
import {buildCalendarModel} from '../calendar.mjs';
import {exportTables,xlsxBytes} from '../trip-export.mjs';
const read=file=>JSON.parse(fs.readFileSync(new URL('../'+file,import.meta.url)));
const audit=read('data/seasonal-access-audit.json'),research=read('data/seasonal-research/seasonal-access.json');
const sites=[...currentInventory(read('data/sites.json').sites),...REMOTE_PARKS];
const review=result=>reviewTripAccess({result,sites,audit,research});
const simple=(id,arrival,departure,days=1)=>({visits:[{id,arrival,departure,days}]});
const kinds=r=>r.visits[0].warnings.map(w=>w.kind);

test('actual winter dates warn for core experiences while summer and partial access stay distinct',()=>{
 for(const id of ['romo','yell'])assert.ok(kinds(review(simple(id,'2040-01-01','2040-01-02'))).includes('major'));
 assert.ok(kinds(review(simple('romo','2040-05-01','2040-05-02'))).includes('transition'));
 for(const id of ['romo','yell'])assert.deepEqual(kinds(review(simple(id,'2040-08-01','2040-08-02'))),[]);
 for(const id of ['yose','grca'])assert.deepEqual(kinds(review(simple(id,'2040-01-01','2040-01-02'))),['partial']);
 assert.match(accessSummaryHtml(review(simple('romo','2040-01-01','2040-01-02'))),/Bear Lake/);
});
test('month-spanning samples retain arrival, standalone and departure weights on their real dates',()=>{
 const result={visits:[{id:'romo',arrival:'2040-04-30',stayStart:'2040-05-01',stayEnd:'2040-05-02',departure:'2040-05-03',days:2,sharedDays:.25,departureSharedDays:.75,departureDriveDate:'2040-05-02'}]};
 const r=review(result),v=r.visits[0];assert.equal(v.evaluatedDays,2);assert.deepEqual(v.samples.map(s=>[s.date,s.weight]),[['2040-04-30',.25],['2040-05-01',1],['2040-05-02',.75]]);
 assert.equal(v.warnings.find(w=>w.kind==='major').affectedExplorationDays,.25);
 assert.deepEqual(v.warnings.find(w=>w.kind==='transition').affectedDates,['2040-05-01','2040-05-02']);
 assert.equal(r.affectedStops,1);
});
test('fully shared visits do not invent standalone exploration or count unused stay capacity',()=>{
 const result={visits:[{id:'romo',arrival:'2040-04-30',stayStart:'2040-05-01',stayEnd:'2040-05-01',departure:'2040-05-02',days:1,sharedDays:.25,departureSharedDays:.75,departureDriveDate:'2040-05-01'}]};
 const [v]=explorationVisits(result);assert.equal(v.evaluatedDays,1);assert.equal(v.samples.length,2);assert.deepEqual(v.issues,[]);
 const unused=explorationVisits({visits:[{id:'romo',arrival:'2040-05-01',stayStart:'2040-05-02',stayEnd:'2040-05-04',departure:'2040-05-04',days:2,sharedDays:.75,unusedDays:.75}]})[0];
 assert.deepEqual(unused.samples.map(s=>s.weight),[.75,1,.25]);assert.equal(unused.evaluatedDays,2);
});
test('published recurring island closure respects inclusive boundaries and survives user season overrides',()=>{
 for(const day of ['2040-01-01','2040-04-15','2040-11-01'])assert.ok(kinds(review(simple('isro',day,new Date(Date.parse(day)+86400000).toISOString().slice(0,10)))).includes('legal'));
 assert.ok(!kinds(review(simple('isro','2040-04-16','2040-04-17'))).includes('legal'));
 const r=review(simple('isro','2040-01-01','2040-01-02'));assert.equal(r.counts.legal,1);assert.equal(r.counts.major,0);assert.equal(r.visits[0].warnings[0].basis,'published_recurring');
});
test('year-specific and temporary claims never become a recurring 2040 closure',()=>{
 const modified=structuredClone(research),base=structuredClone(modified.parks.romo.accessRules[0]);
 modified.parks.romo.accessRules.push({...base,scope:'park',impact:'full_closure',temporal:{type:'current_year_published_schedule',year:2026,intervals:[{start:'2026-08-01',end:'2026-08-31'}]}},{...base,scope:'park',impact:'full_closure',temporal:{type:'temporary_alert',validUntil:null}});
 const r=reviewTripAccess({result:simple('romo','2040-08-01','2040-08-02'),sites,audit,research:modified});assert.deepEqual(kinds(r),[]);
});
test('missing evidence and unreconciled dates remain unknown; personal stops do not inflate park counts',()=>{
 const result=simple('romo','2040-01-01','2040-01-02');
 assert.equal(reviewTripAccess({result,sites,audit:null,research}).unknownStops,1);
 assert.equal(reviewTripAccess({result,sites,audit,research:null}).affectedStops,0);
 assert.equal(review(simple('romo','2040-01-01','2040-01-02',3)).unknownStops,1);
 const personal=reviewTripAccess({result:simple('custom-1','2040-01-01','2040-01-02'),sites:[{id:'custom-1',type:'custom'}],audit,research});assert.equal(personal.visits.length,0);
 const remote=review(simple('kova','2040-08-01','2040-08-02'));assert.ok(kinds(remote).includes('unknown'));assert.ok(!kinds(remote).includes('legal'));
});
test('all-month real mainland schedules reconcile exploration weights without changing solver output',()=>{
 const stops=['romo','arch','cany','yose'].map(id=>({...sites.find(s=>s.id===id),days:2}));
 for(let month=1;month<=12;month++){
  const settings={...DEFAULT_SETTINGS,autoMonth:false,startDate:`2040-${String(month).padStart(2,'0')}-28`,end:{...DEFAULT_SETTINGS.start,id:'finish'}};
  const result=schedule(stops,settings),before=JSON.stringify(result),r=review(result);
  assert.equal(JSON.stringify(result),before);
  for(const v of r.visits){assert.deepEqual(v.issues,[],v.siteId);assert.equal(v.evaluatedDays,v.requestedDays);}
 }
});
test('combined Pacific and Alaska expand individual parks once and retain ground exploration days',()=>{
 const stops=REMOTE_PARKS.filter(s=>['hale','havo','npsa','gaar','kova'].includes(s.id));
 const settings={...DEFAULT_SETTINGS,autoMonth:false,startDate:'2040-06-01',end:{...DEFAULT_SETTINGS.start,id:'finish'},alaskaMode:'fly'};
 const result=optimizeTrip(stops,settings),r=review(result);
 assert.deepEqual(r.visits.map(v=>v.siteId).sort(),stops.map(s=>s.id).sort());
 for(const v of r.visits){assert.equal(v.evaluatedDays,v.requestedDays);assert.deepEqual(v.issues,[]);assert.ok(!v.siteId.startsWith('excursion'));}
});
test('Calendar, CSV and actual workbook checklist use the same affected exploration dates',async()=>{
 const stops=[{...sites.find(s=>s.id==='romo'),days:2}],settings={...DEFAULT_SETTINGS,autoMonth:false,startDate:'2040-01-01',end:{...DEFAULT_SETTINGS.start,id:'finish'}},state={selected:['romo'],settings};
 const result=schedule(stops,settings),accessReview=review(result),input={state,sites,result,accessReview};
 const calendar=buildCalendarModel(input),r=accessReview.visits[0];
 for(const sample of r.samples)assert.ok(calendar.byDate.get(sample.date).accessWarnings.some(w=>w.siteId==='romo'));
 assert.equal(calendar.days.length,result.totalDays);assert.match(accessWarningsHtml(accessReview,{siteId:'romo',date:r.samples[0].date}),/Bear Lake/);
 const tables=exportTables({...input,reportContext:{name:'Winter alternative',savedAt:'2026-10-31T19:00:00Z',stale:true}}),action=tables.travelDocument.actions.find(a=>a.status==='Review access');
 assert.match(action.action,new RegExp(r.samples[0].date));assert.match(action.url,/nps.gov/);assert.ok(tables.itinerary.some(row=>String(row.at(-1)).includes('Core highlights restricted')));
 const ExcelJS=await loadExcelJS(),bytes=await xlsxBytes(tables,ExcelJS),book=new ExcelJS.Workbook();await book.xlsx.load(bytes);
 assert.equal(book.worksheets.length,5);assert.ok(book.getWorksheet('Checklist').getColumn(4).values.some(v=>String(v).includes('Core highlights restricted')));
 assert.match(JSON.stringify(book.getWorksheet('Overview').model),/Winter alternative/);assert.match(JSON.stringify(book.getWorksheet('Overview').model),/Older result/);
});
test('warning markup escapes names and ignores unsafe evidence URLs',()=>{
 const r=review(simple('romo','2040-01-01','2040-01-02'));r.visits[0].displayName='<img src=x onerror=alert(1)>';r.sources['romo-hours']={title:'bad',url:'javascript:alert(1)'};
 const html=accessSummaryHtml(r);assert.ok(!html.includes('<img'));assert.ok(!html.includes('javascript:'));assert.ok(html.includes('&lt;img'));
});
