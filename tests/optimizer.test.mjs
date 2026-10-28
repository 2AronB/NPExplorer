import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {travel,driveDays,dateOf,addDays,isClosed,season,schedule,optimize,detours,routeMiles} from '../optimizer.mjs';
import {DEFAULT_SETTINGS,upgradePlanPreferences} from '../plan-defaults.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
const lookup=new Map(data.map(s=>[s.id,s]));
const settings={startDate:'2040-04-01',duration:365,comfort:4,stretch:7,maxDrive:10,pace:'balanced',objective:'season',restDays:24,autoMonth:false,detourHours:1,start:{id:'start',lat:38.8339,lng:-104.8214},end:null};
test('CONUS inventory includes 51 distinct designated parks, including park/preserve duplicate codes',()=>{
 const parks=data.filter(s=>s.type==='park');assert.equal(parks.length,51);assert.equal(new Set(data.map(s=>s.id)).size,data.length);
 assert.equal(lookup.get('grsa').type,'park');assert.equal(lookup.get('neri').state,'WV');
});
test('summer hiking penalty differs from a park-wide closure',()=>{
 const s=lookup.get('deva');assert.equal(season(s,dateOf('2040-07-15')),'difficult');assert.equal(isClosed(s,dateOf('2040-07-15')),false);assert.equal(season(s,dateOf('2040-01-15')),'ideal');
});
test('annual wraparound closure includes exact boundary dates',()=>{
 const s=lookup.get('isro');for(const d of ['2040-11-01','2040-12-31','2041-01-01','2041-04-15'])assert.ok(isClosed(s,dateOf(d)),d);
 for(const d of ['2040-10-31','2041-04-16'])assert.equal(isClosed(s,dateOf(d)),false,d);
});
test('driving transfers respect comfort pace and hard ceiling',()=>{
 for(const pace of ['relaxed','balanced','efficient'])for(const h of [0,.5,4,7,10,11,25,63]){const d=driveDays(h,{...settings,pace});if(d)assert.ok(h/d<=settings.maxDrive);else assert.equal(h,0);}
 assert.equal(driveDays(11,{...settings,pace:'relaxed'}),3);
 assert.equal(driveDays(11,settings),2);
});
test('requested full days survive long drives, transfers, rests and overrun',()=>{
 const stops=['romo','drto','isro'].map(id=>({...lookup.get(id),days:5}));const r=schedule(stops,{...settings,duration:10});
 assert.equal(r.parkDays,15);assert.equal(r.transferDays,4);assert.equal(r.visits.length,3);assert.ok(r.remaining<0);
 assert.equal(r.totalDays,r.parkDays+r.travelDays+r.transferDays+r.restDays+r.waitDays);
 for(const v of r.visits)for(let d=0;d<v.days;d++)assert.equal(isClosed(lookup.get(v.id),addDays(dateOf(v.arrival),d)),false);
});
test('stay crossing annual closure waits until the complete stay fits',()=>{
 const s={...lookup.get('isro'),days:5,access:null};const r=schedule([s],{...settings,start:{lat:s.lat,lng:s.lng},startDate:'2040-10-30',restDays:0});
 assert.equal(r.visits[0].arrival,'2041-04-16');assert.ok(r.waitDays>0);assert.ok(r.warnings.length);
});
test('same-year annual closure handles single-day boundary',()=>{
 const s={id:'test',lat:38,lng:-100,shortName:'Test',days:2,closure:{start:'07-01',end:'07-31'}};
 const r=schedule([s],{...settings,start:s,startDate:'2040-06-30',restDays:0});assert.equal(r.visits[0].arrival,'2040-08-01');
});
test('seasonal month search improves one-park Death Valley July case',()=>{
 const s=lookup.get('deva');const inputs={...settings,start:{lat:s.lat,lng:s.lng},startDate:'2040-07-01',restDays:0};
 const july=optimize([s],inputs),flex=optimize([s],{...inputs,autoMonth:true});assert.equal(july.visits[0].status,'difficult');assert.equal(flex.visits[0].status,'ideal');assert.ok(flex.score<july.score);
});
test('return journey counted independently without consuming full stay days',()=>{
 const stop=lookup.get('romo'),open=schedule([stop],settings),loop=schedule([stop],{...settings,end:settings.start});
 assert.equal(loop.legs.length,2);assert.equal(loop.parkDays,open.parkDays);assert.ok(loop.miles>open.miles);assert.equal(travel(stop,stop).hours,0);
});
test('personal stops and optional sites are preserved in optimization',()=>{
 const personal={id:'custom-family',shortName:'Family',name:'Family',lat:39,lng:-105,days:7,type:'custom'};
 const stops=[lookup.get('romo'),lookup.get('grsa'),personal],r=optimize(stops,settings);assert.deepEqual(new Set(r.order),new Set(stops.map(s=>s.id)));assert.equal(r.parkDays,stops.reduce((n,s)=>n+s.days,0));
 const suggestions=detours(data.filter(s=>s.type==='site'),stops,{...settings,detourHours:2});assert.ok(suggestions.length>0);assert.ok(suggestions.every(s=>s.extraHours>=0&&s.extraHours<=2));
});
test('all-parks optimization preserves every park and all visit days',()=>{
 const parks=data.filter(s=>s.type==='park'),r=optimize(parks,settings);assert.equal(r.order.length,51);assert.equal(new Set(r.order).size,51);assert.equal(r.parkDays,parks.reduce((n,s)=>n+s.days,0));assert.ok(Number.isFinite(r.score));assert.ok(r.legs.every(l=>l.dailyHours<=10));
});
test('every park has a tailored stay allowance, rather than uniform three-day stays',()=>{
 for(const p of data.filter(s=>s.type==='park'))assert.ok(Number.isInteger(p.days)&&p.days>=1,p.id);
 assert.equal(lookup.get('yell').days,8);assert.equal(lookup.get('jeff').days,1);assert.equal(lookup.get('yose').days,7);assert.equal(lookup.get('romo').days,6);
});
test('homeward leg is optimized and counted under the new round-trip default',()=>{
 const s=structuredClone(DEFAULT_SETTINGS),stop=lookup.get('deva'),r=optimize([stop],s);
 assert.equal(s.endMode,'return');assert.equal(r.legs.at(-1).to,'finish');assert.equal(r.miles,travel(s.start,stop,s).miles+travel(stop,s.end,s).miles);
 assert.equal(r.parkDays,stop.days);assert.equal(r.legs.at(-1).days,driveDays(travel(stop,s.end,s).hours,s));
});
test('legacy preferences migrate once without discarding individual stay edits',()=>{
 const raw={version:1,settings:{...DEFAULT_SETTINGS,endMode:'open'},days:{yell:10},custom:[{id:'custom-test'}]};
 const upgraded=upgradePlanPreferences(raw);assert.equal(upgraded.settings.endMode,'return');assert.equal(upgraded.settings.stayMode,'park');assert.equal(upgraded.days.yell,10);assert.equal(upgraded.custom[0].id,'custom-test');assert.equal(raw.settings.endMode,'open');
 const reopened=upgradePlanPreferences({...upgraded,settings:{...upgraded.settings,endMode:'open'}});assert.equal(reopened.settings.endMode,'open');
 const custom=upgradePlanPreferences({...raw,settings:{...raw.settings,endMode:'custom'}});assert.equal(custom.settings.endMode,'custom');
});
test('average speed changes time independently from estimated mileage',()=>{
 const a=lookup.get('deva'),b=lookup.get('drto'),slow=travel(a,b,{averageMph:48}),fast=travel(a,b,{averageMph:65});
 assert.equal(slow.miles,fast.miles);assert.ok(fast.hours<slow.hours);assert.equal(fast.hours,fast.miles/65+.25);
 assert.equal(slow.path.at(-1).lat,b.access.gateway.lat);assert.equal(slow.path.at(-1).lng,b.access.gateway.lng);
});
test('Canadian corridor is allowed without an artificial south-of-lakes detour',()=>{
 const a=lookup.get('voya'),b=lookup.get('acad'),r=travel(a,b);
 assert.equal(r.path.length,2);assert.ok(r.cautions.some(s=>s.includes('Canada')));
 assert.ok(r.miles>1500&&r.miles<1600);assert.ok(r.hours>31&&r.hours<33);
});
test('seasonal priority avoids the Colorado/Utah zigzag when seasonal conditions are equal',()=>{
 const parks=['arch','blca','cany','care'].map(id=>({...lookup.get(id),profile:{ideal:[1,2,3,4,5,6,7,8,9,10,11,12],bad:[],quiet:[]}}));
 const s={...DEFAULT_SETTINGS,startDate:'2040-05-01',seasonDetourPercent:15};
 const permutations=a=>a.length===1?[a]:a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p]));
 const alternatives=permutations(parks).map(order=>schedule(order,s));
 const minimum=Math.min(...alternatives.map(r=>r.miles)),bestScore=Math.min(...alternatives.map(r=>r.score));
 const r=optimize(parks,s);assert.ok(Math.abs(r.score-bestScore)<.001,JSON.stringify(r.order));assert.ok(r.miles<minimum*1.03);
 const shortest=optimize(parks,{...s,objective:'shortest'});assert.ok(Math.abs(shortest.miles-minimum)<.001);
 const index=id=>r.order.indexOf(id);assert.ok(!(Math.min(index('arch'),index('cany'))<index('blca')&&index('blca')<Math.max(index('arch'),index('cany'))));
});
test('seasonal route respects its explicit extra-distance budget',()=>{
 const r=optimize(['romo','yell','grte','arch','blca','cany','care','deva','jotr','bibe'].map(id=>lookup.get(id)),{...DEFAULT_SETTINGS,seasonDetourPercent:8});
 assert.ok(r.miles<=r.baselineMiles*1.08+.001);assert.equal(r.detourPercent,8);assert.ok(r.extraMiles>=0);
});
test('stop allowance increases elapsed time but not driving distance or driving limits',()=>{
 const a=lookup.get('deva'),b=lookup.get('drto'),withStops=travel(a,b,{...DEFAULT_SETTINGS,breakPercent:10}),without=travel(a,b,{...DEFAULT_SETTINGS,breakPercent:0});
 assert.equal(withStops.miles,without.miles);assert.equal(withStops.hours,without.hours);assert.ok(Math.abs(withStops.elapsedHours-withStops.hours*1.1)<1e-9);
 const r=schedule([b],{...DEFAULT_SETTINGS,start:a});assert.ok(Math.abs(r.elapsedHours-r.hours*1.1)<1e-9);assert.ok(r.legs.every(l=>l.dailyHours<=10));
});
