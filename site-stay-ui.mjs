import {siteStay} from './site-stays.mjs';
import {siteVisitProfile} from './site-visit-review.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const SITE_PLANNING_LABELS={boat:'Boat / island logistics',water:'Optional water activity',reservation:'Tours / tickets to check',restricted:'Controlled or limited access','rough-road':'Vehicle / road suitability',corridor:'Choose a local segment',distributed:'Choose specific locations',overlap:'Avoid counting shared visits twice',sensitive:'Allow time for family discussion','not-public':'Not open to the public'};
export function sitePlanningNotice(site){
 const p=siteVisitProfile(site);if(!p)return '';
 const labels=p.tags.filter(t=>['boat','restricted','rough-road','corridor','distributed','overlap','not-public'].includes(t)).map(t=>SITE_PLANNING_LABELS[t]);
 return labels.length?labels.join(' · ')+'. '+p.caveat:'';
}
export function siteVisitReviewHtml(sites){
 const reviewed=sites.map(s=>({site:s,profile:siteVisitProfile(s)})).filter(x=>x.profile);
 if(!reviewed.length)return '';
 const blocked=reviewed.filter(x=>x.profile.discovery).map(({site:s,profile:p})=>`<p class="warning"><strong>${esc(s.shortName||s.name)} · ${p.discovery==='not-public'?'not a public visit':'choose a specific visitor site'}</strong><br>${esc(p.caveat)} Saved selections are retained; revise this selection before adopting the itinerary.</p>`).join('');
 return blocked+`<details class="estimate-notes site-visit-review"><summary>Other-site visit and access review · ${reviewed.length} stop${reviewed.length===1?'':'s'}</summary><p>Allowances are editable family estimates. These research notes do not prove that the calculated dates, vehicle approach or tour bookings are feasible.</p>${reviewed.map(({site:s,profile:p})=>`<p class="${p.discovery==='not-public'?'warning':'fineprint'}"><strong>${esc(s.shortName||s.name)}</strong> · ${esc(p.caveat)} <a href="${esc(p.reference)}" target="_blank" rel="noopener">Visitor reference ↗</a></p>`).join('')}</details>`;
}
export function familyStayExplanation(site,{compact=false}={}){
 const p=siteStay(site);if(!p)return '';
 return `<div class="family-visit-scopes"><p><strong>Fast outing:</strong> ${esc(p.fastScope)}<br><strong>Slow outing:</strong> ${esc(p.slowScope)}</p><p class="${p.discovery==='not-public'?'warning':'fineprint'}"><strong>Before you go:</strong> ${esc(p.caveat)}</p>${compact?'':`<p class="fineprint">${p.tags.map(t=>esc(SITE_PLANNING_LABELS[t]||t)).join(' · ')}</p>`}<details><summary>Evidence and estimate limits</summary><p class="fineprint">Reviewed ${esc(p.sourceChecked)} · ${p.reviewLevel==='access-detail'?'Activity overview plus selected access details':'Activity overview'}. The outing was reviewed individually; exact fast/slow times are editorial family estimates. Opening-hour fits, bookings, road routes and future operations are not verified. Check the rules for your actual dates and children. Boat and shuttle logistics are not modeled as driving time.</p><ul>${p.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a><br><span class="fineprint">${esc(s.publisher)} · page updated ${esc(s.pageUpdated||'date not stated')} · reviewed ${esc(s.reviewed)}</span></li>`).join('')}</ul></details></div>`;
}
