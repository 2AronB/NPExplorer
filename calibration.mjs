export const CALIBRATION_ROUTES=[
 {id:'deva-drto',from:'deva',to:'drto',name:'Death Valley → Key West',note:'Dry Tortugas mainland gateway; supplied Maps result: 2,785 miles / 43 driving hours.'},
 {id:'voya-acad',from:'voya',to:'acad',name:'Voyageurs → Acadia',note:'Canadian route is acceptable.'},
 {id:'cos-blca',from:'cos',to:'blca',name:'Colorado Springs → Black Canyon',note:'Mixed highway and mountain approach.'},
 {id:'badl-thro',from:'badl',to:'thro',name:'Badlands → Theodore Roosevelt',note:'Northern Plains comparison; contrasts with the mountain approaches.'},
 {id:'shen-grsm',from:'shen',to:'grsm',name:'Shenandoah → Great Smoky Mountains',note:'Appalachian regional comparison.'},
 {id:'ever-bisc',from:'ever',to:'bisc',name:'Everglades → Biscayne',note:'Short South Florida comparison; park pins are approximate.'},
 {id:'olym-mora',from:'olym',to:'mora',name:'Olympic → Mount Rainier',note:'Pacific Northwest comparison; inspect the road/ferry choice in Maps.'},
 {id:'blca-arch',from:'blca',to:'arch',name:'Black Canyon → Arches',note:'Earlier sample retained because you entered values.',legacy:true},
 {id:'arch-cany',from:'arch',to:'cany',name:'Arches → Canyonlands',note:'Earlier sample retained because you entered values.',legacy:true},
 {id:'cany-care',from:'cany',to:'care',name:'Canyonlands → Capitol Reef',note:'Earlier sample retained because you entered values.',legacy:true}
];
export const INITIAL_CALIBRATION={'deva-drto':{miles:2785,hours:43},'voya-acad':{miles:1499,hours:27}};
export function parseDrivingHours(value){
 const s=String(value??'').trim();if(!s)return null;
 if(/^\d{1,3}:[0-5]\d$/.test(s)){const [h,m]=s.split(':').map(Number);return h+m/60;}
 return /^\d+(?:\.\d+)?$/.test(s)?Number(s):NaN;
}
function median(values){const a=[...values].sort((a,b)=>a-b),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
export function fitCalibration(samples){
 const entered=samples.filter(s=>s.include!==false&&Number.isFinite(s.miles)&&s.miles>0&&Number.isFinite(s.hours)&&s.hours>.25&&Number.isFinite(s.airMiles)&&s.airMiles>0);
 const complete=entered.filter(s=>s.miles>=s.airMiles*.98);
 if(!complete.length)return {count:0,skipped:entered.length};
 const distanceFactor=median(complete.map(s=>s.miles/s.airMiles));
 const averageMph=median(complete.map(s=>s.miles/(s.hours-.25)));
 const valid=distanceFactor>=1&&distanceFactor<=3&&averageMph>=15&&averageMph<=75;
 return {count:complete.length,skipped:entered.length-complete.length,distanceFactor,averageMph,valid};
}
