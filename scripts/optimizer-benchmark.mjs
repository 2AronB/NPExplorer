// Development-only benchmark: fresh Node process per timing, no production telemetry.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'..');
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const load=(root,file)=>import(pathToFileURL(path.join(root,file)).href);
export async function benchmarkCases(root=project){
 const [{DEFAULT_SETTINGS},{REMOTE_PARKS},{currentInventory},{withPriorityDefault}]=await Promise.all(['plan-defaults.mjs','remote-parks.mjs','current-inventory.mjs','personal-priority.mjs'].map(f=>load(root,f)));
 const land=currentInventory(JSON.parse(fs.readFileSync(path.join(root,'data/sites.json'))).sites).filter(p=>p.type==='park');
 const all=[...land,...REMOTE_PARKS].map(withPriorityDefault),by=id=>structuredClone(all.find(p=>p.id===id));
 const mainland=['blca','arch','cany','care','yell','grte','deva','jotr','romo','jeff'].map(by);
 const settings={...DEFAULT_SETTINGS,startDate:'2040-04-01',autoMonth:false};
 const mixed=[...['blca','arch','yell','jeff','dena','katm','hale','havo','viis'].map(by),{id:'custom-appointment',type:'custom',shortName:'Fixed visit',lat:39,lng:-100,days:4,fixedDate:'2040-08-15'}];
 return {
  'mainland-single':{stops:mainland,settings},
  'alaska-compare':{stops:all.filter(p=>p.remote?.region==='alaska'),settings},
  'mixed-single':{stops:mixed,settings},
  'all-parks-single':{stops:all,settings},
  'mainland-monthly':{stops:mainland,settings:{...settings,autoMonth:true}},
  'mixed-monthly':{stops:mixed,settings:{...settings,autoMonth:true}},
  // Deliberately opt-in: twelve full all-park searches are expensive.
  'all-parks-monthly':{stops:all,settings:{...settings,autoMonth:true}}
 };
}

function validate(result,input,exportTables){
 const expected=input.stops.reduce((n,p)=>n+p.days,0);
 for(const r of result.monthResults||[result]){
  assert.equal(r.parkDays,expected);
  assert.equal(new Set(r.order).size,r.order.length);
  assert.ok((r.mainlandMiles??r.miles)<=r.maxMiles+.001);
  const rows=exportTables({sites:input.stops,result:r,state:{selected:input.stops.map(p=>p.id),settings:input.settings}}).itinerary.slice(1);
  assert.equal(rows.reduce((n,row)=>n+Number(row[10]),0),r.totalDays);
  assert.equal(rows.reduce((n,row)=>n+Number(row[11]),0),expected);
  for(const row of rows){assert.ok(Number(row[10])>=0);assert.equal((new Date(row[9])-new Date(row[8]))/86400000,Number(row[10]));}
  const allocated=rows.filter(row=>Number(row[10])>0);
  for(let i=1;i<allocated.length;i++)assert.equal(allocated[i][8],allocated[i-1][9],'Calendar allocations must be contiguous and nonoverlapping');
  assert.ok(Math.abs(r.miles-r.legs.reduce((n,l)=>n+l.miles,0)-(r.excursions||[]).reduce((n,e)=>n+e.miles,0))<1e-7);
  for(const d of r.legs.flatMap(l=>l.dailyActivities)){
   assert.ok(d.totalHours<=input.settings.dayBudget+1e-8);
   assert.ok(d.driveHours<=input.settings.maxDrive+1e-8);
  }
 }
 if(result.monthResults)assert.equal(result.score,Math.min(...result.monthResults.map(r=>r.score)));
}

async function worker(){
 const root=option('--root',project),name=option('--case','all-parks-single');
 const input=(await benchmarkCases(root))[name];assert.ok(input,`Unknown case ${name}`);
 const [{optimizeTrip},{exportTables}]=await Promise.all(['trip-optimizer.mjs','trip-export.mjs'].map(f=>load(root,f)));
 globalThis.__optimizerBench={};
 const before=performance.now(),result=optimizeTrip(input.stops,input.settings),ms=performance.now()-before;
 validate(result,input,exportTables);
 process.stdout.write(JSON.stringify({name,ms,inputHash:hash(input),resultHash:hash(result),counts:globalThis.__optimizerBench,score:result.score,miles:result.miles,days:result.totalDays,explorationDays:result.parkDays,quality:result.quality,appointmentConflicts:result.appointmentConflicts,waitDays:result.waitDays,appointmentWaitDays:result.appointmentWaitDays,months:result.monthResults?.length||1}));
}

function snapshot(ref,instrument=false){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'npexplorer-bench-'));
 const files=execFileSync('git',['ls-tree','-r','--name-only',ref||'HEAD'],{cwd:project,encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>/^[^/]+\.mjs$/.test(f)||f==='data/sites.json');
 for(const file of files){
  let source=ref?execFileSync('git',['show',`${ref}:${file}`],{cwd:project,encoding:'utf8'}):fs.readFileSync(path.join(project,file),'utf8');
  if(instrument){
   const hooks=file==='optimizer.mjs'?[
    ['export function travel(a,b,settings={}){','travelCalls'],
    ['export function schedule(order,settings,startDate=settings.startDate){','scheduleCalls'],
    ['export function isClosed(site,date){','closureChecks']
   ]:file==='excursions.mjs'?[
    ['export function evaluateExcursion(stop,date,settings,api){','excursionCalls']
   ]:[];
   for(const [signature,counter] of hooks){assert.ok(source.includes(signature),`Missing instrumentation hook: ${signature}`);source=source.replace(signature,signature+`globalThis.__optimizerBench.${counter}=(globalThis.__optimizerBench.${counter}||0)+1;`);}
   if(file==='excursions.mjs')source=source.replace('if(cache.has(key))return cache.get(key);','if(cache.has(key)){globalThis.__optimizerBench.excursionCacheHits=(globalThis.__optimizerBench.excursionCacheHits||0)+1;return cache.get(key);}');
  }
  fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),source);
 }
 return root;
}
function removeSnapshot(root){
 // Only remove the fresh, task-owned temporary snapshot, never a checkout.
 const resolved=fs.realpathSync(root),parent=fs.realpathSync(os.tmpdir());
 assert.equal(path.dirname(resolved),parent);assert.ok(path.basename(resolved).startsWith('npexplorer-bench-'));
 fs.rmSync(resolved,{recursive:true});
}
const median=n=>[...n].sort((a,b)=>a-b)[Math.floor(n.length/2)];
function run(root,name){
 const child=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--worker','--root',root,'--case',name],{encoding:'utf8',timeout:180000,maxBuffer:4e6});
 if(child.status!==0)throw Error(child.stderr||child.error?.message||`Benchmark failed: ${name}`);
 return JSON.parse(child.stdout);
}
async function main(){
 const names=option('--cases','mainland-single,alaska-compare,mixed-single,all-parks-single,mainland-monthly,mixed-monthly').split(','),runs=Number(option('--runs','3')),ref=option('--compare',null);
 assert.ok(Number.isInteger(runs)&&runs>0&&runs<=10);
 const roots=[],report={node:process.version,platform:process.platform,cpu:os.cpus()[0]?.model,baseRef:ref,runs,cases:[]};
 try{
  const current=snapshot(null),counted=snapshot(null,true);roots.push(current,counted);
  const baseline=ref?snapshot(ref):null,oldCountsRoot=ref?snapshot(ref,true):null;if(baseline)roots.push(baseline,oldCountsRoot);
  for(const name of names){
   const samples=[],before=[];
   // Alternate versions to reduce systematic ordering/thermal bias.
   for(let i=0;i<runs;i++){
    if(baseline&&i%2===0)before.push(run(baseline,name));
    samples.push(run(current,name));
    if(baseline&&i%2===1)before.push(run(baseline,name));
   }
   const counts=run(counted,name);assert.equal(counts.resultHash,samples[0].resultHash,'Instrumentation changed the result');
   for(const s of [...samples,...before]){assert.equal(s.inputHash,samples[0].inputHash,'Benchmark inputs changed');assert.equal(s.resultHash,samples[0].resultHash,`Result changed: ${name}`);}
   const row={...samples[0],ms:median(samples.map(s=>s.ms)),samplesMs:samples.map(s=>s.ms),counts:counts.counts};
   if(baseline){const oldCounts=run(oldCountsRoot,name);assert.equal(oldCounts.resultHash,row.resultHash);row.baselineCounts=oldCounts.counts;row.baselineMs=median(before.map(s=>s.ms));row.baselineSamplesMs=before.map(s=>s.ms);row.speedup=row.baselineMs/row.ms;}
   report.cases.push(row);console.log(JSON.stringify(row));
  }
  if(option('--output',null))fs.writeFileSync(path.resolve(option('--output')),JSON.stringify(report,null,2)+'\n');
 }finally{for(const root of roots)removeSnapshot(root);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(args.includes('--worker'))await worker();else await main();
}
