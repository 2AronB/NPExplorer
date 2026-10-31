import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENARIO_KEY,MAX_SCENARIOS,createSnapshot,openScenarioStore,resultVersionMatches,comparisonMetrics,dataFingerprint} from '../scenarios.mjs';
const versions={application:'a',optimizer:'b',data:'c'},state={version:1,selected:['romo'],custom:[],settings:{startDate:'2040-01-01'}};
const validate=s=>{if(s?.version!==1||!Array.isArray(s.selected))throw Error('Bad inputs');return structuredClone(s);};
function storage(){const values=new Map();return {values,fail:false,getItem(k){return values.get(k)||null;},setItem(k,v){if(this.fail)throw Error('Quota exceeded');values.set(k,v);}};}
const snapshot=(id='one',name='Winter')=>createSnapshot({id,name,state,sites:[{id:'romo',type:'park'}],result:{startDate:'2040-01-01',totalDays:12,miles:400,hours:8,quality:3,mixedDays:2,dedicatedTravelDays:3,transferDays:1,waitDays:0,monthResults:[{massive:'discard'}]},accessReview:{affectedStops:1,unknownStops:0},versions});

test('named snapshots are independent and retain only the displayed departure result',()=>{
 const s=snapshot();s.state.selected.push('yell');assert.deepEqual(state.selected,['romo']);assert.ok(!('monthResults' in s.result));assert.ok(resultVersionMatches(s,versions));
 assert.ok(!resultVersionMatches(s,{...versions,data:'new'}));assert.ok(!resultVersionMatches(s,{...versions,application:'new'}));
 assert.equal(comparisonMetrics(s.result,s.accessReview).dedicated,4);assert.equal(comparisonMetrics(null,null),null);
});
test('save, rename and reload preserve inputs, names, report and recovery without mutating the active plan',()=>{
 const disk=storage(),store=openScenarioStore(disk,validate),before=JSON.stringify(state),s=snapshot();store.save(s);store.rename('one','<script>alert(1)</script>');store.preserveRecovery(snapshot('active-recovery','Previous active trip'));
 const loaded=openScenarioStore(disk,validate);assert.equal(loaded.items[0].name,'<script>alert(1)</script>');assert.deepEqual(loaded.items[0].result,s.result);assert.equal(loaded.recovery.id,'active-recovery');assert.equal(JSON.stringify(state),before);
 const copy=loaded.items;copy[0].state.selected=[];assert.deepEqual(loaded.items[0].state.selected,['romo']);
});
test('quota failures leave saved alternatives and recovery intact',()=>{
 const disk=storage(),store=openScenarioStore(disk,validate);store.save(snapshot());store.preserveRecovery(snapshot('active-recovery','Previous active trip'));const before=disk.getItem(SCENARIO_KEY);disk.fail=true;
 assert.throws(()=>store.save(snapshot('two')),/storage is full/);assert.throws(()=>store.remove('one'),/existing trips were kept/);assert.throws(()=>store.preserveRecovery(snapshot('new-recovery')),/storage/);
 assert.equal(disk.getItem(SCENARIO_KEY),before);assert.equal(store.items.length,1);assert.equal(store.recovery.id,'active-recovery');
});
test('unsupported schema, corrupt input and inaccessible storage cannot overwrite the library',()=>{
 for(const raw of ['{bad',JSON.stringify({schemaVersion:99,items:[]}),JSON.stringify({schemaVersion:1,items:[{...snapshot(),state:{version:99}}]})]){
  const disk=storage();disk.setItem(SCENARIO_KEY,raw);const store=openScenarioStore(disk,validate);assert.ok(store.error);assert.equal(store.raw,raw);assert.throws(()=>store.save(snapshot()),/could not be loaded/);assert.equal(disk.getItem(SCENARIO_KEY),raw);
 }
 const store=openScenarioStore({getItem(){throw Error('Denied');}},validate);assert.equal(store.error,'Denied');assert.throws(()=>store.save(snapshot()),/could not be loaded/);
});
test('bounded library rejects excess snapshots and permits explicit deletion without losing recovery',()=>{
 const disk=storage(),store=openScenarioStore(disk,validate);for(let i=0;i<MAX_SCENARIOS;i++)store.save(snapshot(String(i)));
 store.preserveRecovery(snapshot('active-recovery'));assert.throws(()=>store.save(snapshot('excess')),/Keep up to/);assert.equal(store.items.length,MAX_SCENARIOS);store.remove('0');store.save(snapshot('replacement'));assert.equal(store.items.length,MAX_SCENARIOS);assert.ok(store.recovery);
});
test('empty and oversized names fail; inputs-only alternatives and data revisions remain explicit',()=>{
 assert.throws(()=>snapshot('one','  '),/trip name/);assert.throws(()=>snapshot('one','x'.repeat(81)),/trip name/);
 const s=createSnapshot({id:'inputs',name:'Inputs',state,sites:[],result:null,accessReview:null,versions});assert.equal(s.result,null);assert.ok(!resultVersionMatches(s,versions));
 assert.notEqual(dataFingerprint({a:1}),dataFingerprint({a:2}));
});
test('a second tab cannot overwrite newer saved trips with an out-of-date library',()=>{
 const disk=storage(),first=openScenarioStore(disk,validate),second=openScenarioStore(disk,validate);first.save(snapshot());const preserved=disk.getItem(SCENARIO_KEY);
 assert.throws(()=>second.save(snapshot('two')),/another tab/);assert.equal(disk.getItem(SCENARIO_KEY),preserved);
 const fresh=openScenarioStore(disk,validate);fresh.save(snapshot('two'));assert.equal(fresh.items.length,2);
});
