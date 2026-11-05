import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MARKER_TYPES,markerType,markerSize,circleCandidates,visibleSite,visitNumbers,visitNumberLabel} from '../map-markers.mjs';
import {scheduledVisit,tripMarkerColor,tripVisitLabel} from '../map-markers.mjs';
import {qualityColor} from '../season-quality.mjs';
import {insideBoundary,validBoundary,boundaryCandidates} from '../map-markers.mjs';
test('drawn boundary includes edges and concave areas, respects scope, visibility and public eligibility',()=>{
 const vertices=[{lat:0,lng:0},{lat:0,lng:4},{lat:2,lng:2},{lat:4,lng:4},{lat:4,lng:0}];
 assert.ok(validBoundary(vertices));assert.ok(insideBoundary({lat:2,lng:1},vertices));assert.ok(insideBoundary({lat:2,lng:2},vertices));assert.ok(!insideBoundary({lat:2,lng:3},vertices));
 assert.ok(!validBoundary(vertices.slice(0,2)));assert.ok(!validBoundary([{lat:0,lng:0},{lat:1,lng:1},{lat:2,lng:2}]));
 assert.ok(!validBoundary([{lat:0,lng:0},{lat:4,lng:4},{lat:0,lng:4},{lat:3,lng:0}]));
 const places=[{id:'arch',type:'park',lat:2,lng:1},{id:'cagr',type:'site',designation:'National Monument',lat:2,lng:1},{id:'pima',type:'site',lat:2,lng:1},{id:'home',type:'custom',lat:2,lng:1},{id:'outside',type:'park',lat:2,lng:3}];
 assert.deepEqual(boundaryCandidates(places,vertices).map(s=>s.id),['arch']);
 assert.deepEqual(boundaryCandidates(places,vertices,'nps').map(s=>s.id),['arch','cagr']);
 assert.deepEqual(boundaryCandidates(places,vertices,'all',new Set(['park','custom'])).map(s=>s.id),['arch','home']);
 assert.deepEqual(boundaryCandidates(places,[],'all'),[]);
});
test('route markers resolve actual mainland and regional visit dates and quality when routes change',()=>{
 const july={id:'yell',arrival:'2040-07-20',departure:'2040-07-24',days:4,quality:8.5},remote={id:'dena',arrival:'2040-08-03',departure:'2040-08-06',days:3,quality:9};
 const r={visits:[july,{id:'alaska',excursion:true,quality:2}],excursions:[{id:'alaska',visits:[remote]}]};
 assert.equal(scheduledVisit(r,'yell'),july);assert.equal(scheduledVisit(r,'dena'),remote);assert.equal(scheduledVisit(r,'alaska'),null);
 assert.equal(tripMarkerColor({type:'park'},true,remote),qualityColor(9));
 assert.match(tripVisitLabel(july,1),/2040-07-20.*8.5\/10 for this visit/);
 assert.doesNotMatch(tripVisitLabel(july,1),/Apr/);
 const winter={...july,arrival:'2041-01-20',quality:2};
 assert.equal(tripMarkerColor({type:'park'},true,scheduledVisit({visits:[winter]},'yell')),qualityColor(2));
 assert.equal(scheduledVisit(null,'yell'),null);assert.match(tripVisitLabel(null),/Not on a calculated route/);
 assert.equal(tripMarkerColor({type:'park'},true,{...july,status:'closed'}),'#777e85');
 assert.equal(tripMarkerColor({type:'site'},true,{quality:null}),qualityColor(null));
});
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
test('circle preview and commit can share visibility and public-visit eligibility without deleting saved places',()=>{
 const center={lat:40,lng:-100},sites=[{...center,id:'pima',type:'site',designation:'National Monument'},{...center,id:'naca',type:'site',designation:'Park'},{...center,id:'cagr',type:'site',designation:'National Monument'},{...center,id:'arch',type:'park'},{...center,id:'custom-home',type:'custom'}],shown=new Set(['park','custom']);
 assert.deepEqual(circleCandidates(sites,center,1,'all',shown).map(s=>s.id),['arch','custom-home']);assert.deepEqual(circleCandidates(sites,center,1,'nps').map(s=>s.id),['cagr','arch']);assert.equal(sites.length,5);assert.equal(sites[0].id,'pima');
});
