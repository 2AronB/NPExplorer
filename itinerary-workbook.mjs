import {PARK_HIGHLIGHTS} from './park-highlights.mjs';
const DAY=86400000;
const date=s=>s?new Date(s+'T00:00:00Z'):null;
const readable=s=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date(s));
const shifted=(s,n)=>new Date(date(s).getTime()+n*DAY).toISOString().slice(0,10);
const through=(start,end)=>start&&end?(end>start?shifted(end,-1):start):null;
const finite=n=>Number.isFinite(n)?n:null;
const sum=(rows,key)=>rows.reduce((n,r)=>n+(finite(r[key])??0),0);
const official=s=>s?.id==='kica'||s?.id==='sequ'?'https://www.nps.gov/seki/index.htm':s?.url;
const full=s=>s?.id==='npsa'?'National Park of American Samoa':s?.name||s?.shortName||'Destination unavailable';
const safeUrl=url=>{try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch{return null;}};
export function travelDocument({state,sites,result,rows,selected,exportedAt}){
 const lookup=new Map(sites.map(s=>[s.id,s]));
 const travelerName=s=>s.excursion?`${s.excursion.airport?.name||'Mainland'} ${s.excursion.airport?.code||''} gateway (${s.excursion.mode==='drive'?'overland':'fly-out'})`:full(s);
 const names=new Map([...sites,...result?.nodes||[]].flatMap(s=>[[s.id,travelerName(s)],[s.shortName,travelerName(s)]]));
 const label=value=>names.get(value)||(/^-?\d+\.\d+, -?\d+\.\d+$/.test(value||'')?'Approximate park gateway':value)||'';
 const events=rows.map(e=>{
  const s=lookup.get(e.siteId),isVisit=e.event==='Park / destination stay'||e.event==='Unscheduled destination';
  let start=e.start,end=e.end;
  // The solver places rest before final rounding. These labels remain day-level estimates.
  if(result&&e.event==='Rest-day reserve'){start=shifted(result.endDate,-(result.roundingDays||0)-result.restDays);end=shifted(result.endDate,-(result.roundingDays||0));}
  if(result&&e.event==='Calendar rounding'){start=shifted(result.endDate,-1);end=result.endDate;}
  const notes=[e.fixedDate?`FIXED APPOINTMENT: ${readable(e.fixedDate)}${e.lateDays?`. MISSED by ${e.lateDays} day(s).`:'.'}`:'',
   e.sharedDays?`${e.sharedDays} exploration equivalents on the arrival drive${e.sharedArrivalDate?' ('+readable(e.sharedArrivalDate)+')':''}. Allocation excludes shared credit.`:'',
   e.departureSharedDays?`${e.departureSharedDays} exploration equivalents on departure morning${e.departureDriveDate?' ('+readable(e.departureDriveDate)+')':''}; that calendar day belongs to the drive.`:'',
   e.unusedDays?`${e.unusedDays} day equivalents unused within the stay allocation; not carried forward.`:'',
   e.event==='Unscheduled destination'?'Selected only. Route not calculated; order is not optimized.':'',
   e.event==='Park / destination stay'&&s?.type==='custom'?'Personal visit allocation.':'',
   e.event==='Park / destination stay'&&e.notes?.includes('Access/closure conflict')?'ACCESS CONFLICT: verify this stay before travel.':'',
   !isVisit?e.notes:'',
   ].filter(Boolean).join(' ');
  return {...e,region:e.region==='CONUS'?'Mainland':e.region,start:start||null,through:through(start,end),place:isVisit?full(s):label(e.place),from:label(e.from),to:label(e.to),
   days:result?finite(e.days):null,parkDays:finite(e.parkDays),miles:finite(e.miles),hours:finite(e.hours),
   breakHours:finite(e.breakHours),otherHours:finite(e.otherHours),notes,url:isVisit?official(s):null};
 }).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
 const parks=selected.filter(s=>s.type==='park').map(s=>({name:full(s),url:official(s),...PARK_HIGHLIGHTS[s.id],missing:!PARK_HIGHLIGHTS[s.id]}));
 const actions=[];
 for(const e of events){
  if(e.fixedDate)actions.push({status:e.lateDays?'CONFLICT':'Confirm appointment',place:e.place,due:e.fixedDate,action:e.lateDays?`Fixed first full day missed by ${e.lateDays} day(s). Revise the route before travel.`:'Confirm the fixed first full visit day and arrangements.',url:null});
  if(e.notes.includes('ACCESS CONFLICT')||e.notes.includes('Infeasible access'))actions.push({status:'CONFLICT',place:e.place,action:'Resolve the modeled access conflict before travel.',url:e.url});
 }
 for(const block of result?.excursions||[])actions.push({status:block.feasible?'Research transport':'CONFLICT',place:block.gateway?.name||'Regional excursion',action:`${block.mode==='drive'?'Verify the overland route, border requirements and vehicle suitability.':'Verify flight connections, regional transfers and vehicle storage.'} Recover the mainland truck/camper at ${block.airport?.name||block.airport?.code||'the modeled gateway'} before continuing. Buffers are estimates; no transport is booked.`,url:null});
 for(const p of parks)actions.push({status:'Research access',place:p.name,action:p.missing?'Park highlights not yet researched. Check official visitor information.':'Choose highlights, then verify current access, permits, tickets and services for your dates. No reservation status is assumed.',url:p.url});
 actions.push({status:'Arrange overnight stops',place:'Along the route',action:'Choose overnight locations and confirm any reservations. This model does not assign campsites or hotels.',url:null});
 if(result?.restDays)actions.push({status:'Place rest days',place:'Rest reserve',action:`Distribute the ${result.restDays} reserved days among real stops as you refine the trip. The model currently holds them at the end.`,url:null});
 const accounting={days:sum(events,'days'),exploration:sum(events,'parkDays'),miles:sum(events,'miles'),hours:sum(events,'hours'),breakHours:sum(events,'breakHours'),otherHours:sum(events,'otherHours')};
 // Refuse a plausible-looking workbook if a future solver contract loses an allocation.
 if(result)for(const [key,expected]of Object.entries({days:result.totalDays,exploration:result.parkDays,miles:result.miles,hours:result.hours,breakHours:result.breakHours,otherHours:result.flightHours})){
  if(Number.isFinite(expected)&&Math.abs(accounting[key]-expected)>1e-6)throw Error(`Itinerary accounting mismatch (${key}). Export JSON and report this schedule contract.`);
 }
 return {events,parks,actions,accounting,result,exportedAt,selectedCount:selected.length,
  chapters:[...new Set(events.map(e=>e.region).filter(Boolean))],startName:state.settings.start?.name||'Departure',endName:state.settings.end?.name||'Open finish'};
}

const palette={ink:'243B35',green:'285447',pale:'F1F5F2',line:'D3DFD8',amber:'FFF1D2',red:'FBE1DF',link:'175A8A',muted:'52645E'};
const link=(text,url)=>safeUrl(url)?{text,hyperlink:safeUrl(url),tooltip:'Open official visitor information'}:text;
function sheet(book,name,widths,note,headers){
 const ws=book.addWorksheet(name,{properties:{tabColor:{argb:palette.green}},views:[{showGridLines:false,state:'frozen',ySplit:5,activeCell:'A6'}],pageSetup:{paperSize:1,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,printTitlesRow:'1:5',margins:{left:.3,right:.3,top:.4,bottom:.4,header:.15,footer:.15}}});
 ws.columns=widths.map(width=>({width}));
 ws.getCell('A2').value=name==='Overview'?'The Long Way — travel itinerary':name;
 ws.mergeCells(2,1,2,widths.length);ws.getRow(2).height=27;
 ws.getCell('A2').font={name:'Arial',size:16,bold:true,color:{argb:palette.ink}};
 ws.mergeCells(3,1,3,widths.length);ws.getCell('A3').value=note;ws.getRow(3).height=32;
 ws.getCell('A3').font={name:'Arial',size:10,italic:true,color:{argb:palette.muted}};
 ws.getCell('A3').alignment={vertical:'middle',wrapText:true};
 ws.getRow(4).height=8;
 if(headers){ws.getRow(5).values=headers;ws.getRow(5).height=name==='Travel details'?44:32;ws.getRow(5).eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:palette.green}};c.font={name:'Arial',size:10,bold:true,color:{argb:'FFFFFF'}};c.alignment={vertical:'middle',horizontal:'center',wrapText:true};});}
 ws.headerFooter.oddFooter='&LThe Long Way • draft itinerary&RPage &P of &N';
 return ws;
}
function row(ws,values,{warning=false,fixed=false}={}){
 const r=ws.addRow(values.map(v=>v===''?null:v));let lines=1;
 r.eachCell({includeEmpty:true},(c,i)=>{
  c.font={name:'Arial',size:10,color:{argb:c.value?.hyperlink?palette.link:palette.ink},...(c.value?.hyperlink?{underline:true}:{})};
  c.alignment={vertical:'top',wrapText:true,horizontal:typeof c.value==='number'?'right':'left'};
  c.fill={type:'pattern',pattern:'solid',fgColor:{argb:warning?palette.red:fixed?palette.amber:r.number%2===0?palette.pale:'FFFFFF'}};
  const t=c.value instanceof Date?'':String(c.value?.text??c.value??'');
  // Conservative line estimate, including explicit line breaks; keep notes legible.
  lines=Math.max(lines,...t.split('\n').map(v=>Math.ceil(v.length/Math.max(5,(ws.getColumn(i).width-2)*.85))));
  if(c.value instanceof Date)c.numFmt='mmm d, yyyy';
  if(typeof c.value==='number')c.numFmt=Number.isInteger(c.value)?'0':'0.00';
 });
 r.height=Math.max(29,lines*14+10);return r;
}
const dated=s=>s?date(s):null;
function finish(ws,filter=true){
 const last=ws.rowCount,col=ws.columnCount;
 if(filter&&last>5)ws.autoFilter={from:{row:5,column:1},to:{row:last,column:col}};
 ws.pageSetup.printArea=`A1:${ws.getColumn(col).letter}${last}`;
}
export async function itineraryBytes(doc,ExcelJS){
 const book=new ExcelJS.Workbook();book.creator='NPExplorer';book.created=new Date(doc.exportedAt);book.title='The Long Way — travel itinerary';book.subject='Draft itinerary and official park highlights';
 const r=doc.result;
 const overview=sheet(book,'Overview',[30,22,60],r?'Calculated route currently shown. Draft estimates; JSON is the restorable backup.':'Selected places — route not calculated. No travel order, dates or mileage assigned.',['Trip measure','Value','Meaning']);
 overview.pageSetup.orientation='portrait';
 const metric=(a,b,c)=>{const rr=row(overview,[a,b,c]);if(typeof b==='number')rr.getCell(2).numFmt=/miles/.test(a)?'#,##0':/hours/.test(a)?'0.0':Number.isInteger(b)?'0':'0.00';return rr;};
 metric('Departure',r?dated(r.startDate):null,r?doc.startName:'Calculate a route to assign dates.');
 metric('Last allocated date',r?dated(shifted(r.endDate,-1)):null,r?doc.endName:'');
 metric('Allocated calendar days',r?.totalDays??null,'Sum of Itinerary allocations. Do not add overlapping date ranges.');
 metric('Exploration equivalents',r?.parkDays??null,'Includes personal visits and exploration shared with driving.');
 metric('Shared exploration equivalents',r?.sharedParkDays??null,'Already included in exploration totals; not extra calendar days.');
 metric('Estimated road miles',r?.miles??null,'Mainland and regional driving, including the finish leg.');
 metric('Estimated driving hours',r?.hours??null,'Driving only; separate from stops and other transport.');
 metric('Stop allowance hours',r?.breakHours??null,'Additional modeled breaks on road legs.');
 metric('Other transport hours',r?.flightHours??null,'Modeled commercial flights and regional air, boat or ground transfers.');
 metric('Regional chapters',doc.chapters.join(', ')||'Unscheduled',`${doc.selectedCount} destinations; ${doc.parks.length} national parks. See Itinerary for the route.`);
 metric('Fixed-date conflicts',r?.appointmentConflicts??null,'Resolve missed appointments before using this route. See Checklist.');
 metric('Rest reserve days',r?.restDays??null,'Unplaced reserve held at the end by the model. No overnight base assigned.');
 metric('How to read dates','Approximate date labels','Through dates are inclusive. Shared days may overlap travel. Exact arrival and departure times are unassigned.');
 metric('Travel status','Unbooked estimates','Confirm roads, transport, access and overnight stops. Park highlights are choices, not daily activities.');
 for(const w of r?.warnings||[])row(overview,['Schedule warning',w,'Review before travel.'],{warning:true});
 finish(overview,false);overview.views=[{showGridLines:false}];
 const itinerary=sheet(book,'Itinerary',[13,13,37,10,12,11,11,43],r?'Chronological allocations. Dates are approximate and may overlap on mixed days. Add allocated days, not inclusive date spans.':'Selected places only. The order below is not an optimized itinerary.',['Start','Through (inclusive)','Destination / transition','Allocated days','Exploration equivalents','Est. road miles','Driving hours','Practical notes']);
 for(const e of doc.events){const rr=row(itinerary,[dated(e.start),dated(e.through),link(`${e.place}\n${e.event}${e.region?' · '+e.region:''}`,e.url),e.days,e.parkDays,e.miles,e.hours,e.notes],{warning:!!e.lateDays||/CONFLICT|Infeasible/.test(e.notes),fixed:!!e.fixedDate});rr.getCell(6).numFmt='#,##0';rr.getCell(7).numFmt='0.0';}
 finish(itinerary);
 const guide=sheet(book,'Park guide',[30,29,34,44],'Official NPS sources checked Oct 28, 2026. Click an experience for its source. Choose options to suit your stay; these are not scheduled activities.',['National park','Experience / official source','Why go','Access / planning note']);
 for(const p of doc.parks){
  if(p.missing)row(guide,[p.name,link('Official park information',p.url),'Research needed','Highlights unavailable for this park.']);
  else for(const item of p.experiences)row(guide,[p.name,link(item.title,item.url),item.description,item.caveat]);
 }
 if(!doc.parks.length)row(guide,['No national parks selected','',null,null]);
 finish(guide);
 const travel=sheet(book,'Travel details',[13,13,29,29,10,10,39],'Estimated travel only. Stop allowance is separate from driving hours. Coordinates in map links are modeled endpoints, not verified navigation.',['Start','Through','From','To / transport','Stop allowance hours','Other transport hours','Access / recovery details']);
 for(const e of doc.events.filter(e=>/drive|flight|transfer|buffer|Transport-window/i.test(e.event))){
  const endpoints=e.path?.length>=2?e.path:null;
  const map=endpoints?`https://www.google.com/maps/dir/?api=1&origin=${endpoints[0].lat},${endpoints[0].lng}&destination=${endpoints.at(-1).lat},${endpoints.at(-1).lng}&travelmode=driving`:null;
  row(travel,[dated(e.start),dated(e.through),e.from||e.region,link(e.to||e.place,map),e.breakHours,e.otherHours,[e.event,e.notes,map?'Map uses estimated endpoints. Verify actual approach.':''].filter(Boolean).join('. ')]);
  for(const d of e.dailyActivities||[])if(d.departureExplorationHours||d.arrivalExplorationHours)row(travel,[dated(d.date),dated(d.date),'Shared road date',e.to||e.place,d.breakHours,null,`${d.departureExplorationHours||0} h departure-morning exploration + ${d.driveHours.toFixed(1)} h driving + ${(d.breakHours||0).toFixed(1)} h stops + ${(d.campHours||0).toFixed(1)} h camp + ${d.arrivalExplorationHours||0} h arrival exploration. ${(d.totalHours||0).toFixed(1)} h modeled activity budget. Detail only: already counted in the Itinerary allocations.`]);
 }
 for(const b of r?.excursions||[])row(travel,[dated(b.depart),dated(through(b.depart,b.returnDate)),b.airport?.name||b.gateway?.name,'Mainland vehicle recovery',null,null,`${b.mode==='drive'?'Overland excursion':'Fly-out excursion'} returns to its modeled mainland gateway. ${b.mode==='drive'?'Truck/camper accompanies the overland route.':'Truck/camper remains on the mainland; storage and recovery arrangements are unassigned.'} ${b.bufferDays??0} contingency days included. Transfers and service windows remain unverified.`],{warning:!b.feasible});
 if(!r)row(travel,['Route not calculated',null,null,null,null,null,'Calculate a route to estimate travel.']);
 else if(travel.rowCount===5)row(travel,['No travel allocation',null,null,null,null,null,'No driving or regional transport is allocated in this result.']);
 finish(travel);
 const checklist=sheet(book,'Checklist',[22,34,13,58,20],'Fill in your own arrangements after verifying dates, access and operators. Nothing here is marked booked or complete.',['Action status','Place / scope','Fixed date','Next action','Useful link']);
 for(const a of doc.actions)row(checklist,[a.status,a.place,dated(a.due),a.action,a.url?link('Park website',a.url):null],{warning:a.status==='CONFLICT',fixed:!!a.due});
 finish(checklist);
 return book.xlsx.writeBuffer();
}
