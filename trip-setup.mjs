import {DEFAULT_SETTINGS} from './plan-defaults.mjs';

export const TRIP_EXAMPLES=[
 {id:'blank',name:'Choose my own places',ids:[],start:'current'},
 {id:'utah',name:'Utah canyon parks',ids:['arch','cany','care','brca','zion'],start:'slc'},
 {id:'northwest',name:'Washington mountains & coast',ids:['olym','mora','noca'],start:'seattle'},
 {id:'appalachians',name:'Smokies & Shenandoah',ids:['grsm','shen'],start:'knoxville'},
 {id:'southwest',name:'Long Southwest exploration',ids:['romo','grsa','meve','arch','cany','care','brca','zion','grca','pefo','whsa'],start:'current'}
];
export const START_CITIES=[
 {id:'slc',name:'Salt Lake City',lat:40.7608,lng:-111.8910},
 {id:'seattle',name:'Seattle',lat:47.6062,lng:-122.3321},
 {id:'knoxville',name:'Knoxville',lat:35.9606,lng:-83.9207},
 {id:'denver',name:'Denver',lat:39.7392,lng:-104.9903},
 {id:'vegas',name:'Las Vegas',lat:36.1699,lng:-115.1398},
 {id:'sf',name:'San Francisco',lat:37.7749,lng:-122.4194},
 {id:'la',name:'Los Angeles',lat:34.0522,lng:-118.2437},
 {id:'phoenix',name:'Phoenix',lat:33.4484,lng:-112.074},
 {id:'chicago',name:'Chicago',lat:41.8781,lng:-87.6298},
 {id:'dc',name:'Washington, DC',lat:38.9072,lng:-77.0369},
 {id:'boston',name:'Boston',lat:42.3601,lng:-71.0589},
 {id:'miami',name:'Miami',lat:25.7617,lng:-80.1918}
];
export function localDateToday(now=new Date()){
 return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function createStarterPlan({example='blank',start,startDate,duration=14,stayMode='highlights',objective='season',returnHome=true},availableIds){
 const template=TRIP_EXAMPLES.find(t=>t.id===example);
 if(!template)throw Error('Choose a trip example.');
 const d=new Date(startDate+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==startDate)throw Error('Choose a valid departure date.');
 if(!Number.isInteger(duration)||duration<1||duration>1500)throw Error('Trip length must be 1–1500 whole days.');
 if(!start||typeof start.name!=='string'||!start.name.trim()||start.name.length>100||!Number.isFinite(start.lat)||start.lat<24||start.lat>50||!Number.isFinite(start.lng)||start.lng< -125||start.lng> -66)throw Error('Choose a starting point in the Lower 48.');
 if(!['park','highlights'].includes(stayMode)||!['season','shortest','quiet'].includes(objective))throw Error('Choose a visit style and route priority.');
 const point={id:'start',name:start.name.trim(),lat:start.lat,lng:start.lng};
 const settings={...structuredClone(DEFAULT_SETTINGS),start:point,startDate,duration,stayMode,objective,restDays:0,restAfter:{},arrivalWindows:{},autoMonth:false,endMode:returnHome?'return':'open',end:returnHome?{...point,id:'finish'}:null,endLocation:{...point,id:'finish'}};
 const allowed=new Set(availableIds),selected=template.ids.filter(id=>allowed.has(id));
 if(selected.length!==template.ids.length)throw Error('This example needs updated park data. Choose your own places instead.');
 return {version:1,preferencesRevision:3,selected,days:{},priorities:{},custom:[],rules:{},preparation:{},settings};
}
