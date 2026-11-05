import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mountMapSummary,popupPreferenceError,summaryRecord,validSummaryPhoto,validDraftSummaryPhoto} from '../map-summary.mjs';

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
const draftPhoto={...photo,license:'unverified',licenseUrl:null,reviewStatus:'draft'};
test('draft photos require explicit review marks and never qualify as licensed photos',()=>{
 assert.ok(validDraftSummaryPhoto(draftPhoto));assert.ok(!validSummaryPhoto(draftPhoto));
 for(const replacement of [{reviewStatus:undefined},{license:'public-domain'},{licenseUrl:'https://example.com'},{src:'javascript:alert(1)'},{sourceUrl:'http://example.com'},{credit:''},{alt:''}])assert.ok(!validDraftSummaryPhoto({...draftPhoto,...replacement}));
 assert.equal(summaryRecord({version:1,records:{draft:{photo:draftPhoto}}},'draft').photo,draftPhoto);
 assert.equal(summaryRecord({version:1,records:{draft:{photo:{...draftPhoto,reviewStatus:undefined}}}},'draft').photo,null);
});
test('draft popup labels unresolved rights without fabricating a license link',()=>{
 class Node{constructor(tag,text=''){this.tag=tag;this.children=[];this.text=text;this.dataset={};}append(...nodes){this.children.push(...nodes);}setAttribute(){}set textContent(value){this.text=value;}get textContent(){return this.text+this.children.map(n=>n.textContent).join('');}}
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text)};
 try{
  const box=mountMapSummary({site:{id:'draft',shortName:'Draft site',type:'site'},record:{photo:draftPhoto},selected:false});
  const all=node=>[node,...node.children.flatMap(all)],caption=all(box).find(n=>n.tag==='figcaption');
  assert.match(caption.textContent,/Draft photo — rights unverified/);
  assert.equal(all(caption).filter(n=>n.tag==='a').length,1);
  assert.equal(all(caption).find(n=>n.tag==='a').href,draftPhoto.sourceUrl);
  assert.equal(all(box).find(n=>n.tag==='img').src,draftPhoto.src);
 }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
test('research content file has the runtime schema and each supplied record can be displayed',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../data/map-summaries.json',import.meta.url)));
 assert.equal(data.version,1);assert.equal(typeof data.records,'object');
 for(const [id,record]of Object.entries(data.records)){
  const parsed=summaryRecord(data,id);
  assert.ok(parsed.near,id+' needs a sourced nearby city');assert.ok(parsed.description,id+' needs a sourced description');
  if(record.photo!==null)assert.ok(parsed.photo,id+' needs an attributed licensed photo, explicitly marked draft, or null');
 }
});
