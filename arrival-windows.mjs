const DAY=86400000;
export const civilDays=(later,earlier)=>Math.round((Date.parse(later+'T12:00:00Z')-Date.parse(earlier+'T12:00:00Z'))/DAY);
const valid=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function validateArrivalWindows(value={},allowed){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>100)throw Error('Park arrival windows must list park IDs and exact-year dates.');
 const out={};
 for(const [id,w]of Object.entries(value)){
  if(!id||id.length>100||(allowed&&!allowed.has(id))||!w||typeof w!=='object'||Array.isArray(w))throw Error('Arrival windows need recognized national parks.');
  const earliest=w.earliest||null,latest=w.latest||null;
  if((w.earliest!=null&&typeof w.earliest!=='string')||(w.latest!=null&&typeof w.latest!=='string'))throw Error('Arrival dates must be YYYY-MM-DD text or blank.');
  if((earliest&&!valid(earliest))||(latest&&!valid(latest)))throw Error('Use valid YYYY-MM-DD arrival dates, including the travel year.');
  if(earliest&&latest&&earliest>latest)throw Error('Latest first-exploration date must be on or after the earliest date.');
  if(earliest||latest)out[id]={earliest,latest};
 }
 return out;
}
export const arrivalWindow=(settings,id)=>settings.arrivalWindows?.[id]||null;
export function checkArrivalWindow(window,arrival){
 const lateDays=window?.latest?Math.max(0,civilDays(arrival,window.latest)):0,earlyDays=window?.earliest?Math.max(0,civilDays(window.earliest,arrival)):0;
 return {windowConflict:lateDays>0||earlyDays>0,windowLateDays:lateDays,windowEarlyDays:earlyDays};
}
export function arrivalWindowText(window){
 if(!window)return 'Flexible first exploration date';
 if(window.earliest&&window.earliest===window.latest)return 'First exploration date: '+window.earliest;
 return 'First exploration: '+(window.earliest?'on/after '+window.earliest:'any earliest date')+(window.latest?' · on/before '+window.latest:'');
}
export const arrivalConflictCost=(count,lateDays)=>count*1e9+lateDays*1e6;
export function constrainedVisits(result){return (result?.visits||[]).flatMap(v=>v.excursion?(result.excursions?.find(b=>b.id===v.id)?.visits||[]):[v]).filter(v=>v.dateWindow);}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function arrivalReviewHtml(result,sites,{interactive=true}={}){
 const visits=constrainedVisits(result);if(!visits.length)return '';
 const lookup=new Map(sites.map(s=>[s.id,s])),conflicts=visits.filter(v=>v.windowConflict).length;
 return `<details class="arrival-review ${conflicts?'warning':''}"><summary>Park arrival dates · ${visits.length} window${visits.length===1?'':'s'}${conflicts?' · '+conflicts+' conflict'+(conflicts===1?'':'s'):''}</summary>${visits.map(v=>`<p class="${v.windowConflict?'arrival-conflict':''}">${interactive?`<button type="button" class="text-button" data-route-detail="${esc(v.id)}">${esc(lookup.get(v.id)?.shortName||v.id)}</button>`:`<strong>${esc(lookup.get(v.id)?.shortName||v.id)}</strong>`} · ${esc(arrivalWindowText(v.dateWindow))}<br>Calculated first exploration: ${esc(v.arrival)} · <strong>${v.windowConflict?'MISSED by '+esc(v.windowLateDays)+' day(s)':'Within requested dates'}</strong></p>`).join('')}<p class="fineprint">These constraints apply to the first exploration date, including shared arrival-day sightseeing. Full stays are retained. Dates, park access and transport still need verification; no booking is implied.</p></details>`;
}
