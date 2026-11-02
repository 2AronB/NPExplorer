import test from 'node:test';
import assert from 'node:assert/strict';
import {importPlanFile} from '../plan-import.mjs';
import {MAX_PLAN_IMPORT_BYTES} from '../plan-defaults.mjs';
const file=text=>({size:Buffer.byteLength(text),text:async()=>text});
const validate=raw=>{if(raw.version!==1)throw Error('Unrecognized plan format');return {...raw,normalized:true};};
function store(initial){let value=initial,writes=0;return {get value(){return value;},get writes(){return writes;},setItem(key,next){assert.equal(key,'long-way-plan-v1');value=next;writes++;}};}
test('successful import persists the validated normalized plan before publishing it',async()=>{
 const storage=store('existing'),next=await importPlanFile(file('{"version":1,"selected":["flfo"],"days":{"flfo":0.25}}'),{validate,storage});
 assert.equal(storage.writes,1);assert.deepEqual(JSON.parse(storage.value),next);assert.equal(next.normalized,true);assert.deepEqual(next.days,{flfo:.25});
});
test('storage quota failure keeps the existing active plan and displayed result intact',async()=>{
 const previous={plan:{version:1,selected:['yell']},result:{totalDays:45}},active=structuredClone(previous);let persisted='old plan';
 const storage={setItem(){throw new Error('QuotaExceededError');}};
 const replace=async()=>{const next=await importPlanFile(file('{"version":1,"selected":["orca"]}'),{validate,storage});active.plan=next;active.result=null;persisted=JSON.stringify(next);};
 await assert.rejects(replace,/storage is full or unavailable.*existing trip was kept/);assert.deepEqual(active,previous);assert.equal(persisted,'old plan');
});
test('invalid JSON, invalid plan and unreadable file do not write storage',async()=>{
 const storage=store('existing');
 for(const input of [file('{broken'),file('{"version":2}'),{size:10,text:async()=>{throw Error('Read failed');}}])await assert.rejects(importPlanFile(input,{validate,storage}));
 assert.equal(storage.writes,0);assert.equal(storage.value,'existing');
});
test('the byte limit is inclusive and rejects oversized files before reading or replacing inputs',async()=>{
 const storage=store('existing');let reads=0;
 await assert.rejects(importPlanFile({size:MAX_PLAN_IMPORT_BYTES+1,text:async()=>{reads++;return '{}';}},{validate,storage}),/5 MB/);assert.equal(reads,0);assert.equal(storage.value,'existing');
 const next=await importPlanFile({size:MAX_PLAN_IMPORT_BYTES,text:async()=>'{"version":1}'},{validate,storage});assert.equal(next.version,1);
 for(const size of [NaN,Infinity,-1])await assert.rejects(importPlanFile({size,text:async()=>'{"version":1}'},{validate,storage}),/Choose a JSON/);
});
test('multibyte preparation histories within the byte limit round trip without losing notes',async()=>{
 const notes='森'.repeat(1000),raw={version:1,preparation:Object.fromEntries(Array.from({length:1000},(_,i)=>['site:history-'+i+':visit',{status:'researched',notes}]))},input=file(JSON.stringify(raw)),storage=store('existing');
 assert.ok(input.size>2_000_000&&input.size<MAX_PLAN_IMPORT_BYTES);const next=await importPlanFile(input,{validate,storage});assert.deepEqual(next.preparation,raw.preparation);assert.equal(JSON.parse(storage.value).preparation['site:history-999:visit'].notes,notes);
});
