import test from 'node:test';
import assert from 'node:assert/strict';
import {createStarterPlan,TRIP_EXAMPLES,START_CITIES,localDateToday} from '../trip-setup.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
import fs from 'node:fs/promises';
import {currentInventory} from '../current-inventory.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
const available=[...new Set(TRIP_EXAMPLES.flatMap(t=>t.ids))];
const options={example:'utah',start:START_CITIES[0],startDate:'2027-05-12',duration:14};
test('new regional trip uses exact chosen dates, preserves all visits and does not mutate legacy defaults',()=>{
 const before=structuredClone(DEFAULT_SETTINGS),p=createStarterPlan(options,available);
 assert.equal(p.settings.startDate,'2027-05-12');assert.equal(p.settings.duration,14);
 assert.deepEqual(p.selected,['arch','cany','care','brca','zion']);assert.equal(p.settings.restDays,0);
 assert.equal(p.settings.autoMonth,false);assert.equal(p.settings.stayMode,'highlights');
 assert.equal(p.settings.end.name,'Salt Lake City');assert.equal(p.settings.end.id,'finish');
 assert.deepEqual(DEFAULT_SETTINGS,before);
 p.settings.remoteWindows.test={};assert.equal(DEFAULT_SETTINGS.remoteWindows.test,undefined);
});
test('blank and one-way trips contain no inherited constraints, records or destinations',()=>{
 const p=createStarterPlan({...options,example:'blank',returnHome:false,stayMode:'park'},available);
 assert.deepEqual(p.selected,[]);assert.deepEqual(p.settings.arrivalWindows,{});assert.deepEqual(p.settings.restAfter,{});
 assert.deepEqual(p.preparation,{});assert.deepEqual(p.custom,[]);assert.equal(p.settings.end,null);assert.equal(p.settings.endMode,'open');
});
test('setup rejects impossible dates, coordinates, durations and missing example destinations',()=>{
 for(const patch of [{startDate:'2027-02-29'},{duration:0},{duration:1.5},{start:{name:'Outside',lat:60,lng:-100}},{example:'missing'},{objective:'unknown'}])assert.throws(()=>createStarterPlan({...options,...patch},available));
 assert.throws(()=>createStarterPlan(options,[]),/updated park data/);
 assert.equal(createStarterPlan({...options,startDate:'2028-02-29'},available).settings.startDate,'2028-02-29');
});
test('setup today uses local calendar components',()=>{
 assert.equal(localDateToday(new Date(2026,10,4,23,58)),'2026-11-04');
});
test('every regional example resolves against the actual published inventory',async()=>{
 const {sites}=JSON.parse(await fs.readFile(new URL('../data/sites.json',import.meta.url),'utf8'));
 const ids=[...currentInventory(sites),...REMOTE_PARKS].map(s=>s.id);
 for(const example of TRIP_EXAMPLES)assert.deepEqual(createStarterPlan({...options,example:example.id},ids).selected,example.ids);
});
