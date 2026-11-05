import {dateOf,addDays,iso} from './optimizer.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const miles=n=>Math.round(n).toLocaleString();
const nice=s=>dateOf(s).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
const plural=(n,word)=>n+' '+word+(n===1?'':'s');

export function driveThrough(leg){
 return iso(addDays(dateOf(leg.depart),Math.max(0,leg.days-1)));
}
export function driveDetailsHtml(leg,settings,visit=null){
 const first=leg.dailyActivities?.[0];
 return `<details class="visit-day-details"><summary>Day details</summary><p>${plural(leg.days,'driving day')}${leg.days?` · ~${leg.dailyHours.toFixed(1)} h driving/day`:''}.<br>~${leg.elapsedHours.toFixed(1)} h including ${settings.breakPercent}% for breaks${leg.days?` · ~${(leg.elapsedHours/leg.days).toFixed(1)} h/day elapsed`:''}.</p>${first?.departureExplorationHours?`<p>First road date: ${nice(first.date)} · ${first.departureExplorationHours} h morning exploration, then ${first.driveHours.toFixed(1)} h driving${leg.days>1?`; driving continues over ${plural(leg.days-1,'later day')}`:''}.</p>`:''}${visit?`<p>${visit.sharedDays?`Arrival exploration: ${visit.sharedDays} day equivalent.<br>`:''}${visit.departureSharedDays?`Departure-morning exploration: ${visit.departureSharedDays} day equivalent.<br>`:''}${visit.excursion?'':`Personal priority: ${visit.priority}/5.`}</p>`:''}</details>`;
}
export function visitCardHtml({visit:v,site:s,leg,label,settings}){
 const through=iso(addDays(dateOf(v.departure),-1));
 return `<article class="visit-card"><span class="visit-num ${label.length>2?'is-range':''}">${esc(label)}</span><h3><button class="text-button" data-route-detail="${esc(s.id)}">${esc(s.shortName)}</button></h3><p class="visit-dates">${nice(v.arrival)}${through===v.arrival?'':'–'+nice(through)}, ${v.arrival.slice(0,4)}</p>${v.fixedDate?`<p class="${v.lateDays?'warning':'date-window-note'}">First full day: ${esc(v.fixedDate)}${v.lateDays?' · '+v.lateDays+' days late':''}</p>`:''}<p><strong>${plural(v.days,'exploration day')}</strong>${v.transferDays?`<br>+ ${plural(v.transferDays,'transfer day')}`:''}${v.restAfterDays?`<br>+ ${plural(v.restAfterDays,'rest day')}`:''}</p><p>Getting here: ~${miles(leg.miles)} mi · ${leg.hours.toFixed(1)} h driving</p><span class="status-label ${esc(v.status)}">${v.quality===null?'No seasonal score':v.quality.toFixed(1)+'/10 quality'}</span>${driveDetailsHtml(leg,settings,v)}</article>`;
}
export function finishCardHtml({leg,settings,restDays=0}){
 return `<article class="visit-card finish-card"><span class="visit-num">⌂</span><h3>${settings.endMode==='return'?'Return home':'Finish'} · ${esc(settings.end.name)}</h3><p class="visit-dates">Arrival: ${nice(driveThrough(leg))}, ${driveThrough(leg).slice(0,4)}</p><p>~${miles(leg.miles)} mi · ${leg.hours.toFixed(1)} h driving</p>${restDays?`<p>Before ${plural(restDays,'unplaced reserve day')}.</p>`:''}<span class="status-label">Included in totals</span>${driveDetailsHtml(leg,settings)}</article>`;
}
