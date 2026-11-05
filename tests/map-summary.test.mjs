import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {popupPreferenceError,summaryRecord,validSummaryPhoto} from '../map-summary.mjs';

test('popup preferences enforce the optimizer duration and priority rules',()=>{
 assert.equal(popupPreferenceError({type:'park'},'days',3),'');
 assert.match(popupPreferenceError({type:'park'},'days',1.5),/whole/);
 assert.equal(popupPreferenceError({type:'site'},'days',.25),'');
 assert.ok(popupPreferenceError({type:'site'},'days',.3));
 for(const n of [NaN,0,366,Infinity])assert.ok(popupPreferenceError({type:'park'},'days',n));
 for(const n of [NaN,0,6,2.5])assert.ok(popupPreferenceError({type:'park'},'priority',n));
 assert.equal(popupPreferenceError({type:'park'},'priority',5),'');
});
const photo={src:'https://www.nps.gov/example.jpg',sourceUrl:'https://www.nps.gov/example',license:'public-domain',licenseUrl:'https://www.nps.gov/example-rights',credit:'NPS / Photographer',alt:'Sandstone arch in a desert landscape'};
test('popup content only exposes attributed photos with explicit supported rights and source URLs',()=>{
 assert.ok(validSummaryPhoto(photo));
 for(const replacement of [{license:'unknown'},{licenseUrl:''},{credit:''},{alt:''},{src:'javascript:alert(1)'},{sourceUrl:'http://example.com'}])assert.ok(!validSummaryPhoto({...photo,...replacement}));
 const record={near:{city:'Moab',state:'UT',sourceUrl:'https://www.nps.gov/arch'},description:'A concise park description.',descriptionSourceUrl:'https://www.nps.gov/arch',photo};
 assert.deepEqual(summaryRecord({version:1,records:{arch:record}},'arch'),{near:record.near,description:record.description,photo});
 assert.equal(summaryRecord({version:1,records:{arch:{...record,photo:{...photo,credit:''},near:{city:'Unverified'},descriptionSourceUrl:''}}},'arch').description,null);
 assert.equal(summaryRecord(null,'arch'),null);assert.equal(summaryRecord({version:2,records:{arch:record}},'arch'),null);
});
test('research content file has the runtime schema and each supplied record can be displayed',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../data/map-summaries.json',import.meta.url)));
 assert.equal(data.version,1);assert.equal(typeof data.records,'object');
 for(const [id,record]of Object.entries(data.records)){
  const parsed=summaryRecord(data,id);
  assert.ok(parsed.near,id+' needs a sourced nearby city');assert.ok(parsed.description,id+' needs a sourced description');
  if(record.photo!==null)assert.ok(parsed.photo,id+' needs a fully attributed photo, or null');
 }
});
