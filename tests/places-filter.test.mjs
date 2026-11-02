import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {currentInventory} from '../current-inventory.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
import {filterPlaces,TOP_PARKS} from '../places-filter.mjs';
const sites=[...currentInventory(JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites),...REMOTE_PARKS];
test('shortlists resolve to exactly 10 and 25 real parks, independently of priorities',()=>{
 assert.equal(new Set(TOP_PARKS).size,25);
 const ten=filterPlaces(sites,{shortlist:'top10'}),all=filterPlaces(sites,{shortlist:'top25'});
 assert.equal(ten.length,10);assert.equal(all.length,25);assert.ok(ten.every(p=>all.includes(p)));
 assert.deepEqual(filterPlaces(sites.map(s=>({...s,priority:1})),{shortlist:'top10'}).map(s=>s.id),ten.map(s=>s.id));
});
test('Lower 48 and regional filters compose with shortlist, search and selection',()=>{
 assert.equal(filterPlaces(sites,{region:'conus'}).length,52);
 assert.equal(filterPlaces(sites,{region:'remote'}).length,12);
 assert.equal(filterPlaces(sites,{region:'alaska'}).length,8);
 assert.equal(filterPlaces(sites,{region:'conus',shortlist:'top10'}).length,9);
 assert.deepEqual(filterPlaces(sites,{region:'alaska',shortlist:'top10'}).map(s=>s.id),['dena']);
 assert.deepEqual(filterPlaces(sites,{region:'conus',shortlist:'top25',query:'Yosemite'}).map(s=>s.id),['yose']);
 assert.deepEqual(filterPlaces(sites,{type:'selected',region:'conus',selected:['yell','dena']}).map(s=>s.id),['yell']);
 assert.ok(filterPlaces(sites,{type:'all',region:'conus'}).length>52);
});
