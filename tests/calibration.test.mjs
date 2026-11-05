import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDrivingHours,fitCalibration,INITIAL_CALIBRATION} from '../calibration.mjs';
import {DEFAULT_SETTINGS,upgradePlanPreferences} from '../plan-defaults.mjs';
import fs from 'node:fs/promises';
import vm from 'node:vm';
test('driving time accepts decimal hours and hour-minute notation',()=>{
 assert.equal(parseDrivingHours('43:00'),43);assert.equal(parseDrivingHours('5:30'),5.5);assert.equal(parseDrivingHours('5.5'),5.5);assert.equal(parseDrivingHours(''),null);
 for(const value of ['5:99','hello','-3','2:3','1:30:00'])assert.ok(Number.isNaN(parseDrivingHours(value)));
});
test('median fit separates mileage factor from driving speed and rejects incomplete samples',()=>{
 const fit=fitCalibration([{airMiles:100,miles:125,hours:2.75},{airMiles:200,miles:250,hours:4.25},{airMiles:1000,miles:null,hours:10}]);
 assert.equal(fit.count,2);assert.equal(fit.distanceFactor,1.25);assert.equal(fit.averageMph,(50+62.5)/2);assert.equal(fit.valid,true);
});
test('supplied Maps references are saved as driving-only values',()=>{
 assert.deepEqual(INITIAL_CALIBRATION['deva-drto'],{miles:2785,hours:43});assert.deepEqual(INITIAL_CALIBRATION['voya-acad'],{miles:1499,hours:27});assert.equal(DEFAULT_SETTINGS.breakPercent,10);
});
test('legacy defaults adopt calibration once while deliberate speed settings persist',()=>{
 const old={version:1,preferencesRevision:2,settings:{...DEFAULT_SETTINGS,averageMph:48,distanceFactor:1.28}};
 const next=upgradePlanPreferences(old);assert.equal(next.settings.averageMph,60.6);assert.equal(next.settings.distanceFactor,1.246);
 assert.equal(upgradePlanPreferences({...old,settings:{...old.settings,averageMph:55}}).settings.averageMph,55);
 assert.equal(upgradePlanPreferences({...next,settings:{...next.settings,averageMph:48}}).settings.averageMph,48);
});
test('excluded and geographically inconsistent samples remain out of the fit',()=>{
 const fit=fitCalibration([{airMiles:100,miles:125,hours:2.75},{airMiles:100,miles:150,hours:2.75,include:false},{airMiles:100,miles:70,hours:1}]);
 assert.equal(fit.count,1);assert.equal(fit.skipped,1);assert.equal(fit.distanceFactor,1.25);
});

test('settings form edits speed while retaining hidden calibration and detour values',async()=>{
 const [app,html]=await Promise.all(['app.mjs','index.html'].map(file=>fs.readFile(new URL('../'+file,import.meta.url),'utf8')));
 for(const id of ['distanceFactor','detourHours','calibrationRows','applyCalibration','openCalibration']){
  assert.ok(!html.includes('id="'+id+'"'),id+' is not a public control');
  assert.ok(!app.includes("$('"+id+"')"),id+' has no live DOM handler');
 }
 const controls=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{value:'',checked:false,hidden:false,required:false}]));
 const state={settings:{...structuredClone(DEFAULT_SETTINGS),distanceFactor:1.777,detourHours:2.5},calibration:{'deva-drto':{miles:2785,hours:43,include:false}}};
 const messages=[],context=vm.createContext({state,structuredClone,$:id=>{assert.ok(controls.has(id),'Missing form element: '+id);return controls.get(id);},validate:next=>next,changed(){},rebuild(){},renderAll(){},toast:message=>messages.push(message)});
 const fill=app.slice(app.indexOf('function fillSettings()'),app.indexOf("$('objective').onchange"));
 const required=app.slice(app.indexOf('function endRequired()'),app.indexOf("$('endMode').onchange"));
 vm.runInContext(fill+'\n'+required+'\nfillSettings();',context);
 controls.get('averageMph').value='52';
 const start=app.indexOf("$('settingsForm').onsubmit=")+"$('settingsForm').onsubmit=".length;
 const handler=app.slice(start,app.indexOf("\n$('customForm').onsubmit",start)).trim().replace(/;$/,'');
 const before=structuredClone(state);
 vm.runInContext('('+handler+')',context)({preventDefault(){}});
 assert.equal(context.state.settings.averageMph,52);
 assert.equal(context.state.settings.distanceFactor,1.777);
 assert.equal(context.state.settings.detourHours,2.5);
 assert.deepEqual(context.state.calibration,before.calibration);
 assert.match(messages.at(-1),/Trip settings saved/);
});

test('direct backup recovery remains visible when saves fail or another tab changes the plan',async()=>{
 const app=await fs.readFile(new URL('../app.mjs',import.meta.url),'utf8');
 const controls=Object.fromEntries(['saveStatus','loadLatest','saveBackup'].map(id=>[id,{dataset:{},hidden:true,textContent:''}]));
 const context=vm.createContext({$:id=>controls[id]});
 const fn=app.slice(app.indexOf('function showSaveStatus('),app.indexOf('function save(){'));
 vm.runInContext(fn+'\nshowSaveStatus',context)({kind:'error'});
 assert.equal(controls.saveBackup.hidden,false);
 assert.equal(controls.loadLatest.hidden,true);
 vm.runInContext('showSaveStatus',context)({kind:'conflict'});
 assert.equal(controls.saveBackup.hidden,false);
 assert.equal(controls.loadLatest.hidden,false);
 vm.runInContext('showSaveStatus',context)({kind:'saved',at:new Date()});
 assert.equal(controls.saveBackup.hidden,true);
 assert.equal(controls.loadLatest.hidden,true);
});
