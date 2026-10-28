import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {travel,driveDays,dateOf,addDays,iso,isClosed,season,schedule,optimize,detours,routeMiles} from '../optimizer.mjs';
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


const near=(id,hours,extra={})=>({id,shortName:id,type:'park',lat:0,lng:(hours-.25)*60/69.0934,days:2,...extra});
const ledgerSettings={...DEFAULT_SETTINGS,start:{lat:0,lng:0},end:null,startDate:'2040-01-31',restDays:0,averageMph:60,distanceFactor:1};

test('road days fit both driving ceilings and the complete activity budget',()=>{
 for(const sharedDays of [false,true])for(const pace of ['relaxed','balanced','efficient'])for(const hours of [0,3,7,10,25]){
  const s={...ledgerSettings,sharedDays,pace},n=driveDays(hours,s);
  if(!hours){assert.equal(n,0);continue;}
  assert.ok(hours/n<=s.maxDrive);
  assert.ok(hours/n*(1+s.breakPercent/100)+s.setupHours+s.teardownHours<=s.dayBudget+1e-9);
 }
 assert.equal(driveDays(25,{...ledgerSettings,pace:'efficient'}),4);
 assert.throws(()=>driveDays(1,{...ledgerSettings,dayBudget:1}),/activity budget/);
});

test('arrival and departure exploration reconcile without unbudgeted carry',()=>{
 const stops=[near('first',3),near('second',7),near('personal',8,{type:'custom'})];
 const shared=schedule(stops,ledgerSettings),full=schedule(stops,{...ledgerSettings,sharedDays:false});
 assert.equal(shared.miles,full.miles);assert.equal(shared.hours,full.hours);assert.equal(shared.parkDays,6);
 assert.ok(shared.visits[0].sharedDays>0);assert.equal(shared.visits[2].sharedDays,0);
 for(let i=0;i<stops.length;i++){
  const v=shared.visits[i];assert.equal(v.calendarDays+v.sharedDays+v.departureSharedDays-v.unusedDays,v.days);
  assert.equal(v.calendarDays,Math.ceil(v.days-v.sharedDays-v.departureSharedDays));
  if(i)assert.equal(shared.legs[i].depart,shared.visits[i-1].departureDriveDate??shared.visits[i-1].departure);
  assert.equal(dateOf(v.stayStart).getUTCHours(),12);
 }
 assert.equal(shared.roundingDays,0);
 assert.equal(shared.totalDays,shared.travelDays+shared.visits.reduce((n,v)=>n+v.calendarDays,0));
});

test('season quality and penalty weight actual arrival credit across a month boundary',()=>{
 const p=near('seasonal',3,{profile:{scores:[0,10,10,10,10,10,10,10,10,10,10,10],quiet:[]}});
 const r=schedule([p],ledgerSettings),v=r.visits[0],credit=v.sharedDays;
 assert.equal(v.arrival,'2040-01-31');assert.equal(v.stayStart,'2040-02-01');assert.equal(credit,.5);
 assert.equal(r.qualityDays,2);assert.equal(v.quality,(credit*0+(2-credit)*10)/2);
 assert.equal(v.minQuality,0);assert.ok(Math.abs(r.seasonPenalty-100/9*credit)<1e-9);
});

test('closed arrival date receives no credit and closure checks use only occupied exploration dates',()=>{
 const p=near('closed',3,{closure:{start:'01-31',end:'01-31'}}),r=schedule([p],ledgerSettings);
 assert.equal(r.visits[0].sharedDays,0);assert.equal(r.visits[0].arrival,'2040-02-01');assert.equal(r.waitDays,0);
 const brief=near('brief',.5,{days:1,closure:{start:'02-01',end:'02-28'}});
 const s={...ledgerSettings,setupHours:0,teardownHours:0};
 const full=schedule([brief],s);assert.equal(full.visits[0].sharedDays,1);assert.equal(full.visits[0].calendarDays,0);assert.equal(full.waitDays,0);assert.equal(full.visits[0].departure,'2040-02-01');
});

test('zero legs, access transfers, closure waits and home legs never invent shared exploration',()=>{
 const zero=near('zero',3,{lat:0,lng:0}),transfer=near('boat',3,{access:{transferDays:2}}),wait=near('wait',7,{closure:{start:'01-01',end:'03-01'}});
 const r=schedule([zero,transfer,wait],{...ledgerSettings,end:ledgerSettings.start,restDays:3});
 assert.ok(r.visits.every(v=>v.sharedDays===0));assert.ok(r.waitDays>0);assert.equal(r.transferDays,2);
 assert.equal(r.legs.at(-1).to,'finish');assert.equal(r.totalDays,r.parkDays-r.sharedParkDays+r.travelDays+r.transferDays+r.waitDays+r.restDays+r.visits.reduce((n,v)=>n+v.unusedDays,0));
 const longer=schedule([zero,transfer,wait],{...ledgerSettings,end:ledgerSettings.start,restDays:3,duration:1});
 assert.equal(r.score,longer.score);assert.equal(r.endDate,longer.endDate);
});


test('impossible exploration activity budgets fail explicitly without silently shortening stays',()=>{
 assert.throws(()=>schedule([near('park',3)],{...ledgerSettings,dayBudget:6,explorationHours:8}),/exploration-day hours exceed/);
});


const nextRoad=(from,id,hours,extra={})=>near(id,hours,{lng:from.lng+(hours-.25)*60/69.0934,...extra});
const checkRoadLedger=(r,s)=>{
 const dates=new Set();
 for(const leg of r.legs){
  assert.equal(leg.dailyActivities.length,leg.days);
  assert.ok(Math.abs(leg.dailyActivities.reduce((n,d)=>n+d.driveHours,0)-leg.hours)<1e-8);
  for(const d of leg.dailyActivities){
   assert.equal(dates.has(d.date),false,'one road allocation per date');dates.add(d.date);
   assert.ok(d.driveHours<=s.maxDrive+1e-8);
   assert.ok(d.totalHours<=s.dayBudget+1e-8,JSON.stringify(d));
   assert.ok(Math.abs(d.totalHours-d.driveHours-d.breakHours-d.campHours-d.departureExplorationHours-d.arrivalExplorationHours)<1e-8);
  }
 }
 assert.equal(r.mixedDays,r.legs.flatMap(l=>l.dailyActivities).filter(d=>d.departureExplorationHours||d.arrivalExplorationHours).length);
 assert.equal(r.totalDays,r.travelDays+r.parkDays-r.sharedParkDays+r.visits.reduce((n,v)=>n+(v.unusedDays||0),0)+r.transferDays+r.waitDays+r.restDays+r.roundingDays);
};

test('a half-day final morning can precede a sub-half-hour home drive',()=>{
 const a=near('morning',3),end=nextRoad(a,'finish',.4),s={...ledgerSettings,end};
 const r=schedule([a],s),v=r.visits[0],home=r.legs.at(-1);
 assert.equal(v.sharedDays,.5);assert.equal(v.departureSharedDays,.5);
 assert.equal(home.depart,v.departureDriveDate);assert.equal(home.depart,'2040-02-02');
 assert.equal(home.days,1);assert.equal(home.dailyActivities[0].departureExplorationHours,4);
 assert.ok(home.hours<.5);assert.equal(v.calendarDays,1);assert.equal(v.unusedDays,0);
 assert.equal(r.totalDays,3);assert.equal(r.parkDays,2);checkRoadLedger(r,s);
});

test('long afternoon legs split driving across the morning budget and later dates',()=>{
 const a=near('morning',3),end=nextRoad(a,'finish',10),s={...ledgerSettings,end};
 const r=schedule([a],s),home=r.legs.at(-1);
 assert.equal(home.days,2);assert.equal(home.dailyActivities[0].departureExplorationHours,4);
 assert.ok(home.dailyActivities[0].driveHours<home.dailyActivities[1].driveHours);
 assert.ok(Math.abs(home.dailyActivities[0].totalHours-10)<1e-8);
 assert.equal(home.dailyActivities[1].departureExplorationHours,0);checkRoadLedger(r,s);
});

test('morning at one park and evening at the next share one budget and one mixed day',()=>{
 const a=near('first',3),b=nextRoad(a,'second',.4),r=schedule([a,b],ledgerSettings),d=r.legs[1].dailyActivities[0];
 assert.equal(r.visits[0].departureSharedDays,.5);assert.equal(r.visits[1].sharedDays,.5);
 assert.equal(d.departureExplorationHours,4);assert.equal(d.arrivalExplorationHours,4);
 assert.equal(r.mixedDays,2);assert.equal(r.sharedParkDays,1.5);checkRoadLedger(r,ledgerSettings);
});

test('a full final exploration day only permits driving if all activities still fit',()=>{
 const a=near('full',3,{lat:0,lng:0}),end=nextRoad(a,'finish',.4),s={...ledgerSettings,end};
 const r=schedule([a],s);assert.equal(r.visits[0].departureSharedDays,1);assert.equal(r.legs.at(-1).dailyActivities[0].departureExplorationHours,8);checkRoadLedger(r,s);
 const tight={...s,dayBudget:8},blocked=schedule([a],tight);
 assert.equal(blocked.visits[0].departureSharedDays,0);assert.equal(blocked.legs.at(-1).depart,blocked.visits[0].departure);checkRoadLedger(blocked,tight);
 const off=schedule([a],{...s,sharedDays:false});assert.equal(off.sharedParkDays,0);assert.equal(off.visits[0].calendarDays,2);
});

test('afternoon arrival season samples use the shifted date and retain closure checks',()=>{
 const a=near('first',3),b=nextRoad(a,'second',.4,{profile:{scores:[0,10,10,10,10,10,10,10,10,10,10,10],quiet:[]}});
 const s={...ledgerSettings,startDate:'2040-01-29'},r=schedule([a,b],s),v=r.visits[1];
 assert.equal(v.arrival,'2040-01-31');assert.equal(v.sharedDays,.5);assert.equal(v.quality,7.5);assert.equal(v.minQuality,0);checkRoadLedger(r,s);
 const closed=schedule([a,{...b,closure:{start:'01-31',end:'01-31'}}],s);
 assert.equal(closed.visits[1].sharedDays,0);assert.equal(closed.visits[1].arrival,'2040-02-01');checkRoadLedger(closed,s);
});

test('personal, access-transfer and closure-wait stays do not release an exploration morning',()=>{
 for(const extra of [{type:'custom'},{access:{transferDays:2}},{closure:{start:'01-01',end:'02-01'}}]){
  const a=near('separate',3,extra),s={...ledgerSettings,end:nextRoad(a,'finish',.4)},r=schedule([a],s);
  assert.equal(r.visits[0].departureSharedDays,0);assert.equal(r.legs.at(-1).depart,r.visits[0].transferDays?iso(addDays(dateOf(r.visits[0].departure),1)):r.visits[0].departure);
 }
});
