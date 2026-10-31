import {restBudget,validateRestAssignments} from './rest-days.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountRestPlacement(root,{onApply,onSettings,toast}){
 let input;
 function draft(){
  const assignments={...input.state.settings.restAfter};
  for(const field of root.querySelectorAll('[data-rest-days]')){
   const days=Number(field.value);delete assignments[field.dataset.restDays];
   if(field.value===''||!Number.isInteger(days)||days<0||days>365)throw Error('Enter whole rest days from 0 to 365 for every selected stop.');
   if(days)assignments[field.dataset.restDays]=days;
  }
  return validateRestAssignments(assignments);
 }
 function showBudget(){
  const status=root.querySelector('[data-rest-budget]'),button=root.querySelector('[data-rest-save]');
  try{
   const budget=restBudget({...input.state.settings,restAfter:draft()},input.state.selected);
   status.textContent=(budget.overallocated?`${budget.placed} placed days exceed the ${budget.total}-day reserve by ${-budget.unplaced}.`:`${budget.total} reserve days = ${budget.placed} placed + ${budget.unplaced} unplaced.`)+(budget.inactive.length?' '+budget.inactive.length+' saved placement(s) on unselected stops do not use the reserve.':'');
   status.classList.toggle('warning',budget.overallocated);button.disabled=budget.overallocated||!input.state.selected.length;
  }catch(e){status.textContent=e.message;status.classList.add('warning');button.disabled=true;}
 }
 root.addEventListener('input',e=>{
  if(e.target.hasAttribute('data-rest-days'))showBudget();
  if(e.target.hasAttribute('data-rest-filter')){const query=e.target.value.trim().toLowerCase();for(const row of root.querySelectorAll('[data-rest-row]'))row.hidden=!row.textContent.toLowerCase().includes(query);}
 });
 root.addEventListener('click',e=>{if(e.target.closest('[data-rest-settings]'))onSettings();});
 root.addEventListener('submit',e=>{e.preventDefault();try{const assignments=draft();if(restBudget({...input.state.settings,restAfter:assignments},input.state.selected).overallocated)throw Error('Rest placement exceeds the reserve. Reduce placements or change the total reserve.');onApply(assignments);}catch(e){toast(e.message);}});
 return {update(next){
  input=next;const opened=root.querySelector('details')?.open||false,{state,sites}=input,budget=restBudget(state.settings,state.selected),selected=new Set(state.selected);
  const stops=sites.filter(s=>selected.has(s.id)).sort((a,b)=>(a.shortName||a.name).localeCompare(b.shortName||b.name));
  root.innerHTML=`<details ${opened||budget.overallocated?'open':''}><summary>Place rest days · ${budget.placed} of ${budget.total} assigned${budget.overallocated?' · exceeds reserve':''}</summary><p>Move days from your existing rest reserve to after specific visits. Exploration stays keep their requested days. Any immediate return boat, air-taxi or island-car transfer finishes before rest; accommodation near the stop or regional gateway is unassigned.</p><p class="fineprint">Placements follow their stop when the route changes. Recalculate to shift later parks, appointments and flights. Moving rest can also change shared driving days or waiting, so total trip length may change. The remaining reserve stays at the end.</p><form><div class="rest-editor-tools"><label>Find a rest stop<input type="search" data-rest-filter placeholder="Search selected stops"></label><button type="button" data-rest-settings>Change total reserve ↗</button></div><p data-rest-budget role="status"></p>${stops.length?`<div class="rest-table-scroll"><table><thead><tr><th scope="col">After destination</th><th scope="col">Rest days</th></tr></thead><tbody>${stops.map(s=>`<tr data-rest-row><th scope="row">${esc(s.shortName||s.name)}<small>${s.remote?'In the regional trip':s.access?.transferDays?'After the return access transfer':'Before the next road leg'}</small></th><td><input type="number" min="0" max="365" step="1" required value="${state.settings.restAfter?.[s.id]||0}" data-rest-days="${esc(s.id)}" aria-label="Rest days after ${esc(s.shortName||s.name)}"></td></tr>`).join('')}</tbody></table></div>`:'<p>Select destinations to place rest days.</p>'}<button type="submit" data-rest-save>Apply rest placements</button></form></details>`;
  showBudget();
 }};
}
