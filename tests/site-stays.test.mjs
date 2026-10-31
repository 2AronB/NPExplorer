import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SITE_STAYS,siteStay,resolveSiteDays} from '../site-stays.mjs';
import {currentInventory} from '../current-inventory.mjs';
import {validVisitDays} from '../visit-durations.mjs';
import {alongCandidates} from '../along-the-way.mjs';
import {schedule} from '../optimizer.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
import {exportTables} from '../trip-export.mjs';
const sites=currentInventory(JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites).filter(s=>s.type==='site');
test('all 334 runtime non-park sites have valid ordered family estimates and honest provenance',()=>{
 assert.equal(sites.length,334);assert.deepEqual(Object.keys(SITE_STAYS).sort(),sites.map(s=>s.id).sort());
 for(const s of sites){const p=SITE_STAYS[s.id];assert.ok(validVisitDays(s,p.fast));assert.ok(validVisitDays(s,p.slow));assert.ok(p.fast<=p.slow);assert.ok(p.reason.length>40);assert.match(p.reference,/^https:\/\/(home\.)?(www\.)?nps\.gov\//);assert.ok(['Named family-trip judgment','Designation-based family-trip estimate'].includes(p.basis));}
 assert.equal(Object.values(SITE_STAYS).filter(p=>p.sourceChecked).length,7);assert.ok(!SITE_STAYS.chir);
});
test('signature natural landscapes and dispersed history warrant longer stays than compact memorials',()=>{
 assert.deepEqual([SITE_STAYS.dino.fast,SITE_STAYS.dino.slow],[1,2]);assert.deepEqual([SITE_STAYS.chcu.fast,SITE_STAYS.chcu.slow],[.5,1.5]);assert.ok(SITE_STAYS.pore.slow>SITE_STAYS.linc.slow);assert.ok(SITE_STAYS.gett.slow>SITE_STAYS.edal.slow);assert.deepEqual([SITE_STAYS.flfo.fast,SITE_STAYS.flfo.slow],[.25,.75]);assert.match(SITE_STAYS.pima.reason,/access/);assert.match(SITE_STAYS.appa.reason,/local segment/);assert.match(SITE_STAYS.mall.reason,/overlap|same shared visit/);
});
test('fast/slow presets resolve independently of explicit overrides without mutating them',()=>{
 const s=sites.find(s=>s.id==='dino'),overrides={dino:.25};assert.equal(resolveSiteDays(s,{stayMode:'highlights'}),1);assert.equal(resolveSiteDays(s,{stayMode:'park'}),2);assert.equal(resolveSiteDays(s,{stayMode:'uniform',defaultDays:7}),2);for(const mode of ['park','highlights','uniform'])assert.equal(resolveSiteDays(s,{stayMode:mode},overrides),.25);assert.deepEqual(overrides,{dino:.25});assert.equal(siteStay({id:'unknown'}),null);
});
test('both presets retain exact exploration and reconcile allocation reports on real site itineraries',()=>{
 for(const stayMode of ['park','highlights']){const selected=sites.filter(s=>['flfo','dino','chcu'].includes(s.id)).map(s=>({...s,days:resolveSiteDays(s,{stayMode})})),settings={...DEFAULT_SETTINGS,stayMode,autoMonth:false,startDate:'2040-06-01'},result=schedule(selected,settings),state={selected:selected.map(s=>s.id),settings,days:{},rules:{},calibration:{}};const doc=exportTables({state,sites:selected,result}).travelDocument;assert.equal(doc.accounting.exploration,selected.reduce((n,s)=>n+s.days,0));assert.equal(doc.accounting.days,result.totalDays);}
});
test('downloadable estimates cover every site with both day and eight-hour equivalents',()=>{
 const csv=fs.readFileSync(new URL('../data/site-stays.csv',import.meta.url),'utf8');assert.equal(csv.trim().split(/\r?\n/).length,335);for(const s of sites)assert.ok(csv.includes('"'+s.id+'",'));assert.match(csv,/Fast hours at 8h\/day/);
});

test('discovery uses the route family estimate instead of a universal quarter-day suggestion',()=>{
 const chaco=sites.find(s=>s.id==='chcu'),anchor={...chaco,id:'anchor',type:'park',days:1};
 for(const [stayMode,expected]of [['park',1.5],['highlights',.5]]){const settings={...DEFAULT_SETTINGS,stayMode,detourHours:12},result=schedule([anchor],settings),state={selected:['anchor'],settings,days:{}};assert.equal(alongCandidates({state,sites:[anchor,chaco],result})[0].days,expected);state.days.chcu=.25;assert.equal(alongCandidates({state,sites:[anchor,chaco],result})[0].days,.25);}
});
