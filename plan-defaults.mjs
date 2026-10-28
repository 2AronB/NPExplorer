import {REMOTE_DEFAULTS} from './remote-parks.mjs';
export const DEFAULT_SETTINGS={...REMOTE_DEFAULTS,startDate:'2040-04-01',duration:365,autoMonth:false,objective:'season',seasonDetourPercent:15,pace:'balanced',comfort:4,stretch:7,maxDrive:10,averageMph:60.6,distanceFactor:1.246,breakPercent:10,sharedDays:true,dayBudget:10,explorationHours:8,setupHours:.75,teardownHours:.75,stayMode:'park',defaultDays:3,restDays:24,detourHours:1,start:{id:'start',name:'Colorado Springs',lat:38.8339,lng:-104.8214},endMode:'return',end:{id:'finish',name:'Colorado Springs',lat:38.8339,lng:-104.8214},endLocation:{name:'Finish',lat:38.8339,lng:-104.8214}};

export function upgradePlanPreferences(raw){
 if(!raw||raw.version!==1)return raw;
 const next={...raw,settings:{...DEFAULT_SETTINGS,...raw.settings},preferencesRevision:3};
 // The first prototype defaulted to an open finish and uniform three-day stays.
 // Move untouched legacy defaults once; retain individual day edits and custom endpoints.
 if((raw.preferencesRevision||0)<2){
  if(next.settings.endMode==='open')next.settings.endMode='return';
  next.settings.stayMode='park';
 }
 if((raw.preferencesRevision||0)<3){
  if(next.settings.averageMph===48)next.settings.averageMph=DEFAULT_SETTINGS.averageMph;
  if(next.settings.distanceFactor===1.28)next.settings.distanceFactor=DEFAULT_SETTINGS.distanceFactor;
  next.settings.breakPercent=10;
 }
 return next;
}

