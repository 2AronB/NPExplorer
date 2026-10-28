import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDrivingHours,fitCalibration,INITIAL_CALIBRATION} from '../calibration.mjs';
import {DEFAULT_SETTINGS,upgradePlanPreferences} from '../plan-defaults.mjs';
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
