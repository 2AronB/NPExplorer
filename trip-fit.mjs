import {addDays,dateOf,iso} from './optimizer.mjs';

// Report the displayed schedule. Never trim visits or claim that dropping an
// allowance saves the same number of calendar days in a shared-day schedule.
export function tripFit({result,settings,sites,selected}){
 if(!result)return null;
 const difference=result.totalDays-settings.duration,selectedIds=new Set(selected);
 const visits=sites.filter(s=>selectedIds.has(s.id)).map(s=>({id:s.id,name:s.shortName||s.name,days:s.days,priority:s.priority??1,fixed:!!s.fixedDate||!!settings.arrivalWindows?.[s.id]})).sort((a,b)=>b.days-a.days||a.name.localeCompare(b.name));
 return {allocated:result.totalDays,target:settings.duration,overDays:Math.max(0,difference),spareDays:Math.max(0,-difference),availableThrough:iso(addDays(dateOf(result.startDate),settings.duration-1)),allocatedThrough:iso(addDays(dateOf(result.endDate),-1)),restDays:result.restDays||0,waitDays:result.waitDays||0,visits};
}
export function tripFitHtml(fit){
 if(!fit)return '';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<section class="trip-fit" aria-label="Trip length review"><h3>${fit.overDays?`${fit.overDays} days beyond your available time`:`${fit.spareDays} unassigned days within your target`}</h3><p>${fit.allocated} allocated days / ${fit.target}-day target. Available through <strong>${esc(fit.availableThrough)}</strong>; the last allocated day is <strong>${esc(fit.allocatedThrough)}</strong>. ${fit.overDays?'Every requested visit is still included.':'Unassigned time is not a reservation, scheduled rest or proof of access.'}</p><details><summary>Review visit allowances & ways to adjust</summary><p>Save this trip in Compare before trying alternatives. You can change your target, rest reserve, visit lengths or selected places. Recalculate to compare the actual calendar impact; sharing, waits and transport mean a one-day edit need not save one calendar day.</p><p>Current schedule: ${fit.restDays} reserved rest days and ${fit.waitDays} closure / transport-window wait days. Review constrained dates and access warnings as well as trip length.</p><ul>${fit.visits.map(v=>`<li><button type="button" class="text-button" data-route-detail="${esc(v.id)}">${esc(v.name)}</button> · ${v.days} exploration day equivalents · priority ${v.priority}/5${v.fixed?' · date constraint':''}</li>`).join('')}</ul><div class="resume-actions"><button type="button" data-open-compare>Save an alternative</button><button type="button" data-edit-trip>Review trip settings</button><button type="button" data-review-selected>Review selected places</button></div></details></section>`;
}
