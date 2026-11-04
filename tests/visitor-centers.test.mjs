import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {currentInventory} from '../current-inventory.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
import {googleMapsPin,validateVisitorCenters,visitorCenterHtml,visitorCentersCsv} from '../visitor-centers.mjs';
const data=JSON.parse(await fs.readFile(new URL('../data/park-visitor-centers.json',import.meta.url),'utf8'));
const {sites}=JSON.parse(await fs.readFile(new URL('../data/sites.json',import.meta.url),'utf8'));
const parks=[...currentInventory(sites).filter(s=>s.type==='park'),...REMOTE_PARKS],ids=parks.map(s=>s.id);
test('every retained park has a named source-backed facility pin, distinct from its planning marker',()=>{
 const before=JSON.stringify({data,parks});assert.equal(validateVisitorCenters(data,ids),data);assert.equal(ids.length,64);
 let alternatives=0;
 for(const p of parks){const r=data.records[p.id];assert.ok(r.primary.name);assert.notEqual(r.primary.lat+','+r.primary.lng,p.lat+','+p.lng);alternatives+=r.alternatives.length;
  for(const c of [r.primary,...r.alternatives]){const u=new URL(googleMapsPin(c));assert.equal(u.hostname,'www.google.com');assert.equal(u.pathname,'/maps/search/');assert.equal(u.searchParams.get('api'),'1');assert.equal(u.searchParams.get('query'),c.lat+','+c.lng);assert.equal(u.searchParams.has('origin'),false);assert.equal(u.searchParams.has('travelmode'),false);}
 }
 assert.equal(alternatives,44);assert.equal(JSON.stringify({data,parks}),before);
});
test('review preserves remote access, outside-park and separate-district distinctions',()=>{
 for(const id of ['drto','isro','katm'])assert.match(data.records[id].note,/boat|seaplane|Floatplane/i);
 for(const id of ['gaar','kova'])assert.match(data.records[id].note,/Outside the park/);
 assert.match(data.records.cany.note,/no internal road/);assert.match(data.records.pinn.note,/no connecting road/);
 assert.equal(data.records.yose.primary.name,'Yosemite Valley Welcome Center');assert.equal(data.records.havo.primary.name,'Welcome Center');
 assert.equal(data.records.npsa.primary.lat<0,true);assert.equal(data.records.npsa.primary.lng<0,true);
 assert.notDeepEqual(data.records.kica.primary,data.records.sequ.primary);assert.equal(data.records.kica.sourceUrl,data.records.sequ.sourceUrl);
});
test('invalid coordinates, source URLs and partial inventory fail validation',()=>{
 for(const coords of [{lat:NaN,lng:1},{lat:91,lng:1},{lat:1,lng:181}])assert.throws(()=>googleMapsPin(coords));
 for(const change of [d=>delete d.records.zion,d=>d.records.zion.primary.lat=NaN,d=>d.records.zion.primary.informationUrl='javascript:alert(1)',d=>d.records.zion.sourceUrl='https://nps.gov.attacker.test/data']){const d=structuredClone(data);change(d);assert.throws(()=>validateVisitorCenters(d,ids));}
});
test('compact card escapes facility text and only expands selected alternatives',()=>{
 const r=structuredClone(data.records.cany);r.primary.name='<script>bad & name</script>';const html=visitorCenterHtml(r,data.reviewed);
 assert.ok(html.includes('&lt;script&gt;bad &amp; name&lt;/script&gt;'));assert.ok(!html.includes('<script>'));
 assert.match(html,/<details><summary>Other useful centers/);assert.match(html,/not a measured size or popularity ranking/);
 assert.match(html,/not a verified parking entrance/);assert.equal(visitorCenterHtml(null,data.reviewed),'');
 assert.doesNotMatch(visitorCenterHtml(data.records.arch,data.reviewed),/<details>/);
});
test('download is exactly 64 primary suggestions and matches the checked-in artifact',async()=>{
 const csv=visitorCentersCsv(data);assert.equal(csv.trim().split('\r\n').length,65);
 assert.equal(await fs.readFile(new URL('../data/park-visitor-centers.csv',import.meta.url),'utf8'),csv);
 assert.match(csv,/"Google Maps pin"/);assert.match(csv,/"-14\.27441"/);assert.ok(csv.includes('Yosemite Valley Welcome Center'));
});
