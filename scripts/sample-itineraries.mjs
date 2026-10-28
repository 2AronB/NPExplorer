// Public, synthetic fixtures only. Also used by export regression tests.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
import {currentInventory} from '../current-inventory.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
import {schedule} from '../optimizer.mjs';
import {optimizeTrip} from '../trip-optimizer.mjs';
import {exportTables,xlsxBytes} from '../trip-export.mjs';
const base=currentInventory(JSON.parse(await fs.readFile(new URL('../data/sites.json',import.meta.url))).sites);
export const runtimeParks=[...base,...REMOTE_PARKS].filter(s=>s.type==='park');
const by=id=>structuredClone(runtimeParks.find(s=>s.id===id));
export async function loadExcelJS(){
 const context={Date,Array,setTimeout,clearTimeout,setImmediate,TextEncoder,TextDecoder,Buffer,console,Uint8Array,ArrayBuffer};
 vm.runInNewContext(await fs.readFile(new URL('../vendor/exceljs.min.js',import.meta.url),'utf8'),context);
 return context.ExcelJS;
}
export function samples(){
 const settings={...DEFAULT_SETTINGS,startDate:'2040-06-01',autoMonth:false,airportCodes:['SEA'],restDays:2};
 const fixture=(name,sites,s=settings,calculate=sites=>schedule(sites,s))=>{
  const state={version:1,preferencesRevision:3,selected:sites.map(s=>s.id),settings:s,days:{},custom:sites.filter(s=>s.type==='custom'),rules:{},priorities:{},calibration:{}};
  const result=calculate?calculate(sites):null;
  return {name,sites,state,result,tables:exportTables({state,sites,result,exportedAt:'2026-10-28T12:00:00Z'})};
 };
 const appointment={id:'custom-public-demo',name:'Public demonstration appointment',shortName:'Public demonstration appointment',type:'custom',lat:38.8339,lng:-104.8214,days:2,fixedDate:'2040-06-10'};
 return [
  fixture('mainland',[by('grsa'),by('meve'),by('arch')]),
  fixture('alaska-hawaii',['dena','katm','hale','havo'].map(by),settings,sites=>optimizeTrip(sites,settings)),
  fixture('appointment-early',[appointment,by('romo')]),
  fixture('appointment-missed',[{...appointment,fixedDate:'2040-05-30'},by('grsa')]),
  fixture('uncalculated',['acad','jeff','yell','npsa'].map(by),settings,null),
  fixture('all-parks',runtimeParks,settings,null)
 ];
}
export async function writeSamples(output){
 const ExcelJS=await loadExcelJS();await fs.mkdir(output,{recursive:true});
 const fixtures=samples();
 for(const f of fixtures){await fs.writeFile(path.join(output,f.name+'.xlsx'),new Uint8Array(await xlsxBytes(f.tables,ExcelJS)));}
 await fs.writeFile(path.join(output,'accounting.json'),JSON.stringify(fixtures.map(f=>({name:f.name,schedule:f.result?{days:f.result.totalDays,exploration:f.result.parkDays,miles:f.result.miles,hours:f.result.hours,shared:f.result.sharedParkDays}:null,export:f.tables.travelDocument.accounting})),null,2));
 console.log(`Wrote ${fixtures.length} synthetic workbooks to ${output}`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await writeSamples(path.resolve(process.argv[2]||'outputs/itinerary-review'));
