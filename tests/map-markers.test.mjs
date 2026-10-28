import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MARKER_TYPES,markerType,markerSize,circleCandidates,visibleSite,visitNumbers,visitNumberLabel} from '../map-markers.mjs';
const sites=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
test('all inventory locations have a shape and selection enlarges every type',()=>{
 for(const site of [...sites,{type:'custom'}]){
  assert.ok(MARKER_TYPES.includes(markerType(site)));
  assert.ok(markerSize(site,true)>markerSize(site,false));
 }
 assert.equal(markerType(sites.find(s=>s.id==='neri')).shape,'circle');
});
test('site designations distinguish monuments, history, battlefields, water and trails',()=>{
 const expected=[['National Monument','triangle'],['National Historical Park','square'],['National Battlefield','star'],['National Lakeshore','diamond'],['National Scenic Trail','hexagon'],['National Preserve','pentagon']];
 for(const [designation,shape]of expected)assert.equal(markerType({type:'site',designation}).shape,shape);
 assert.equal(markerType({type:'custom'}).shape,'heart');
});
test('circle scopes include visible optional sites only when requested',()=>{
 const center={lat:40,lng:-100},places=[{...center,id:'park',type:'park'},{...center,id:'site',type:'site'},{...center,id:'home',type:'custom'},{lat:0,lng:0,id:'outside',type:'park'}];
 assert.deepEqual(circleCandidates(places,center,1).map(s=>s.id),['park']);
 assert.deepEqual(circleCandidates(places,center,1,'nps').map(s=>s.id),['park','site']);
 assert.deepEqual(circleCandidates(places,center,1,'all').map(s=>s.id),['park','site','home']);
 assert.equal(circleCandidates(places,center,0,'all').length,3);
});


test('legend filtering excludes hidden types from circle selection without changing inventory',()=>{
 const center={lat:40,lng:-100},places=[{...center,id:'park',type:'park'},{...center,id:'trail',type:'site',designation:'National Scenic Trail'},{...center,id:'monument',type:'site',designation:'National Monument'}],types=new Set(['park','monument']);
 assert.deepEqual(circleCandidates(places.filter(s=>visibleSite(s,types)),center,1,'nps').map(s=>s.id),['park','monument']);
 assert.equal(places.length,3);assert.ok(!visibleSite(places[1],new Set()));assert.ok(visibleSite(places[1],new Set(['trail'])));
});
test('visit numbers expand OCONUS park order and continue sequentially on the mainland',()=>{
 const r={visits:[{id:'arch'},{id:'excursion-alaska',excursion:true},{id:'yell'},{id:'excursion-hawaii',excursion:true}],excursions:[{id:'excursion-alaska',visits:[{id:'dena'},{id:'katm'},{id:'kova'}]},{id:'excursion-hawaii',visits:[{id:'hale'},{id:'havo'}]}]},numbers=visitNumbers(r);
 assert.deepEqual([...numbers],[['arch',1],['dena',2],['katm',3],['kova',4],['yell',5],['hale',6],['havo',7]]);
 assert.equal(visitNumberLabel(r,'excursion-alaska',numbers),'2–4');assert.equal(visitNumberLabel(r,'yell',numbers),'5');assert.equal(visitNumberLabel(r,'excursion-hawaii',numbers),'6–7');assert.equal(numbers.has('excursion-alaska'),false);
 assert.equal(visitNumbers(null).size,0);
});
test('single-park excursions use one shared number in map and itinerary',()=>{
 const r={visits:[{id:'excursion-virgin',excursion:true}],excursions:[{id:'excursion-virgin',visits:[{id:'viis'}]}]};assert.equal(visitNumberLabel(r,'excursion-virgin'),'1');assert.equal(visitNumbers(r).get('viis'),1);
});
