import {arrivalWindowText} from './arrival-windows.mjs';
import {restSummary} from './rest-days.mjs';
import {accessWarningsHtml} from './access-review.mjs';
import {exportTables} from './trip-export.mjs';
const DAY=86400000;
const date=s=>new Date(s+'T00:00:00Z');
const shift=(s,n)=>new Date(date(s).getTime()+n*DAY).toISOString().slice(0,10);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const human=(s,options={month:'long',day:'numeric',year:'numeric'})=>date(s).toLocaleDateString('en-US',{...options,timeZone:'UTC'});
const number=n=>Math.round(n*10)/10;
export const CALENDAR_TYPES={park:'Exploration only',personal:'Personal visit',mixed:'Drive + explore',drive:'Driving',transfer:'Flight / transfer',wait:'Waiting',buffer:'Contingency',rest:'Rest',unassigned:'Unallocated'};
function typeOf(e,lookup){
 if(e.event==='Park / destination stay')return lookup.get(e.siteId)?.type==='custom'?'personal':'park';
 if(/drive/i.test(e.event))return 'drive';
 if(/wait/i.test(e.event))return 'wait';
 if(e.event==='Rest-day reserve'||e.event==='Placed rest')return 'rest';
 if(/buffer|rounding/i.test(e.event))return 'buffer';
 return 'transfer';
}

// Use the report ledger for allocations. Shared exploration is an activity on
// an existing drive date, never another calendar allocation.
export function buildCalendarModel({state,sites,result,accessReview,reportContext}){
 if(!result)return null;
 const {events}=exportTables({state,sites,result,reportContext}).travelDocument;
 const lookup=new Map(sites.map(s=>[s.id,s])),byDate=new Map(),months=new Map();
 for(let d=result.startDate;d<result.endDate;d=shift(d,1)){
  const day={date:d,events:[],kind:'unassigned',accessWarnings:accessReview?.visits.flatMap(v=>v.warnings.filter(w=>w.affectedDates.includes(d)).map(w=>({siteId:v.siteId,...w})))||[]};byDate.set(d,day);
  const key=d.slice(0,7);if(!months.has(key))months.set(key,{key,label:human(key+'-01',{month:'long',year:'numeric'}),days:[]});
  months.get(key).days.push(day);
 }
 events.forEach((e,index)=>{
  const event={...e,shortPlace:lookup.get(e.siteId)?.shortName||e.place,key:'event-'+index,kind:typeOf(e,lookup)};
  for(let d=e.start;d&&d<e.end;d=shift(d,1))if(byDate.has(d))byDate.get(d).events.push(event);
  if(e.event==='Park / destination stay')for(const [when,credit,label]of [[e.sharedArrivalDate,e.sharedDays,'Arrival-day exploration'],[e.departureDriveDate,e.departureSharedDays,'Departure-morning exploration']]){
   if(credit&&byDate.has(when))byDate.get(when).events.push({...event,key:event.key+'-'+label,start:when,end:shift(when,1),days:0,parkDays:credit,shared:true,event:label,notes:[`${credit} exploration day equivalent on a driving day. Included in the requested stay; no extra calendar day.`,e.siteVisitNote].filter(Boolean).join(' ')});
  }
 });
 const counts={};
 for(const day of byDate.values()){
  const kinds=new Set(day.events.map(e=>e.kind));
  day.kind=kinds.has('drive')&&(kinds.has('park')||kinds.has('personal'))?'mixed':['wait','transfer','drive','personal','park','buffer','rest'].find(k=>kinds.has(k))||'unassigned';
  day.events.sort((a,b)=>Number(!a.shared)-Number(!b.shared));
  const siteConcerns=new Map(day.events.filter(e=>e.siteVisitConcern).map(e=>[e.siteId,e.siteVisitConcern]));
  day.accessWarnings.push(...siteConcerns.values());
  day.dateConflicts=[...new Set(day.events.filter(e=>e.windowConflict&&['park','personal'].includes(e.kind)).map(e=>e.siteId))];
  counts[day.kind]=(counts[day.kind]||0)+1;
 }
 return {days:[...byDate.values()],byDate,months:[...months.values()],counts,result,accessReview};
}

export function calendarNavigationDate(model,current,key){
 if(!model?.byDate.has(current))return null;
 const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
 let target;
 if(key in offsets)target=shift(current,offsets[key]);
 else if(key==='Home'||key==='End'){const weekday=date(current).getUTCDay();target=shift(current,key==='Home'?-weekday:6-weekday);}
 else if(key==='PageUp'||key==='PageDown'){
  const d=date(current),month=d.getUTCMonth()+(key==='PageUp'?-1:1),last=new Date(Date.UTC(d.getUTCFullYear(),month+1,0)).getUTCDate();
  target=new Date(Date.UTC(d.getUTCFullYear(),month,Math.min(d.getUTCDate(),last))).toISOString().slice(0,10);
 }else return null;
 return target<model.days[0].date?model.days[0].date:target>model.days.at(-1).date?model.days.at(-1).date:target;
}
export function nextAccessWarningDate(model,current){
 const signature=day=>(day?.accessWarnings||[]).map(w=>w.siteId+'|'+w.kind+'|'+w.message).sort().join(';;');
 const starts=model?.days.filter((day,i)=>day.accessWarnings.length&&(!i||signature(day)!==signature(model.days[i-1])))||[];
 return (starts.find(day=>day.date>current)||starts[0])?.date||null;
}

export function nextDateConflictDate(model,current){return nextAccessWarningDate({days:(model?.days||[]).map(day=>({date:day.date,accessWarnings:(day.dateConflicts||[]).map(siteId=>({siteId,kind:'date-window',message:''}))}))},current);}

export function nextWaitingPeriodDate(model,current){
 const starts=(model?.days||[]).filter(day=>day.events.some(e=>e.kind==='wait'&&e.start===day.date));
 return (starts.find(day=>day.date>current)||starts[0])?.date||null;
}

export function mountCalendar(root,{onExplore,onCalculate,onPlace,idPrefix='calendar'}){
 let model=null,monthKey=null,selectedDate=null,pending=false,overviewOpen=true;
 const button=day=>{
  const places=[...new Set(day.events.filter(e=>['park','personal'].includes(e.kind)).map(e=>e.shortPlace))];
  const label=places[0]||day.events[0]?.place||CALENDAR_TYPES[day.kind];
  return `<button type="button" class="calendar-day cal-${day.kind}${day.date===selectedDate?' is-selected':''}${day.accessWarnings.length?' has-access-warning':''}${day.dateConflicts.length?' has-date-conflict':''}" data-calendar-day="${day.date}" tabindex="${day.date===selectedDate?'0':'-1'}" aria-pressed="${day.date===selectedDate}" aria-label="${esc(human(day.date)+': '+CALENDAR_TYPES[day.kind]+' · '+label+(day.accessWarnings.length?' · access needs review':'')+(day.dateConflicts.length?' · park arrival-date conflict':''))}"><span class="calendar-date">${Number(day.date.slice(8))}${day.accessWarnings.length||day.dateConflicts.length?' <span aria-hidden="true">⚠</span>':''}</span><span class="calendar-day-label">${esc(label)}</span>${places.length>1?`<small>+${places.length-1} destination${places.length>2?'s':''}</small>`:`<small>${CALENDAR_TYPES[day.kind]}</small>`}</button>`;
 };
 function detail(day){
  const cards=day.events.map(e=>{
   const roadDay=e.dailyActivities?.find(a=>a.date===day.date);
   const facts=[];
   if(roadDay){facts.push(`${number(roadDay.driveHours)} h driving`,`${number(roadDay.breakHours)} h breaks`,`${number(roadDay.campHours)} h camp`);if(roadDay.departureExplorationHours+roadDay.arrivalExplorationHours)facts.push(`${number(roadDay.departureExplorationHours+roadDay.arrivalExplorationHours)} h exploration`);}
   else if(e.kind==='drive'||e.kind==='transfer'){
    if(e.hours)facts.push(`~${number(e.hours)} h driving across this leg`);
    if(e.otherHours)facts.push(`~${number(e.otherHours)} h transport across this leg`);
   }
   const scope=e.shared?`${e.parkDays} exploration day equivalent`:e.start&&e.end>e.start?`${human(e.start,{month:'short',day:'numeric'})}–${human(shift(e.end,-1),{month:'short',day:'numeric'})} · ${e.days} allocated day${e.days===1?'':'s'}`:'';
   return `<article class="calendar-event cal-${e.kind}"><p class="eyebrow">${esc(e.event)}</p><h4>${esc(e.place)}</h4>${scope?`<p>${esc(scope)}</p>`:''}${e.from||e.to?`<p>${esc(e.from)} → ${esc(e.to)}</p>`:''}${e.miles?`<p>~${Math.round(e.miles).toLocaleString()} miles for the whole leg</p>`:''}${facts.length?`<p>${esc(facts.join(' · '))}</p>`:''}${e.quality!==null&&e.quality!==undefined?`<p>Stay quality ${number(e.quality)}/10${e.lateDays?' · Fixed date missed':''}</p>`:''}${e.siteId?accessWarningsHtml(model.accessReview,{siteId:e.siteId,date:day.date}):''}${e.siteVisitConcern?`<div class="access-visit-warning"><strong>${esc(e.siteVisitConcern.label)}</strong><p>${esc(e.siteVisitConcern.message)}</p><a href="${esc(e.siteVisitConcern.url)}" target="_blank" rel="noopener">Reviewed visitor reference ↗</a><p class="fineprint">Planning caution, not a verified date-specific opening or booking.</p></div>`:''}${e.dateWindow?`<p class="date-window-note"><strong>${e.windowConflict?'ARRIVAL-DATE CONFLICT · ':''}${esc(arrivalWindowText(e.dateWindow))}</strong><br>First exploration: ${esc(e.explorationStart||e.sharedArrivalDate||e.start)}${e.windowConflict?' · missed by '+esc(e.windowLateDays)+' day(s)':''}. Full requested exploration is retained.</p>`:''}${e.notes?`<details><summary>Planning notes</summary><p>${esc(e.notes)}</p></details>`:''}${e.siteId?`<button type="button" class="text-button" data-calendar-place="${esc(e.siteId)}">Park / stop details ↗</button>`:''}</article>`;
  }).join('');
  return `<h3 id="${idPrefix}DayTitle">${human(day.date,{weekday:'long',month:'short',day:'numeric',year:'numeric'})}</h3><p class="calendar-day-kind"><i class="cal-dot cal-${day.kind}"></i>${CALENDAR_TYPES[day.kind]}</p>${cards||'<p>No activity is allocated to this date. Review the schedule before travel.</p>'}`;
 }
 function render(){
  if(!model){root.innerHTML=`<div class="calendar-empty empty-state"><span>▦</span><h2>Your year, day by day.</h2><p>${pending?'Your route is calculating. The calendar will appear when it finishes.':'Calculate a route to see park stays, shared driving days, flights and waiting time on a calendar.'}</p><button type="button" class="button secondary" data-calendar-action="${pending?'explore':'calculate'}">${pending?'View search progress':'Find my route →'}</button><button type="button" class="text-button" data-calendar-action="explore">Back to the map</button></div>`;return;}
  const month=model.months.find(m=>m.key===monthKey)||model.months[0],r=model.result;monthKey=month.key;
  if(!model.byDate.has(selectedDate)||!selectedDate.startsWith(month.key))selectedDate=month.days[0].date;
  const first=month.key+'-01',offset=date(first).getUTCDay();
  const nextMonth=new Date(Date.UTC(Number(month.key.slice(0,4)),Number(month.key.slice(5)),1)).toISOString().slice(0,10),last=shift(nextMonth,-1);
  const cells=Array.from({length:offset},()=>'<div class="calendar-pad" aria-hidden="true"></div>');
  for(let d=first;d<=last;d=shift(d,1))cells.push(model.byDate.has(d)?button(model.byDate.get(d)):`<div class="calendar-outside"><span>${Number(d.slice(8))}</span></div>`);
  const types=Object.entries(CALENDAR_TYPES).filter(([kind])=>model.counts[kind]);
  const overview=model.months.map(m=>{
   const places=[...new Set(m.days.flatMap(d=>d.events.filter(e=>['park','personal'].includes(e.kind)).map(e=>e.shortPlace)))];
   const where=places.length>1?places[0]+' → '+places.at(-1):places[0]||CALENDAR_TYPES[m.days[0].kind];
   return `<button type="button" class="calendar-month-preview${m.key===month.key?' is-selected':''}" data-calendar-month="${m.key}" aria-pressed="${m.key===month.key}"><strong>${esc(m.label)}</strong><span class="calendar-month-strip" aria-hidden="true">${m.days.map(d=>`<i class="cal-${d.kind}"></i>`).join('')}</span><span class="calendar-preview-places" title="${esc(places.join(' → ')||where)}">${esc(where)}</span><small>${m.days.length} trip days${m.days.some(d=>d.kind==='wait')?' · includes waiting':''}</small></button>`;
  }).join('');
  root.innerHTML=`<div class="section-title"><div><p class="eyebrow">A LITTLE PERSPECTIVE ON THAT YEAR</p><h2>Your trip, on the calendar.</h2></div><button type="button" class="text-button" data-calendar-action="explore">Edit on the map ↗</button></div><p class="calendar-summary"><strong>${human(r.startDate)} – ${human(shift(r.endDate,-1))}</strong> · ${r.totalDays} allocated days · ${r.remaining<0?`${-r.remaining} days over target`:`${r.remaining} days under target`}</p><p class="fineprint">Each date appears once. Shared days include driving and exploration. Dates and transport remain draft estimates.${r.windowConflicts?' Red outlines mark visits with missed arrival dates; activity colors are retained.':''}${r.restDays?` Rest reserve: ${restSummary(r).placed} days placed after visits; ${restSummary(r).unplaced} unplaced at the end. Rest does not count as exploration.`:''}</p>${r.warnings?.length?`<details class="warning"><summary>Scheduling notes · ${r.warnings.length}</summary>${r.warnings.map(w=>`<p>${esc(w)}</p>`).join('')}</details>`:''}<div class="calendar-legend">${types.map(([kind,label])=>`<span><i class="cal-dot cal-${kind}"></i>${label}<small>${model.counts[kind]}d</small></span>`).join('')}</div><details class="calendar-overview" ${overviewOpen?'open':''}><summary>Whole-trip overview · ${model.months.length} months</summary><div class="calendar-months">${overview}</div></details><div class="calendar-review-controls"><p class="fineprint">Arrow keys move by day or week; Home/End select a week edge; Page Up/Down change month.</p><button type="button" data-calendar-action="next-warning" ${nextAccessWarningDate(model,selectedDate)?'':'disabled'}>Next access concern ↗</button>${model.counts.wait?'<button type="button" data-calendar-action="next-wait">Next waiting period ↗</button>':''}${r.windowConflicts?'<button type="button" data-calendar-action="next-date-conflict">Next arrival-date conflict ↗</button>':''}<span id="${idPrefix}Announcement" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"></span></div><div class="calendar-controls"><button type="button" data-calendar-step="-1" aria-label="Previous trip month" ${month===model.months[0]?'disabled':''}>←</button><label>Month<select id="${idPrefix}Month" aria-label="Calendar month">${model.months.map(m=>`<option value="${m.key}" ${m.key===month.key?'selected':''}>${esc(m.label)}</option>`).join('')}</select></label><button type="button" data-calendar-step="1" aria-label="Next trip month" ${month===model.months.at(-1)?'disabled':''}>→</button></div><div class="calendar-layout"><section class="calendar-month" aria-label="${esc(month.label)}"><div class="calendar-weekdays">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div></section><aside id="${idPrefix}DayDetail" class="calendar-day-detail" aria-labelledby="${idPrefix}DayTitle">${detail(model.byDate.get(selectedDate))}</aside></div>`;
 }
 function selectDate(value,{focus=false,scroll=false}={}){
  if(!model?.byDate.has(value))return;
  const crossMonth=value.slice(0,7)!==monthKey;selectedDate=value;monthKey=value.slice(0,7);
  if(crossMonth)render();else{
   root.querySelectorAll('[data-calendar-day]').forEach(el=>{const chosen=el.dataset.calendarDay===selectedDate;el.classList.toggle('is-selected',chosen);el.setAttribute('aria-pressed',String(chosen));el.tabIndex=chosen?0:-1;});
   root.querySelector('#'+idPrefix+'DayDetail').innerHTML=detail(model.byDate.get(selectedDate));
  }
  root.querySelector('#'+idPrefix+'Announcement').textContent=human(value,{weekday:'long',month:'long',day:'numeric',year:'numeric'})+' · '+CALENDAR_TYPES[model.byDate.get(value).kind]+(model.byDate.get(value).accessWarnings.length?' · access needs review':'')+(model.byDate.get(value).dateConflicts.length?' · park arrival-date conflict':'');
  if(focus)root.querySelector(`[data-calendar-day="${selectedDate}"]`)?.focus();
  if(scroll)root.querySelector('#'+idPrefix+'DayDetail').scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.calendarAction==='explore')return onExplore();
  if(b.dataset.calendarAction==='calculate')return onCalculate();
  if(b.dataset.calendarPlace)return onPlace(b.dataset.calendarPlace);
  if(!model)return;
  if(b.dataset.calendarAction==='next-wait'){const next=nextWaitingPeriodDate(model,selectedDate);if(next)selectDate(next,{focus:true,scroll:true});return;}
  if(b.dataset.calendarAction==='next-date-conflict'){selectDate(nextDateConflictDate(model,selectedDate),{focus:true});return;}
  if(b.dataset.calendarAction==='next-warning'){selectDate(nextAccessWarningDate(model,selectedDate),{focus:true});return;}
  if(b.dataset.calendarDay){selectDate(b.dataset.calendarDay,{scroll:root.ownerDocument.defaultView.matchMedia('(max-width:900px)').matches});return;}
  if(b.dataset.calendarMonth){monthKey=b.dataset.calendarMonth;selectedDate=null;render();return;}
  if(b.dataset.calendarStep){const index=model.months.findIndex(m=>m.key===monthKey);monthKey=model.months[index+Number(b.dataset.calendarStep)]?.key||monthKey;selectedDate=null;render();root.querySelector(`[data-calendar-step="${b.dataset.calendarStep}"]`)?.focus();}
 });
 root.addEventListener('keydown',e=>{
  const day=e.target.closest('[data-calendar-day]');if(!day)return;
  const target=calendarNavigationDate(model,day.dataset.calendarDay,e.key);if(!target)return;
  e.preventDefault();selectDate(target,{focus:true});
 });
 root.addEventListener('change',e=>{if(e.target.id===idPrefix+'Month'){monthKey=e.target.value;selectedDate=null;render();root.querySelector('#'+idPrefix+'Month').focus();}});
 root.addEventListener('toggle',e=>{if(e.target===root.querySelector('.calendar-overview'))overviewOpen=e.target.open;},true);
 return {update(input){pending=!!input.pending;try{model=buildCalendarModel(input);render();}catch(error){console.error('Calendar rendering:',error);root.innerHTML='<div class="warning"><p>The calendar could not reconcile this schedule. Your plan is still saved. Recalculate the route or use Explore to review it.</p><button type="button" class="text-button" data-calendar-action="explore">Back to Explore</button></div>';}}};
}
