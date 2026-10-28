import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {monthlyQuality} from '../season-quality.mjs';
import {season,seasonQuality,dateOf,schedule,optimize} from '../optimizer.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
import {CALIBRATION_ROUTES} from '../calibration.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
const byId=new Map(data.map(s=>[s.id,s]));
const scored=(quality,days=1)=>({id:'quality-test',name:'Quality test',shortName:'Quality test',lat:38.8339,lng:-104.8214,days,profile:{scores:Array(12).fill(quality),ideal:[],bad:[],quiet:[]}});
const settings={...DEFAULT_SETTINGS,autoMonth:false,restDays:0,startDate:'2040-01-01'};
test('every mapped location has twelve graded numeric quality assumptions',()=>{
 for(const s of data){assert.equal(s.profile.scores.length,12,s.id);assert.ok(s.profile.scores.every(q=>Number.isFinite(q)&&q>=0&&q<=10),s.id);}
 assert.ok(new Set(byId.get('deva').profile.scores).size>3);
});
test('numeric scores affect optimization even within the same display category',()=>{
 const a=scored(4),b=scored(7);assert.equal(season(a,dateOf(settings.startDate)),'mixed');assert.equal(season(b,dateOf(settings.startDate)),'mixed');
 const low=schedule([a],settings),high=schedule([b],settings);assert.ok(low.seasonPenalty>high.seasonPenalty);assert.ok(low.score>high.score);
 assert.ok(schedule([scored(3)],settings).seasonPenalty>schedule([scored(8)],settings).seasonPenalty);
});
test('quality is day weighted across a month boundary and excludes personal stops',()=>{
 const p=scored(8,2);p.profile.scores[1]=3;
 const family={id:'custom-family',shortName:'Family',name:'Family',lat:p.lat,lng:p.lng,days:20};
 const r=schedule([p,family],{...settings,startDate:'2040-01-31'});
 assert.equal(r.visits[0].quality,5.5);assert.equal(r.visits[0].minQuality,3);assert.equal(r.quality,5.5);assert.equal(r.qualityDays,2);assert.equal(r.visits[1].quality,null);
});
test('a perfect numeric score cannot make an annual closure available',()=>{
 const p={...scored(10),closure:{start:'01-01',end:'01-31'}};assert.equal(season(p,dateOf('2040-01-15')),'closed');assert.equal(seasonQuality(p,dateOf('2040-01-15')),0);
 const r=schedule([p],settings);assert.equal(r.visits[0].arrival,'2040-02-01');assert.equal(r.visits[0].quality,10);
});
test('old bucket-only edits retain their intent when converted to numeric scores',()=>{
 const legacy={ideal:[1],bad:[7],quiet:[]};assert.equal(monthlyQuality(legacy,1),9);assert.equal(monthlyQuality(legacy,7),2);assert.equal(monthlyQuality(legacy,4),6);
});
test('departure-month search fully optimizes all twelve months independently',()=>{
 const stops=['deva','jotr','pinn','yose'].map(id=>byId.get(id)),progress=[];
 const r=optimize(stops,{...settings,autoMonth:true},p=>progress.push(p.completed));
 assert.equal(r.monthResults.length,12);assert.deepEqual([...new Set(progress)],Array.from({length:13},(_,i)=>i));
 for(let month=1;month<=12;month++){
  const date=`2040-${String(month).padStart(2,'0')}-01`,fixed=optimize(stops,{...settings,startDate:date}),option=r.monthResults[month-1];
  assert.equal(option.startDate,date);assert.deepEqual(option.order,fixed.order);assert.equal(option.score,fixed.score);assert.equal(option.parkDays,stops.reduce((n,s)=>n+s.days,0));
 }
 assert.equal(r.score,Math.min(...r.monthResults.map(m=>m.score)));
});
test('recommended calibration samples cover distinct regions and preserve earlier IDs',()=>{
 const current=CALIBRATION_ROUTES.filter(r=>!r.legacy);assert.ok(current.some(r=>r.id==='badl-thro'));assert.ok(current.some(r=>r.id==='shen-grsm'));assert.ok(current.some(r=>r.id==='ever-bisc'));assert.ok(current.some(r=>r.id==='olym-mora'));
 assert.ok(CALIBRATION_ROUTES.some(r=>r.id==='arch-cany'&&r.legacy));
 for(const r of current){assert.ok(r.from==='cos'||byId.has(r.from));assert.ok(byId.has(r.to));}
});
