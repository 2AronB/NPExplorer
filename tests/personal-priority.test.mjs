import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {PARK_PRIORITIES,personalPriority,withPriorityDefault,validatePriorities} from '../personal-priority.mjs';
import {currentInventory} from '../current-inventory.mjs';import {REMOTE_PARKS} from '../remote-parks.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';import {optimize,schedule} from '../optimizer.mjs';import {optimizeTrip} from '../trip-optimizer.mjs';
const sites=[...currentInventory(JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites),...REMOTE_PARKS].map(withPriorityDefault);
const settings={...DEFAULT_SETTINGS,autoMonth:false,startDate:'2040-01-31',restDays:0};
const make=(id,priority,days=1)=>({id,name:id,shortName:id,lat:settings.start.lat,lng:settings.start.lng,type:'park',priority,days,profile:{scores:[10,...Array(11).fill(6)],quiet:[]}});
test('every current national park has an explicit editable priority and a rationale',()=>{
 const parks=sites.filter(s=>s.type==='park');assert.equal(parks.length,64);assert.equal(Object.keys(PARK_PRIORITIES).length,64);
 for(const s of parks){assert.ok(PARK_PRIORITIES[s.id],s.id);assert.ok(Number.isInteger(s.priority)&&s.priority>=1&&s.priority<=5,s.id);assert.ok(s.priorityNote.length>20);}
 assert.equal(PARK_PRIORITIES.yell.priority,5);assert.equal(PARK_PRIORITIES.jeff.priority,1);
 for(const s of parks.filter(s=>s.state==='AK'))assert.ok(s.priority>=4,s.id);
});
test('a priority change reverses the preferred order when seasonal choices compete',()=>{
 const a=make('a',5),b=make('b',1),first=optimize([a,b],settings),second=optimize([{...a,priority:1},{...b,priority:5}],settings);
 assert.deepEqual(first.order,['a','b']);assert.deepEqual(second.order,['b','a']);assert.equal(first.quality,8);assert.equal(second.quality,8);assert.equal(first.parkDays,2);
});
test('days and priority multiply seasonal cost without altering the conditions average',()=>{
 const a={...make('a',1),profile:{scores:Array(12).fill(6),quiet:[]}},low=schedule([a],settings),high=schedule([{...a,priority:5,days:8}],settings);
 assert.ok(Math.abs(high.seasonPenalty-low.seasonPenalty*40)<1e-9);assert.equal(high.quality,low.quality);assert.equal(high.visits[0].priority,5);
});
test('trip target changes reporting only, including monthly route rankings',()=>{
 const stops=[make('a',5),make('b',1)],short=optimize(stops,{...settings,duration:1,autoMonth:true}),long=optimize(stops,{...settings,duration:1000,autoMonth:true});
 assert.deepEqual(short.order,long.order);assert.equal(short.startDate,long.startDate);assert.equal(short.endDate,long.endDate);assert.equal(short.score,long.score);assert.equal(short.parkDays,long.parkDays);
 assert.ok(short.remaining<0);assert.ok(long.remaining>0);assert.equal(short.overrun,short.totalDays-1);
 assert.deepEqual(short.monthResults.map(r=>r.score),long.monthResults.map(r=>r.score));
});
test('remote park priorities affect scoring and remote target overruns remain informational',()=>{
 const p=sites.find(s=>s.id==='kova'),s={...settings,startDate:'2040-07-01',alaskaMode:'fly',airportCodes:['MIA']};
 const low=optimizeTrip([{...p,priority:1}],{...s,duration:1}),high=optimizeTrip([{...p,priority:5}],{...s,duration:1}),long=optimizeTrip([{...p,priority:5}],{...s,duration:1000});
 assert.ok(Math.abs(high.seasonPenalty-low.seasonPenalty*5)<1e-9);assert.equal(high.quality,low.quality);assert.equal(high.score,long.score);assert.equal(high.endDate,long.endDate);assert.equal(high.excursions[0].visits[0].priority,5);assert.ok(high.remaining<0);assert.ok(long.remaining>0);
});
test('older plans receive defaults while exported overrides survive validation',()=>{
 const allowed=new Set(sites.map(s=>s.id));assert.deepEqual(validatePriorities(undefined,allowed),{});
 const raw=JSON.parse(JSON.stringify({yell:4,jeff:2,dena:5}));assert.deepEqual(validatePriorities(raw,allowed),raw);
 for(const invalid of [{yell:0},{yell:6},{yell:1.5},{unknown:5},[]])assert.throws(()=>validatePriorities(invalid,allowed));
 assert.equal(personalPriority({}),1);assert.equal(withPriorityDefault(sites.find(s=>s.id==='yell')).priority,5);
});
