import {MAX_SCENARIOS,resultVersionMatches,comparisonMetrics} from './scenarios.mjs';
import {accessSummaryHtml} from './access-review.mjs';
import {exportTables} from './trip-export.mjs';
import {mountCalendar} from './calendar.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields=[['days','Allocated days',0],['miles','Estimated road miles',0],['hours','Driving hours',1],['quality','Season quality /10',1],['mixed','Mixed drive / exploration days',0],['dedicated','Dedicated drive + transfer days',0],['waits','Closure / transport wait days',0],['access','Parks with access flags',0],['unknown','Parks with research gaps',0],['appointments','Missed fixed dates',0]];
const show=(n,precision)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:precision}):'—';

export function mountComparisons(root,{store,versions,active,onRestore,onExport,toast}){
 let selectedId=null,deleteId=null;
 const find=id=>store.items.find(s=>s.id===id)||(store.recovery?.id===id?store.recovery:null);
 const status=s=>!s.result?'Inputs only':resultVersionMatches(s,versions)?'Saved result':'Older result · restore inputs and recalculate';
 function actions(s,recovery=false){return `<div class="scenario-actions"><button type="button" data-scenario-view="${esc(s.id)}">View saved report</button><button type="button" data-scenario-restore="${esc(s.id)}">Restore inputs</button><button type="button" data-scenario-export="${esc(s.id)}" data-format="json">JSON backup</button>${s.result?`<button type="button" data-scenario-export="${esc(s.id)}" data-format="xlsx">XLSX</button><button type="button" data-scenario-export="${esc(s.id)}" data-format="csv">CSV</button>`:''}${recovery?'':`<button type="button" data-scenario-delete="${esc(s.id)}">${deleteId===s.id?'Confirm delete':'Delete'}</button>`}</div>`;}
 function render(){
  const current=active(),items=store.items,base=comparisonMetrics(current.result,current.accessReview),columns=[{...current,name:'Active trip'},...items];
  root.innerHTML=`<div class="section-title"><div><p class="eyebrow">TRY A DIFFERENT WAY</p><h2>Compare your trips.</h2></div></div><p>Save up to ${MAX_SCENARIOS} named alternatives in this browser. Viewing and exporting a saved trip leaves your active plan in place.</p><p class="fineprint">Browser storage is not a cross-device backup. Export JSON to keep restorable inputs. Saved reports retain the displayed route; older results need recalculation after updates. Differences below are relative to your active trip.</p>${store.error?`<div class="warning"><p>${esc(store.error)} Your saved library has been left untouched.</p><button type="button" data-scenario-library-backup>Export library recovery copy</button></div>`:''}<form id="scenarioSaveForm" class="scenario-save"><label>Name this alternative<input id="scenarioName" maxlength="80" required placeholder="e.g. Comfortable pace"></label><button type="submit" ${store.error||items.length>=MAX_SCENARIOS?'disabled':''}>Save active trip</button><span>${items.length} / ${MAX_SCENARIOS} saved${current.result?' · includes displayed result':' · inputs only; calculate for metrics'}</span></form><div class="month-table-scroll"><table class="comparison-table"><caption>Active and saved trip metrics</caption><thead><tr><th scope="col">Measure</th>${columns.map((c,i)=>`<th scope="col">${esc(c.name)}<small>${i?esc(status(c)):current.result?'Calculated result':'Not calculated'}</small></th>`).join('')}</tr></thead><tbody>${fields.map(([key,label,precision])=>`<tr><th scope="row">${label}</th>${columns.map((c,i)=>{const value=comparisonMetrics(c.result,c.accessReview)?.[key],delta=i&&Number.isFinite(value)&&Number.isFinite(base?.[key])?(Math.round(value*10**precision)-Math.round(base[key]*10**precision))/10**precision:null;return `<td>${show(value,precision)}${delta!==null?`<small>${delta>0?'+':''}${show(delta,precision)} vs active</small>`:''}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div><div class="scenario-list">${items.map(s=>`<article class="scenario-card"><label>Trip name<input value="${esc(s.name)}" maxlength="80" data-scenario-name="${esc(s.id)}"></label><button type="button" data-scenario-rename="${esc(s.id)}">Rename</button><p>${esc(status(s))} · saved ${esc(new Date(s.savedAt).toLocaleString())}</p>${actions(s)}</article>`).join('')||'<p class="empty-state">Save your first alternative, change your inputs, then calculate and save another.</p>'}</div>${store.recovery?`<details class="scenario-recovery"><summary>Previous active trip · recovery copy</summary><p>Preserved before your last restore. ${esc(store.recovery.savedAt)}</p>${actions(store.recovery,true)}</details>`:''}<section id="savedScenarioReport" aria-live="polite"></section>`;
  renderReport();
 }
 function renderReport(){
  const s=find(selectedId),target=root.querySelector('#savedScenarioReport');if(!s||!target)return;
  try{
   const tables=exportTables({state:s.state,sites:s.sites,result:s.result,accessReview:s.accessReview});
   target.innerHTML=`<div class="section-title"><h3>Saved report · ${esc(s.name)}</h3><button type="button" data-scenario-close>Close report</button></div><p>${esc(status(s))}. Viewing this report does not replace your active plan. Use its own export buttons for this alternative; the top Export trip menu always uses the active trip.</p>${accessSummaryHtml(s.accessReview)}<details><summary>Chronological itinerary · ${tables.travelDocument.events.length} allocations</summary><div class="month-table-scroll"><table><thead><tr><th>Start</th><th>Through</th><th>Place</th><th>Activity</th></tr></thead><tbody>${tables.travelDocument.events.map(e=>`<tr><td>${esc(e.start||'Unscheduled')}</td><td>${esc(e.through||'')}</td><td>${esc(e.place)}</td><td>${esc(e.event)}</td></tr>`).join('')}</tbody></table></div></details><div id="savedScenarioCalendar"></div>`;
   if(s.result)mountCalendar(target.querySelector('#savedScenarioCalendar'),{idPrefix:'savedScenario',onExplore:()=>{selectedId=null;render();},onCalculate:()=>toast('Restore this trip’s inputs to recalculate it.'),onPlace:id=>{const site=s.sites.find(s=>s.id===id);toast(site?.name||id);}}).update({state:s.state,sites:s.sites,result:s.result,accessReview:s.accessReview});
  }catch(e){target.textContent='This saved report could not be reconciled. Export its JSON inputs, or restore them and recalculate. '+e.message;}
 }
 root.addEventListener('submit',e=>{
  if(e.target.id!=='scenarioSaveForm')return;e.preventDefault();
  try{store.save({...active(root.querySelector('#scenarioName').value),id:crypto.randomUUID()});render();toast('Named trip saved in this browser.');}catch(e){toast(e.message);}
 });
 root.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  try{
   if(b.hasAttribute('data-scenario-library-backup')){const blob=new Blob([store.raw||''],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='the-long-way-library-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
   if(b.hasAttribute('data-scenario-close')){selectedId=null;render();return;}
   if(b.dataset.scenarioView){selectedId=b.dataset.scenarioView;renderReport();root.querySelector('#savedScenarioReport').scrollIntoView({behavior:'smooth',block:'start'});return;}
   if(b.dataset.scenarioRestore){const s=find(b.dataset.scenarioRestore);if(s){onRestore(s);selectedId=null;render();}return;}
   if(b.dataset.scenarioExport){b.disabled=true;try{await onExport(find(b.dataset.scenarioExport),b.dataset.format);}finally{b.disabled=false;}return;}
   if(b.dataset.scenarioRename){const id=b.dataset.scenarioRename,input=[...root.querySelectorAll('[data-scenario-name]')].find(el=>el.dataset.scenarioName===id);store.rename(id,input.value);render();toast('Trip renamed.');return;}
   if(b.dataset.scenarioDelete){const id=b.dataset.scenarioDelete;if(deleteId!==id){deleteId=id;b.textContent='Confirm delete';return;}store.remove(id);deleteId=null;if(selectedId===id)selectedId=null;render();toast('Saved trip deleted.');}
  }catch(e){toast(e.message);}
 });
 return {update:render};
}
