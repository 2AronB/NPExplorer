import test from 'node:test';
import assert from 'node:assert/strict';
import {driveThrough,driveDetailsHtml,visitCardHtml,finishCardHtml} from '../route-cards.mjs';
import {schedule} from '../optimizer.mjs';
import {exportTables} from '../trip-export.mjs';
import {DEFAULT_SETTINGS} from '../plan-defaults.mjs';
const settings={...structuredClone(DEFAULT_SETTINGS),restDays:3};
const leg={depart:'2028-02-28',days:2,miles:100,hours:2,dailyHours:1,elapsedHours:2.2,dailyActivities:[{date:'2028-02-28',departureExplorationHours:2,driveHours:1}]};
const visit={arrival:'2028-02-28',departure:'2028-03-01',days:1,priority:4,quality:8,status:'ideal',sharedDays:.25,departureSharedDays:.25};

test('return-home arrival is the occupied last road date, including leap and zero-day legs',()=>{
 assert.equal(driveThrough(leg),'2028-02-29');
 assert.equal(driveThrough({...leg,days:0}),'2028-02-28');
 assert.equal(driveThrough({...leg,days:1}),'2028-02-28');
 const html=finishCardHtml({leg,settings,restDays:3});
 assert.match(html,/Arrival: Feb 29, 2028/);assert.doesNotMatch(html,/Arrival: Mar 1/);
 assert.match(html,/3 unplaced reserve days/);assert.match(html,/Included in totals/);
});

test('compact cards retain shared exploration, priority and break accounting inside day details',()=>{
 const site={id:'a',shortName:'<A & B>'},before=structuredClone({visit,leg,settings});
 const html=visitCardHtml({visit,leg,settings,site,label:'1'}),[visible,details]=html.split('<details');
 assert.match(visible,/1 exploration day/);assert.match(visible,/2\.0 h driving/);assert.match(visible,/&lt;A &amp; B&gt;/);
 assert.doesNotMatch(visible,/priority|day equivalent|elapsed/);
 assert.match(details,/Personal priority: 4\/5/);assert.match(details,/Arrival exploration: 0.25 day equivalent/);
 assert.match(details,/Departure-morning exploration: 0.25 day equivalent/);assert.match(details,/2\.2 h including 10% for breaks/);
 assert.deepEqual({visit,leg,settings},before);
 const late=visitCardHtml({visit:{...visit,fixedDate:'2028-02-20',lateDays:8},site,leg,label:'1',settings});
 assert.match(late.split('<details')[0],/class="warning".*8 days late/);
 assert.match(driveDetailsHtml(leg,settings),/2 h morning exploration/);
});

test('return-home card agrees with the real schedule road allocation before the rest reserve',()=>{
 const stop={id:'test',shortName:'Test',type:'park',lat:39,lng:-105,days:2,priority:3,profile:{scores:Array(12).fill(8),quiet:[]}};
 const result=schedule([stop],settings),home=result.legs.find(l=>l.to==='finish');
 const report=exportTables({state:{settings,selected:[stop.id]},sites:[stop],result}).travelDocument;
 const road=report.events.find(e=>e.event==='Return / finish drive');
 assert.ok(home);assert.ok(road);assert.equal(driveThrough(home),road.through);
 assert.ok(driveThrough(home)<result.endDate);
 assert.match(finishCardHtml({leg:home,settings,restDays:result.unplacedRestDays}),/unplaced reserve days/);
});
