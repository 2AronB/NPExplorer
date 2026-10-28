import {currentInventory} from '../current-inventory.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {REMOTE_PARKS,MAINLAND_AIRPORTS,CANADA_CORRIDOR} from '../remote-parks.mjs';
import {optimizeTrip,airportCandidates} from '../trip-optimizer.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
import {schedule,dateOf,addDays,iso} from '../optimizer.mjs';
const land=JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites;
const park=id=>structuredClone(REMOTE_PARKS.find(s=>s.id===id));
const mia=MAINLAND_AIRPORTS.find(a=>a.code==='MIA');
const settings={...DEFAULT_SETTINGS,autoMonth:false,startDate:'2040-06-01',restDays:0,alaskaMode:'compare',airportCodes:['MIA'],start:{...mia,id:'start'},end:{...mia,id:'finish'}};
const visited=r=>r.visits.filter(v=>!v.excursion).map(v=>v.id).concat(r.excursions.flatMap(b=>b.visits.map(v=>v.id)));
test('combined inventory covers all 64 designated national parks without duplicate IDs',()=>{
 assert.equal(currentInventory(land).filter(s=>s.type==='park').length+REMOTE_PARKS.length,64);
 assert.equal(new Set([...land,...REMOTE_PARKS].map(s=>s.id)).size,398);
 assert.equal(airportCandidates(DEFAULT_SETTINGS).length,23);assert.ok(airportCandidates(DEFAULT_SETTINGS).some(a=>a.code==='MIA'));
});
test('Miami can fly to Alaska; both modes compare and recover the same vehicle',()=>{
 const r=optimizeTrip([park('dena'),park('katm')],settings),b=r.excursions[0],c=r.remoteComparisons[0];
 assert.deepEqual(new Set(c.alternatives.map(a=>a.mode)),new Set(['drive','fly']));
 const fly=c.alternatives.find(a=>a.mode==='fly');assert.equal(fly.airport,'MIA');assert.ok(fly.flightHours>0);
 assert.equal(b.mode,'fly');assert.equal(b.airport.code,'MIA');assert.equal(b.transport[0].from.code,'MIA');assert.equal(b.transport.at(-1).to.code,'MIA');
 assert.equal(r.parkDays,10);assert.deepEqual(new Set(visited(r)),new Set(['dena','katm']));
 assert.ok(r.transferDays>0);assert.equal(r.visits[0].days,10);assert.ok(r.legs.every(l=>l.miles===0));
});
test('driving Alaska follows the Canadian corridor and still uses remote park transfers',()=>{
 const r=optimizeTrip([park('kefj'),park('kova')],{...settings,alaskaMode:'drive'}),b=r.excursions[0];
 assert.equal(b.mode,'drive');assert.equal(b.airport,null);assert.ok(b.miles>2500);assert.ok(b.flightHours>0);
 assert.ok(b.transport.some(t=>t.from?.name===CANADA_CORRIDOR[0].name));
 assert.equal(b.transport.at(-1).to.name,CANADA_CORRIDOR[0].name);
 assert.ok(b.visits.some(v=>v.id==='kova'&&v.route.includes('landing')));
 assert.equal(r.parkDays,7);assert.ok(r.hours>0);
});
test('Alaska summer transport availability shifts an entire excursion and preserves full stays',()=>{
 const parks=REMOTE_PARKS.filter(s=>s.remote.region==='alaska'),r=optimizeTrip(parks,{...settings,startDate:'2040-01-01',alaskaMode:'fly'}),b=r.excursions[0];
 assert.ok(b.feasible);assert.ok(b.wait>100);assert.equal(b.visits.length,8);assert.equal(r.parkDays,parks.reduce((n,s)=>n+s.days,0));
 for(const v of b.visits){const p=parks.find(s=>s.id===v.id);for(let i=0;i<v.days;i++){const md=iso(addDays(dateOf(v.arrival),i)).slice(5);assert.ok(md>=p.remote.window.start&&md<=p.remote.window.end,p.id);}}
 assert.equal(r.totalDays,r.parkDays+r.travelDays+r.transferDays+r.waitDays+r.restDays);
});
test('impossible service windows retain every requested day and flag infeasibility',()=>{
 const p=park('kova');p.days=100;
 const r=optimizeTrip([p],{...settings,alaskaMode:'fly'});
 assert.equal(r.excursions[0].feasible,false);assert.equal(r.parkDays,100);assert.equal(r.excursions[0].visits[0].days,100);assert.ok(r.score>=1e9);assert.ok(r.warnings.some(w=>w.includes('infeasible')));
});
test('buffers and duration overrun do not consume full park days; all islands are visited',()=>{
 const parks=REMOTE_PARKS.filter(s=>s.remote.region!=='alaska'),s={...settings,duration:10,remoteBufferDays:4};
 const r=optimizeTrip(parks,s);assert.equal(r.excursions.length,3);assert.equal(r.parkDays,19);assert.ok(r.remaining<0);assert.equal(visited(r).length,4);
 assert.ok(r.excursions.every(b=>b.bufferDays===4));const samoa=r.excursions.find(b=>b.region==='samoa');assert.ok(samoa.transport.some(t=>t.label.includes('Honolulu → Pago Pago')));
 const vi=r.excursions.find(b=>b.region==='virgin');assert.ok(vi.visits[0].route.includes('ferry'));
});
test('twelve monthly searches retain distinct complete excursion calendars',()=>{
 const p=park('viis'),r=optimizeTrip([p],{...settings,autoMonth:true});assert.equal(r.monthResults.length,12);
 for(let i=0;i<12;i++){const m=r.monthResults[i];assert.equal(dateOf(m.startDate).getUTCMonth(),i);assert.equal(m.excursions[0].visits[0].days,5);assert.equal(m.nodes[0].excursion.airport.code,'MIA');}
 assert.equal(r.score,Math.min(...r.monthResults.map(m=>m.score)));
});
test('mixed mainland, personal and remote selections survive airport insertion and return home',()=>{
 const p={id:'custom-family',name:'Family',shortName:'Family',type:'custom',lat:39,lng:-100,days:4};
 const r=optimizeTrip([land.find(s=>s.id==='romo'),p,park('viis')],{...settings,start:DEFAULT_SETTINGS.start,end:DEFAULT_SETTINGS.end});
 assert.deepEqual(new Set(visited(r)),new Set(['romo','custom-family','viis']));assert.equal(r.legs.at(-1).to,'finish');
 assert.ok(r.mainlandMiles<=r.maxMiles+.01);const chosen=r.remoteComparisons[0].alternatives.find(a=>a.mode===r.excursions[0].mode);assert.equal(chosen.tripDays,r.totalDays);assert.equal(chosen.miles,r.miles);
});

test('Hawaii uses island-to-island flights instead of returning through Honolulu for each park',()=>{
 const parks=[park('hale'),park('havo')],r=optimizeTrip(parks,settings),b=r.excursions[0];
 const flights=b.transport.filter(t=>t.kind==='flight');assert.equal(flights.length,3);assert.equal(flights[0].from.code,'MIA');assert.equal(flights.at(-1).to.code,'MIA');assert.ok(flights[1].label.includes('Kahului OGG → Hilo ITO'));assert.equal(r.parkDays,9);
});
test('user-added mainland airports can reach any region without a geographic whitelist',()=>{
 const airport={id:'airport-BWI',code:'BWI',name:'Baltimore',lat:39.18,lng:-76.67};
 const r=optimizeTrip([park('gaar')],{...settings,customAirports:[airport],airportCodes:['BWI'],alaskaMode:'fly'});
 assert.equal(r.excursions[0].airport.code,'BWI');assert.equal(r.remoteComparisons[0].airportsTested,1);assert.equal(r.requestedIds[0],'gaar');
});

test('current Chiricahua designation upgrades its existing marker without duplicating it',()=>{const updated=currentInventory(land),p=updated.find(s=>s.id==='chir');assert.equal(updated.length,land.length);assert.equal(p.type,'park');assert.equal(p.shortName,'Chiricahua');assert.equal(p.days,2);assert.ok(p.designationSource.includes('nps.gov/chir'));assert.equal(land.find(s=>s.id==='chir').type,'site');});


test('all eight Alaska parks preserve access and whole-day ledgers in each mode',()=>{
 const parks=REMOTE_PARKS.filter(s=>s.remote.region==='alaska');
 for(const alaskaMode of ['drive','fly','compare']){
  const r=optimizeTrip(parks,{...settings,alaskaMode}),b=r.excursions[0];
  assert.equal(b.visits.length,8);assert.ok(b.feasible);assert.equal(r.sharedParkDays,0);
  assert.equal(r.parkDays,parks.reduce((n,p)=>n+p.days,0));
  assert.equal(r.totalDays,r.parkDays+r.travelDays+r.transferDays+r.waitDays);
  for(const t of b.transport.filter(t=>t.kind==='drive'))assert.ok(!t.days||t.hours/t.days*1.1+1.5<=settings.dayBudget+1e-9);
  assert.ok(b.transport.some(t=>t.kind==='transfer'));assert.equal(b.bufferDays,settings.remoteBufferDays);
 }
});


test('reusing an excursion node invalidates cached calendars when assumptions or stays change',()=>{
 const p=park('hale'),node={id:'excursion-hawaii',shortName:'Hawaii',lat:mia.lat,lng:mia.lng,excursion:{region:'hawaii',mode:'fly',airport:mia,parks:[p]}};
 const first=schedule([node],settings),buffer=schedule([node],{...settings,remoteBufferDays:5});
 assert.equal(buffer.totalDays-first.totalDays,5-settings.remoteBufferDays);
 p.days+=2;const stay=schedule([node],settings);
 assert.equal(stay.parkDays-first.parkDays,2);assert.equal(stay.totalDays-first.totalDays,2);
 const slow=schedule([node],{...settings,remoteRoadMph:1});
 assert.ok(slow.travelDays>stay.travelDays);assert.ok(slow.excursions[0].transport.filter(t=>t.kind==='drive').every(t=>t.hours/t.days<=settings.maxDrive));
});
