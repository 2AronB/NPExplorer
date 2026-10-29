import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCalendarModel} from '../calendar.mjs';
import {schedule,dateOf,iso,addDays} from '../optimizer.mjs';
import {optimizeTrip} from '../trip-optimizer.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
import {REMOTE_PARKS,MAINLAND_AIRPORTS} from '../remote-parks.mjs';
const sites=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
const settings={...DEFAULT_SETTINGS,autoMonth:false,sharedDays:true,startDate:'2040-02-26',restDays:3,start:{id:'start',name:'Home',lat:38.8,lng:-104.8},end:{id:'finish',name:'Home',lat:38.8,lng:-104.8}};
function model(stops,result,input=settings){return buildCalendarModel({state:{selected:stops.map(s=>s.id),settings:input},sites:[...sites,...REMOTE_PARKS,...stops],result});}
function coverage(m,r){
 assert.equal(m.days.length,r.totalDays);assert.equal(Object.values(m.counts).reduce((a,b)=>a+b,0),r.totalDays);
 assert.equal(m.days[0].date,r.startDate);assert.equal(m.days.at(-1).date,iso(addDays(dateOf(r.endDate),-1)));
 assert.ok(m.days.every(d=>d.events.length>0),'Every allocated date has an event');
 assert.equal(m.counts.unassigned||0,0);
}
test('calendar starts empty without inventing a route',()=>assert.equal(buildCalendarModel({result:null}),null));
test('calendar covers leap day, home drive and rest without double-counting mixed exploration',()=>{
 const stops=['arch','cany','blca'].map(id=>sites.find(s=>s.id===id)),r=schedule(stops,settings),m=model(stops,r);
 coverage(m,r);assert.ok(m.byDate.has('2040-02-29'));assert.equal(m.counts.mixed,r.mixedDays);assert.equal(m.counts.rest,3);
 assert.ok(m.days.some(d=>d.events.some(e=>e.event==='Return / finish drive')));
 assert.ok(m.days.some(d=>d.kind==='mixed'&&d.events.some(e=>e.shared)));
 for(const v of r.visits){
  if(v.sharedDays)assert.ok(m.byDate.get(v.arrival).events.some(e=>e.siteId===v.id&&e.shared&&e.parkDays===v.sharedDays));
  if(v.departureSharedDays)assert.ok(m.byDate.get(v.departureDriveDate).events.some(e=>e.siteId===v.id&&e.shared&&e.parkDays===v.departureSharedDays));
 }
});
test('fixed-date waiting and personal days stay visible and an overrun keeps all dates',()=>{
 const stop={id:'family',name:'Family',shortName:'Family',type:'custom',lat:38.8,lng:-104.8,days:2,fixedDate:'2040-03-05'},input={...settings,duration:2},r=schedule([stop],input),m=model([stop],r,input);
 coverage(m,r);assert.ok(r.remaining<0);assert.ok(m.counts.wait>0);assert.equal(m.counts.personal,2);
 assert.equal(m.byDate.get('2040-03-05').kind,'personal');assert.equal(m.byDate.get('2040-03-05').events[0].fixedDate,'2040-03-05');
});
test('remote calendar includes individual parks, flights, buffers and restrictive access waiting',()=>{
 const airport=MAINLAND_AIRPORTS.find(a=>a.code==='LAX'),stops=REMOTE_PARKS.filter(s=>['dena','hale','havo','npsa'].includes(s.id));
 const input={...settings,startDate:'2040-01-01',airportCodes:['LAX'],alaskaMode:'fly',start:{...airport,id:'start'},end:{...airport,id:'finish'}},r=optimizeTrip(stops,input),m=model(stops,r,input);
 coverage(m,r);assert.ok(m.counts.transfer>0);assert.ok(m.counts.buffer>0);assert.ok(m.counts.wait>0);
 assert.deepEqual(new Set(m.days.flatMap(d=>d.events.filter(e=>e.kind==='park').map(e=>e.siteId))),new Set(stops.map(s=>s.id)));
 assert.ok(m.months.length>1);
});
test('a fully shared stay still has a visible park activity',()=>{
 const first={...sites.find(s=>s.id==='arch'),days:1},second={...sites.find(s=>s.id==='cany'),lat:first.lat,lng:first.lng,days:1},input={...settings,start:first,end:null,restDays:0},r=schedule([first,second],input),m=model([first,second],r,input);
 coverage(m,r);for(const s of [first,second])assert.ok(m.days.some(d=>d.events.some(e=>e.siteId===s.id)));
});
