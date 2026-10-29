export function accessForMonth(audit,id,month){
 const p=audit?.parks[id];if(!p||!Number.isInteger(month)||month<1||month>12)return null;
 if(p.majorMonths.includes(month))return {level:'major',label:'Mostly closed for core highlights',...p};
 if(p.transitionMonths.includes(month))return {level:'transition',label:'Seasonal transition · verify access',...p};
 if(p.partialMonths.includes(month))return {level:'partial',label:'Some areas / services restricted',...p};
 return null;
}
const months=values=>values.map(m=>['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]).join(', ');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function accessDetails(audit,research,id,month){
 const p=audit?.parks[id];if(!p)return '';
 const status=accessForMonth(audit,id,month);
 return `<div class="access-assessment ${status?.level==='major'?'access-major':''}"><strong>${esc(status?.label||'Core-access audit')}</strong><p>${esc(p.assessment)}</p>${p.majorMonths.length?`<p>Core restricted months (approximate): ${months(p.majorMonths)}.</p>`:''}${p.transitionMonths.length?`<p>Transition months: ${months(p.transitionMonths)}. Verify the actual dates.</p>`:''}<details><summary>Evidence and interpretation</summary><p>Reviewed ${esc(audit.reviewed)}. ${esc(audit.basis)} ${esc(audit.monthPolicy)} This flag does not change your scores or optimizer constraints.</p>${p.sourceIDs.map(id=>research?.sources[id]).filter(s=>s&&/^https:\/\/www\.nps\.gov\//.test(s.url)).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('<br>')}</details></div>`;
}
