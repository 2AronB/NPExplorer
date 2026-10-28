import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {exportTables,csvText,xlsxBytes,ITINERARY_HEADERS} from '../trip-export.mjs';import {schedule} from '../optimizer.mjs';import {optimizeTrip} from '../trip-optimizer.mjs';import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';import {REMOTE_PARKS} from '../remote-parks.mjs';import {withPriorityDefault} from '../personal-priority.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
const by=id=>structuredClone(data.find(s=>s.id===id));
const context={};vm.runInNewContext(fs.readFileSync(new URL('../vendor/xlsx.mini.min.js',import.meta.url),'utf8'),context);const XLSX=context.XLSX;
const settings={...DEFAULT_SETTINGS,autoMonth:false,startDate:'2040-06-01',airportCodes:['MIA'],restDays:3};
const build=(sites,result)=>exportTables({sites,result,state:{selected:sites.map(s=>s.id),settings,calibration:{},rules:{}},exportedAt:'2026-10-28T12:00:00Z'});
const col=key=>ITINERARY_HEADERS.indexOf(key);
test('CSV escapes quotes, commas and newlines, preserves Unicode and guards formula-like text',()=>{
 const csv=csvText([['Name','Value'],['Hawaiʻi, "volcano"\nstop',12],['=HYPERLINK("bad")',-105],[' @SUM(1)',0]]);
 assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes('"Hawaiʻi, ""volcano""\nstop",12'));assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes("' @SUM(1)"));assert.ok(csv.includes(',-105\r\n'));
});
test('uncalculated reports keep selected stays and priorities without inventing dates or order',()=>{
 const s=withPriorityDefault(by('yell')),tables=build([s],null),row=tables.itinerary[1];assert.equal(row[col('Site ID')],'yell');assert.equal(row[col('Full destination days')],8);assert.equal(row[col('Personal priority /5')],5);assert.equal(row[col('Start date')],'');assert.equal(row[col('Stop number')],'');assert.ok(row.at(-1).includes('not calculated'));
});
test('mainland report reconciles visits, closure waits, remote transfers, finish and rest days',()=>{
 const sites=[by('isro'),by('acad')],s={...settings,startDate:'2040-01-01'},r=schedule(sites,s),tables=exportTables({sites,result:r,state:{selected:sites.map(s=>s.id),settings:s}}),rows=tables.itinerary.slice(1);
 assert.equal(rows.reduce((n,row)=>n+Number(row[col('Days')]),0),r.totalDays);assert.equal(rows.reduce((n,row)=>n+Number(row[col('Full destination days')]),0),r.parkDays);
 assert.ok(rows.some(row=>row[col('Event')]==='Closure wait'));assert.ok(rows.some(row=>row[col('Event')]==='Return / finish drive'));assert.ok(rows.some(row=>row[col('Event')]==='Rest-day reserve'));assert.equal(rows.filter(row=>row[col('Event')]==='Park / destination stay').length,2);
});
test('OCONUS reports contain individual parks, continuous stop numbers and a complete transport ledger',()=>{
 const sites=[withPriorityDefault(by('yell')),...REMOTE_PARKS.filter(s=>['dena','katm','hale','havo'].includes(s.id)).map(withPriorityDefault)],r=optimizeTrip(sites,settings),tables=build(sites,r),rows=tables.itinerary.slice(1),parks=rows.filter(row=>row[col('Event')]==='Park / destination stay');
 assert.equal(parks.length,5);assert.deepEqual(parks.map(row=>row[col('Stop number')]),[1,2,3,4,5]);assert.equal(rows.reduce((n,row)=>n+Number(row[col('Days')]),0),r.totalDays);assert.equal(parks.reduce((n,row)=>n+row[col('Full destination days')],0),r.parkDays);
 assert.ok(rows.some(row=>row[col('Event')]==='Commercial flight'));assert.ok(rows.some(row=>row[col('Event')]==='Regional drive'));assert.ok(rows.some(row=>row[col('Event')]==='Contingency buffer'));
 for(let i=1;i<rows.length;i++)assert.ok(rows[i][col('Start date')]>=rows[i-1][col('Start date')]);
 const output=xlsxBytes(tables,XLSX),book=XLSX.read(new Uint8Array(output),{type:'array'});assert.deepEqual(Array.from(book.SheetNames),['Summary','Itinerary','Selected places','Settings']);
 const read=XLSX.utils.sheet_to_json(book.Sheets.Itinerary,{header:1,defval:''});assert.equal(read.length,tables.itinerary.length);assert.equal(read.filter(row=>row[col('Event')]==='Park / destination stay').length,5);assert.equal(typeof read[1][col('Days')],'number');
 assert.ok(book.Sheets.Itinerary['!autofilter']);
});
test('XLSX stores formula-like personal names as literal text',()=>{
 const s={id:'custom-family',type:'custom',name:'=1+1',shortName:'=1+1',days:3,lat:40,lng:-100},tables=build([s],null),book=XLSX.read(new Uint8Array(xlsxBytes(tables,XLSX)),{type:'array'}),cell=book.Sheets.Itinerary.F2;
 assert.equal(cell.t,'s');assert.equal(cell.v,'=1+1');assert.equal(cell.f,undefined);
});
