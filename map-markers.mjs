import {haversine} from './optimizer.mjs';
export const MARKER_TYPES=[
 {id:'park',label:'National parks',shape:'circle'},
 {id:'monument',label:'Monuments',shape:'triangle'},
 {id:'historic',label:'Historic sites / parks',shape:'square'},
 {id:'memorial',label:'Memorials / battlefields',shape:'star'},
 {id:'water',label:'Recreation / rivers / coasts',shape:'diamond'},
 {id:'trail',label:'Trails / parkways',shape:'hexagon'},
 {id:'other',label:'Preserves / other sites',shape:'pentagon'},
 {id:'custom',label:'Personal stops',shape:'heart'}
];
export function markerType(site){
 if(site.type==='custom')return MARKER_TYPES[7];
 if(site.type==='park')return MARKER_TYPES[0];
 const d=site.designation||'';
 if(/Monument/i.test(d))return MARKER_TYPES[1];
 if(/Memorial|Battlefield|Military Park/i.test(d))return MARKER_TYPES[3];
 if(/Historic/i.test(d))return MARKER_TYPES[2];
 if(/Recreation|River|Seashore|Lakeshore/i.test(d))return MARKER_TYPES[4];
 if(/Trail|Parkway/i.test(d))return MARKER_TYPES[5];
 return MARKER_TYPES[6];
}
const paths={
 circle:'M16 3a13 13 0 1 0 0 26a13 13 0 1 0 0-26',
 triangle:'M16 2 30 28H2Z',square:'M4 4H28V28H4Z',
 star:'M16 1 20.5 10.8 31 12 23 19 25.5 30 16 24.5 6.5 30 9 19 1 12 11.5 10.8Z',
 diamond:'M16 1 31 16 16 31 1 16Z',
 hexagon:'M9 3H23L31 16 23 29H9L1 16Z',
 pentagon:'M16 1 31 12 25 30H7L1 12Z',
 heart:'M16 29 3.5 16.5C-4 7 8-1 16 8C24-1 36 7 28.5 16.5Z'
};
let stripeSequence=0;
export function shapeSvg(shape,fill,selected=false,striped=false){
 const path=paths[shape]||paths.pentagon;
 if(striped){const id='restricted-'+(++stripeSequence);return `<svg viewBox="-2 -2 36 36" aria-hidden="true" focusable="false"><defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><rect width="8" height="8" fill="#8a9095"/><rect width="4" height="8" fill="#b94d45"/></pattern></defs><path d="${path}" fill="url(#${id})" stroke="#fffef9" stroke-width="${selected?5:3}"/><path d="${path}" fill="url(#${id})" stroke="#294538" stroke-width="${selected?1.8:1.3}"/></svg>`;}
 return `<svg viewBox="-2 -2 36 36" aria-hidden="true" focusable="false"><path d="${path}" fill="${fill}" stroke="#fffef9" stroke-width="${selected?5:3}" stroke-linejoin="round"/><path d="${path}" fill="${fill}" stroke="#294538" stroke-width="${selected?1.8:1.3}" stroke-linejoin="round"/></svg>`;
}
export const markerSize=(site,selected)=>selected?(site.type==='park'?27:24):(site.type==='park'?15:13);
export const visibleSite=(site,types)=>types.has(markerType(site).id);
// Count actual selected destinations, expanding each regional excursion in its
// scheduled park order. Airport anchors and transfers are not extra park stops.
export function visitNumbers(result){
 const numbers=new Map();let next=1;
 for(const visit of result?.visits||[]){
  if(visit.excursion){const block=result.excursions?.find(b=>b.id===visit.id);for(const park of block?.visits||[])numbers.set(park.id,next++);}
  else numbers.set(visit.id,next++);
 }
 return numbers;
}
export function visitNumberLabel(result,id,numbers=visitNumbers(result)){
 if(numbers.has(id))return String(numbers.get(id));
 const visits=result?.excursions?.find(b=>b.id===id)?.visits||[],first=numbers.get(visits[0]?.id),last=numbers.get(visits.at(-1)?.id);
 return first===undefined?'':first===last?String(first):`${first}–${last}`;
}
export function circleCandidates(sites,center,radiusMiles,scope='parks'){
 return sites.filter(site=>(scope==='all'||scope==='nps'&&site.type!=='custom'||scope==='parks'&&site.type==='park')&&haversine(center,site)<=radiusMiles+1e-8);
}
