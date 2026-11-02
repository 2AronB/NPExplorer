import {siteStay} from './site-stays.mjs';
// Snapshots own their research context. An explicit null means a legacy saved
// itinerary had no site review; do not silently replace it with today's data.
export const siteVisitProfile=site=>site?.type==='site'?(Object.hasOwn(site,'familyVisit')?site.familyVisit:siteStay(site)):null;
export const automaticSiteCandidate=site=>site?.type==='site'&&!siteVisitProfile(site)?.discovery;
export const siteAccessLabel=site=>{const p=siteVisitProfile(site);return p?.discovery==='not-public'?'No public access':p?.discovery==='umbrella'?'Administrative umbrella · choose a component site':p?.tags?.includes('boat')?'Check boat / island logistics':p?.tags?.includes('rough-road')?'Check vehicle / road access':'';};
export function siteVisitConcern(site){
 const p=siteVisitProfile(site);
 if(!p||!p.discovery&&!p.tags.some(t=>['boat','restricted','rough-road','reservation'].includes(t)))return null;
 return {siteId:site.id,kind:'site-planning',label:p.discovery==='not-public'?'Not a public visit':'Other-site access planning',message:p.caveat,url:p.reference};
}
export function frozenSiteVisitProfile(site){
 const p=siteVisitProfile(site);if(!p)return null;
 return Object.fromEntries(['fast','slow','fastScope','slowScope','caveat','tags','reference','sourceChecked','reviewLevel','discovery'].filter(k=>p[k]!==undefined).map(k=>[k,structuredClone(p[k])]));
}
export function siteVisitText(site){
 const p=siteVisitProfile(site);if(!p)return '';
 return `Family estimate (editorial): fast ${p.fast}d — ${p.fastScope} Slow ${p.slow}d — ${p.slowScope} Before travel: ${p.caveat} Reviewed ${p.sourceChecked}; ${p.reviewLevel==='access-detail'?'overview plus selected access details':'activity overview'}. Verify travel-year access and local transport; road geometry is not a boat/shuttle schedule. ${p.reference}`;
}
