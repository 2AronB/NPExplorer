import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {samples,loadExcelJS,runtimeParks} from '../scripts/sample-itineraries.mjs';
import {PARK_HIGHLIGHTS} from '../park-highlights.mjs';
import {xlsxBytes,exportTables} from '../trip-export.mjs';
const ExcelJS=await loadExcelJS();
const x={};vm.runInNewContext(await fs.readFile(new URL('../vendor/xlsx.mini.min.js',import.meta.url),'utf8'),x);
const fixtures=samples();
test('every runtime national park has 1–5 sourced, dated editorial experiences',()=>{
 assert.equal(runtimeParks.length,64);assert.equal(Object.keys(PARK_HIGHLIGHTS).length,64);
 for(const s of runtimeParks){const p=PARK_HIGHLIGHTS[s.id];assert.equal(p.siteId,s.id);assert.equal(p.checkedAt,'2026-10-28');assert.ok(p.experiences.length>=1&&p.experiences.length<=5);for(const e of p.experiences){assert.ok(e.title&&e.description&&e.caveat);assert.match(e.url,/^https:\/\/www.nps.gov\//);}}
});
for(const f of fixtures)test(`${f.name}: workbook roundtrip, native presentation and accounting`,async()=>{
 const buffer=await xlsxBytes(f.tables,ExcelJS);
 const book=new ExcelJS.Workbook();await book.xlsx.load(buffer);
 assert.deepEqual(Array.from(book.worksheets,s=>s.name),['Overview','Itinerary','Park guide','Travel details','Checklist']);
 for(const s of book.worksheets){assert.equal(s.views[0].showGridLines,false);assert.equal(s.pageSetup.fitToWidth,1);assert.equal(s.pageSetup.fitToHeight,0);assert.ok(s.pageSetup.printArea);assert.ok(s.getCell('A2').font.bold);if(s.name!=='Overview'){assert.equal(s.views[0].ySplit,5);assert.ok(s.autoFilter);}}
 const itinerary=book.getWorksheet('Itinerary');
 const values={days:0,exploration:0,miles:0,hours:0};
 itinerary.eachRow((row,i)=>{if(i<6)return;for(const [key,col]of Object.entries({days:4,exploration:5,miles:6,hours:7}))values[key]+=typeof row.getCell(col).value==='number'?row.getCell(col).value:0;
  assert.equal(row.getCell(3).formula,undefined);
  if(f.result){assert.ok(row.getCell(1).value instanceof Date);assert.ok(row.getCell(2).value>=row.getCell(1).value);}else assert.equal(row.getCell(1).value,null);
 });
 if(f.result){for(const [key,total]of Object.entries({days:f.result.totalDays,exploration:f.result.parkDays,miles:f.result.miles,hours:f.result.hours}))assert.ok(Math.abs(values[key]-total)<1e-6,key);}
 const independentlyRead=x.XLSX.read(new Uint8Array(buffer),{type:'array',cellDates:true});
 assert.equal(independentlyRead.SheetNames.length,5);assert.ok(independentlyRead.Sheets.Itinerary.C6);
 const text=JSON.stringify(book.model);
 assert.ok(!/#VALUE!|#REF!|#DIV\/0!/.test(text));
 if(f.result)assert.ok(!/excursion-/.test(JSON.stringify(itinerary.model)));
 if(f.name==='appointment-missed')assert.ok(text.includes('MISSED by'));
 if(f.name==='mainland')assert.ok(f.result.sharedParkDays>0);
});
test('formula-like names remain text and unsafe URLs are not hyperlinks',async()=>{
 const f=fixtures[4],s={id:'custom-injection',type:'custom',name:'=HYPERLINK("unsafe")',shortName:'=HYPERLINK("unsafe")',url:'javascript:alert(1)',days:1};
 const tables=exportTables({sites:[s],state:{...f.state,selected:[s.id]},result:null});
 const b=new ExcelJS.Workbook();await b.xlsx.load(await xlsxBytes(tables,ExcelJS));
 const c=b.getWorksheet('Itinerary').getCell('C6');assert.equal(c.type,3);assert.ok(c.value.startsWith('=HYPERLINK'));assert.equal(c.formula,undefined);assert.equal(c.hyperlink,undefined);
});
test('unknown totals fail visibly rather than losing a schedule allocation',()=>{
 const f=fixtures[0];assert.throws(()=>exportTables({...f,result:{...f.result,totalDays:f.result.totalDays+1}}),/accounting mismatch/);
});
test('newer main morning-exploration contract retains allocations and explains shared dates',async()=>{
 const f=JSON.parse(await fs.readFile(new URL('./fixtures/morning-schedule.json',import.meta.url),'utf8'));
 const tables=exportTables(f),doc=tables.travelDocument;
 assert.equal(doc.accounting.days,f.result.totalDays);assert.equal(doc.accounting.exploration,9);
 assert.ok(doc.events.some(e=>e.departureSharedDays>0&&e.notes.includes('departure morning')));
 const b=new ExcelJS.Workbook();await b.xlsx.load(await xlsxBytes(tables,ExcelJS));
 assert.ok(JSON.stringify(b.getWorksheet('Travel details').model).includes('departure-morning exploration'));
});
