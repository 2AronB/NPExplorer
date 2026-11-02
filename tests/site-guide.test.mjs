import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {siteGuideRows} from '../site-guide.mjs';
import {siteGuideHtml,DEFAULT_GUIDE_FILTERS} from '../site-guide-ui.mjs';
import {currentInventory} from '../current-inventory.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
const sites=currentInventory(JSON.parse(fs.readFileSync(new URL('../data/sites.json',import.meta.url))).sites);
const input=()=>({sites,state:{selected:['flfo','pima'],settings:{...DEFAULT_SETTINGS,stayMode:'park',explorationHours:8},days:{flfo:.25}}});
test('the guide works without a route and compares all 334 audited records independently of detour geometry',()=>{
 const data=input(),rows=siteGuideRows(data);assert.equal(rows.length,334);assert.equal(new Set(rows.map(r=>r.site.id)).size,334);assert.ok(rows.every(r=>r.site.type==='site'));assert.equal(rows.find(r=>r.site.id==='flfo').hours,2);assert.equal(rows.find(r=>r.site.id==='flfo').custom,true);assert.deepEqual(data.state.days,{flfo:.25});
});
test('fast and slow comparison filters do not overwrite the current route style or custom duration',()=>{
 const data=input(),before=structuredClone(data.state);assert.equal(siteGuideRows(data,{profile:'slow'}).find(r=>r.site.id==='flfo').hours,6);assert.equal(siteGuideRows(data,{profile:'slow'}).find(r=>r.site.id==='flfo').plannedDays,.25);assert.equal(siteGuideRows(data,{profile:'fast'}).find(r=>r.site.id==='flfo').hours,2);assert.deepEqual(data.state,before);
 data.state.settings.explorationHours=4;assert.equal(siteGuideRows(data,{profile:'slow'}).find(r=>r.site.id==='flfo').hours,3);
});
test('allowance, state, outing text and logistics filters combine with exact boundary inclusion',()=>{
 const data=input();assert.ok(siteGuideRows(data,{inventoryState:'CO',query:'petrified',maxHours:2}).some(r=>r.site.id==='flfo'));assert.ok(!siteGuideRows(data,{inventoryState:'AZ',query:'petrified'}).some(r=>r.site.id==='flfo'));assert.ok(!siteGuideRows(data,{maxHours:1.99}).some(r=>r.site.id==='flfo'));assert.ok(siteGuideRows(data,{logistics:'boat'}).some(r=>r.site.id==='rabr'));assert.ok(siteGuideRows(data,{query:'42 inches'}).some(r=>r.site.id==='orca'));assert.equal(siteGuideRows(data,{query:'not-a-site-1234567'}).length,0);
});
test('natural plural searches and multiple words find the intended experience rather than requiring an exact phrase',()=>{
 const data=input();assert.equal(siteGuideRows(data,{query:'Dinosaur fossils'})[0].site.id,'dino');assert.ok(siteGuideRows(data,{query:'Florissant petrified'}).some(r=>r.site.id==='flfo'));assert.ok(siteGuideRows(data,{query:'museums'}).length>5);assert.ok(siteGuideRows(data,{query:'Genevieve'}).some(r=>r.site.id==='stge'));
});
test('all-record review retains non-public and umbrella entries while candidate mode excludes them',()=>{
 const data=input();assert.equal(siteGuideRows(data,{scope:'candidate'}).length,332);assert.deepEqual(siteGuideRows(data,{scope:'selected'}).map(r=>r.site.id).sort(),['flfo','pima']);assert.ok(!siteGuideRows(data,{scope:'candidate'}).some(r=>['pima','naca'].includes(r.site.id)));assert.equal(data.state.selected.length,2);
});
test('shorter and longer sorting use the chosen allowance with stable name ties and invalid filters fail clearly',()=>{
 const data=input(),short=siteGuideRows(data,{sort:'shorter'}),long=siteGuideRows(data,{sort:'longer'});assert.ok(short.every((r,i)=>!i||short[i-1].hours<=r.hours));assert.ok(long.every((r,i)=>!i||long[i-1].hours>=r.hours));for(const maxHours of [-1,NaN,Infinity,3651])assert.throws(()=>siteGuideRows(data,{maxHours}));assert.throws(()=>siteGuideRows(data,{profile:'official'}));
});
test('guide output paginates, retains explicit access warnings and escapes user-visible inventory text',()=>{
 const data=input(),html=siteGuideHtml(data),pima=siteGuideHtml(data,{...DEFAULT_GUIDE_FILTERS,query:'Hohokam'});assert.match(html,/334 matching profiles/);assert.match(html,/showing 12 of 334/);assert.match(html,/Show 12 more profiles/);assert.match(pima,/Not a public visit/);assert.match(pima,/not open to the public/);assert.doesNotMatch(pima,/Show 12 more profiles/);const altered={...data,sites:[{...sites.find(s=>s.id==='flfo'),name:'<img src=x onerror=alert(1)>'}]};assert.doesNotMatch(siteGuideHtml(altered),/<img/);assert.match(siteGuideHtml(altered),/&lt;img/);
});
