import test from 'node:test';import assert from 'node:assert/strict';
import {tripFit,tripFitHtml} from '../trip-fit.mjs';
const settings={duration:7,arrivalWindows:{one:{earliest:'2027-01-01'}}},result={startDate:'2027-01-01',endDate:'2027-01-11',totalDays:10,restDays:2,waitDays:1},sites=[{id:'one',shortName:'<A>',days:2,priority:3},{id:'two',shortName:'B',days:4,priority:1},{id:'hidden',shortName:'Hidden',days:10}];
test('length review reports inclusive last days from end-exclusive schedule and retains all inputs',()=>{
 const before=JSON.stringify({settings,result,sites}),fit=tripFit({settings,result,sites,selected:['one','two']});
 assert.equal(fit.overDays,3);assert.equal(fit.availableThrough,'2027-01-07');assert.equal(fit.allocatedThrough,'2027-01-10');
 assert.deepEqual(fit.visits.map(v=>v.id),['two','one']);assert.equal(fit.visits[1].fixed,true);assert.equal(fit.restDays,2);
 assert.equal(JSON.stringify({settings,result,sites}),before);const html=tripFitHtml(fit);assert.ok(html.includes('&lt;A&gt;'));assert.ok(!html.includes('Hidden'));assert.ok(html.includes('need not save one calendar day'));
});
test('under-target time stays unassigned and leap-day boundaries are correct',()=>{
 const fit=tripFit({settings:{duration:4},result:{startDate:'2028-02-28',endDate:'2028-03-01',totalDays:2},sites:[],selected:[]});
 assert.equal(fit.spareDays,2);assert.equal(fit.overDays,0);assert.equal(fit.allocatedThrough,'2028-02-29');assert.equal(fit.availableThrough,'2028-03-02');
 assert.match(tripFitHtml(fit),/Unassigned time/);assert.equal(tripFit({result:null}),null);
});
