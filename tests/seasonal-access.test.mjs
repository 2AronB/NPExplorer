import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {accessForMonth,accessDetails} from '../seasonal-access.mjs';
import {shapeSvg} from '../map-markers.mjs';
const audit=JSON.parse(fs.readFileSync(new URL('../data/seasonal-access-audit.json',import.meta.url))),research=JSON.parse(fs.readFileSync(new URL('../data/seasonal-research/seasonal-access.json',import.meta.url)));
test('core-access audit covers all researched parks with valid evidence and disjoint month categories',()=>{
 assert.deepEqual(Object.keys(audit.parks).sort(),Object.keys(research.parks).sort());assert.equal(Object.keys(audit.parks).length,64);
 for(const p of Object.values(audit.parks)){
  const months=[...p.majorMonths,...p.transitionMonths,...p.partialMonths];assert.equal(new Set(months).size,months.length);
  assert.ok(months.every(m=>Number.isInteger(m)&&m>=1&&m<=12));assert.ok(p.assessment);assert.ok(p.sourceIDs.length);
  for(const id of p.sourceIDs)assert.ok(research.sources[id],id);
 }
});
test('winter road losses are major, shoulder months uncertain and summer not falsely closed',()=>{
 for(const id of ['romo','yell','glac','crla','lavo','dena','katm'])assert.equal(accessForMonth(audit,id,1).level,'major');
 assert.equal(accessForMonth(audit,'romo',5).level,'transition');assert.equal(accessForMonth(audit,'glac',7).level,'transition');
 assert.equal(accessForMonth(audit,'romo',8),null);assert.equal(accessForMonth(audit,'yell',8),null);
});
test('partial areas, actual island closure, heat and unknown operators are not mostly-closed flags',()=>{
 for(const id of ['yose','grca','sequ','olym'])assert.equal(accessForMonth(audit,id,1).level,'partial');
 for(const id of ['isro','deva','gaar','kova'])assert.equal(accessForMonth(audit,id,1),null);
 assert.equal(audit.parks.isro.wholeParkClosure,true);assert.equal(accessForMonth(audit,'deva',7),null);
 assert.equal(accessForMonth(null,'romo',1),null);assert.equal(accessForMonth(audit,'unresearched-site',1),null);
});
test('striped SVGs use separate pattern IDs and detail explains scope and evidence',()=>{
 const first=shapeSvg('circle','green',true,true),second=shapeSvg('circle','green',false,true);
 assert.notEqual(first.match(/pattern id="([^"]+)/)[1],second.match(/pattern id="([^"]+)/)[1]);
 assert.match(first,/#b94d45/);assert.ok(!shapeSvg('circle','green').includes('<pattern'));
 const html=accessDetails(audit,research,'romo',1);assert.match(html,/Bear Lake/);assert.match(html,/nps.gov/);assert.match(html,/does not change/);
});
