import {addDays,dateOf,iso} from './optimizer.mjs';
import {visitNumbers} from './map-markers.mjs';
import {REGION_NAMES} from './remote-parks.mjs';
const rounded=n=>typeof n==='number'&&Number.isFinite(n)?Math.round(n*100)/100:'';
export const ITINERARY_HEADERS=['Sequence','Stop number','Site ID','Region','Event','Place / activity','From','To','Start date','End date (exclusive)','Days','Full destination days','Estimated road miles','Driving hours','Stop allowance hours','Other travel hours','Season quality /10','Personal priority /5','Notes'];
const end=(start,days)=>iso(addDays(dateOf(start),days));
const name=p=>p?.name||p?.shortName||p?.code||(Number.isFinite(p?.lat)&&Number.isFinite(p?.lng)?`${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}`:'');
export function exportTables({state,sites,result,exportedAt=new Date().toISOString()}){
 const lookup=new Map(sites.map(s=>[s.id,s])),selected=state.selected.map(id=>lookup.get(id)).filter(Boolean),numbers=visitNumbers(result),rows=[];
 if(result)selected.sort((a,b)=>(numbers.get(a.id)||0)-(numbers.get(b.id)||0));
 const add=e=>{if(e.days===0&&!e.parkDays&&!e.miles&&!e.hours&&!e.otherHours)return;rows.push(e);};
 const visit=(v,region)=>{const s=lookup.get(v.id);add({stop:numbers.get(v.id)||'',siteId:v.id,region,event:'Park / destination stay',place:s?.shortName||v.id,start:v.stayStart??v.arrival,end:v.stayEnd??v.departure,days:v.calendarDays??v.days,parkDays:v.days,quality:v.quality,priority:s?.priority||v.priority||1,notes:[v.fixedDate?`Fixed first full day ${v.fixedDate}${v.lateDays?' — MISSED by '+v.lateDays+' days':''}`:null,v.sharedDays?`${v.sharedDays} equivalent exploration days included on arrival travel day (${v.arrival}).`:null,v.departureSharedDays?`${v.departureSharedDays} equivalent exploration days on departure morning (${v.departureDriveDate}); afternoon driving owns that calendar day.`:null,v.unusedDays?`${v.unusedDays} unused day equivalents reserved at the end of this stay; no carry into later travel.`:null,s?.remote?.route,v.status==='closed'?'Access/closure conflict':null,s?.url].filter(Boolean).join(' · ')});};
 const road=(leg,place)=>{if(!leg)return;add({region:'Mainland',event:leg.to==='finish'?'Return / finish drive':'Drive to next stop',place,from:leg.from==='start'?state.settings.start.name:lookup.get(leg.from)?.shortName||result?.nodes?.find(n=>n.id===leg.from)?.shortName||leg.from,to:place,start:leg.depart,end:end(leg.depart,leg.days),days:leg.days,miles:leg.miles,hours:leg.hours,breakHours:leg.breakHours,notes:[...(leg.cautions||[]),...(leg.dailyActivities||[]).map(d=>`${d.date}: ${rounded(d.driveHours)} h driving + ${rounded(d.breakHours)} h stops + ${rounded(d.campHours)} h camp + ${rounded(d.departureExplorationHours)} h morning exploration + ${rounded(d.arrivalExplorationHours)} h arrival exploration = ${rounded(d.totalHours)} h activity.`)].join(' ')});};
 if(result){
  for(let i=0;i<result.visits.length;i++){
   const v=result.visits[i],leg=result.legs[i];
   if(v.excursion){
    const block=result.excursions.find(b=>b.id===v.id),region=REGION_NAMES[block.region],node=result.nodes.find(n=>n.id===v.id);
    road(leg,node?.shortName||region+' departure gateway');
    if(block.wait)add({region,event:'Transport-window wait',place:region,start:end(leg.depart,leg.days),end:block.depart,days:block.wait,notes:'Wait before the entire regional visit fits its modeled access window.'});
    const events=block.transport.map(t=>({region,event:t.kind==='drive'?'Regional drive':t.kind==='flight'?'Commercial flight':t.kind==='buffer'?'Contingency buffer':'Regional flight / boat / ground transfer',place:t.label,from:name(t.from),to:name(t.to),start:t.depart,end:t.arrival,days:t.days,miles:t.miles,hours:t.kind==='drive'?t.hours:0,breakHours:t.breakHours,otherHours:t.kind==='flight'||t.kind==='transfer'?t.hours:0,notes:!block.feasible?'Infeasible access window.':'Draft transport estimate; not a verified schedule.'}));
    for(const t of events)add(t);
    for(const p of block.visits)visit(p,region);
   }else{
    const s=lookup.get(v.id),transfer=v.transferDays||0,out=Math.ceil(transfer/2),back=Math.floor(transfer/2),arrival=end(leg.depart,leg.days);
    road(leg,s?.shortName||v.id);
    if(out)add({siteId:v.id,region:'CONUS',event:'Outbound park transfer',place:s?.shortName||v.id,start:arrival,end:end(arrival,out),days:out,notes:s?.access?.note||'Placeholder park-access transfer.'});
    if(v.wait)add({siteId:v.id,region:'CONUS',event:'Closure wait',place:s?.shortName||v.id,start:v.earliest,end:v.arrival,days:v.wait,notes:'Wait until the complete stay fits the annual opening rule.'});
    if(v.appointmentWait)add({siteId:v.id,region:'Personal stop',event:'Appointment wait',place:s?.shortName||v.id,start:v.earliest,end:v.arrival,days:v.appointmentWait,notes:'Early arrival: waiting until the fixed first full day.'});
    visit(v,s?.type==='custom'?'Personal stop':'CONUS');
    if(back)add({siteId:v.id,region:'CONUS',event:'Return park transfer',place:s?.shortName||v.id,start:v.departure,end:end(v.departure,back),days:back,notes:s?.access?.note||'Placeholder park-access transfer.'});
   }
  }
  const finish=result.legs.find(l=>l.to==='finish');if(finish)road(finish,state.settings.end?.name||'Finish');
  if(result.roundingDays)add({event:'Calendar rounding',place:'Final partial-day allowance',start:result.endDate,end:result.endDate,days:result.roundingDays,notes:'Rounds the final fractional allocation up to a whole calendar day.'});
  if(result.restDays)add({event:'Rest-day reserve',place:'Unplaced rest reserve',start:iso(addDays(dateOf(result.endDate),-result.restDays)),end:result.endDate,days:result.restDays,notes:'Reserved at the end by the current model; not distributed through the itinerary.'});
  rows.sort((a,b)=>(a.start||'').localeCompare(b.start||''));
 }else for(const s of selected)add({siteId:s.id,region:s.remote?REGION_NAMES[s.remote.region]:s.type==='custom'?'Personal stop':'CONUS',event:'Unscheduled destination',place:s.shortName,days:'',parkDays:s.days,priority:s.priority||1,notes:'Route not calculated: selection order is not an optimized itinerary.'});
 const itinerary=[ITINERARY_HEADERS,...rows.map((e,i)=>[i+1,e.stop||'',e.siteId||'',e.region||'',e.event,e.place||'',e.from||'',e.to||'',e.start||'',e.end||'',e.days??'',e.parkDays||'',rounded(e.miles),rounded(e.hours),rounded(e.breakHours),rounded(e.otherHours),rounded(e.quality),e.priority||'',e.notes||''])];
 const summary=[['Item','Value','Notes'],['Exported at',exportedAt,'UTC'],['Report status',result?'Calculated route currently shown':'Selected places only','CSV/XLSX are reports; JSON is the restorable backup.'],['Selected destinations',selected.length,'Includes every selected off-mainland park.'],['Trip target',state.settings.duration,'Days; reporting target only.'],['Saved departure setting',state.settings.startDate,'The month search may choose a different departure.'],['Calculated departure',result?.startDate||'',''],['Calculated end',result?.endDate||'','Includes the unplaced rest reserve.'],['Allocated days',result?.totalDays??'',''],['Days over target',result?Math.max(0,-result.remaining):'',''],['Days under target',result?Math.max(0,result.remaining):'',''],['Full destination days',result?.parkDays??selected.reduce((n,s)=>n+s.days,0),'Excludes transfers and buffers.'],['Days involving driving',result?.travelDays??'','Includes regional driving; mixed days overlap exploration.'],['Mixed drive / exploration days',result?.mixedDays??'',''],['Exploration days shared with driving',result?.sharedParkDays??'','Arrival credits and departure-morning exploration; requested exploration is retained.'],['Other transport / buffer days',result?.transferDays??'','The current model groups non-driving transfers and contingency here.'],['Fixed-date conflicts',result?.appointmentConflicts??'','A missed fixed date makes the route infeasible.'],['Appointment wait days',result?.appointmentWaitDays??'','Early arrival before a fixed visit.'],['Closure / access wait days',result?.waitDays??'',''],['Rest reserve days',state.settings.restDays,'Held at the end, not distributed.'],['Estimated road miles',rounded(result?.miles),''],['Driving hours',rounded(result?.hours),'Excludes stop allowance.'],['Stop allowance hours',rounded(result?.breakHours),''],['Other transport hours',rounded(result?.flightHours),'Includes commercial and regional air/boat/ground transfers.'],['Day-weighted seasonal quality',rounded(result?.quality),'0–10; personal priority affects ranking, not this average.'],['Estimate limitations','Draft roads, times, transport availability, seasonal quality and access windows','Not verified routes, schedules, prices or reservations.'],['Calendar convention','Start included; end excluded','A 3-day stay starting July 1 ends July 4.']];
 const preferences=[['Stop number','Site ID','Place','State / territory','Region','Full days','Personal priority /5','Latitude','Longitude','Monthly quality Jan–Dec','Annual closure starts','Annual closure ends','Transport window starts','Transport window ends','Priority rationale','Official park page'],...selected.map(s=>[numbers.get(s.id)||'',s.id,s.shortName,s.state||'',s.remote?REGION_NAMES[s.remote.region]:'CONUS',s.days,s.priority||1,s.lat,s.lng,(s.profile?.scores||[]).join(', '),s.closure?.start||'',s.closure?.end||'',s.remote?.window?.start||'',s.remote?.window?.end||'',s.priorityNote||'',s.url||''])];
 const settings=[['Setting','Value','Notes'],...Object.entries(state.settings).map(([key,value])=>[key,value===null?'':typeof value==='object'?JSON.stringify(value):value,'Saved optimizer input']),...Object.entries(state.calibration||{}).map(([id,value])=>['Calibration · '+id,JSON.stringify(value),'Saved measurement and inclusion flag.']),...Object.entries(state.rules||{}).map(([id,value])=>['Seasonal override · '+id,JSON.stringify(value),'Full editable assumptions are also preserved in JSON backups.'])];
 return {summary,itinerary,preferences,settings};
}
export function csvText(table){
 const cell=value=>{let text=String(value??'');if(typeof value==='string'&&/^[\s]*[=+\-@]/.test(text))text="'"+text;return /[",\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;};
 return '\ufeff'+table.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
export function xlsxBytes(tables,XLSX){
 const workbook=XLSX.utils.book_new();
 for(const [title,key]of [['Summary','summary'],['Itinerary','itinerary'],['Selected places','preferences'],['Settings','settings']]){
  const data=tables[key],sheet=XLSX.utils.aoa_to_sheet(data);
  sheet['!autofilter']={ref:sheet['!ref']};
  sheet['!cols']=data[0].map((_,i)=>({wch:Math.min(55,Math.max(12,...data.slice(0,250).map(row=>String(row[i]??'').length+2)))}));
  XLSX.utils.book_append_sheet(workbook,sheet,title);
 }
 workbook.Props={Title:'The Long Way — Trip report',Subject:'Draft national park itinerary and planning inputs'};
 return XLSX.write(workbook,{bookType:'xlsx',type:'array',compression:true});
}

