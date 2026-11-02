import {siteStay,resolveSiteDays} from './site-stays.mjs';
import {automaticSiteCandidate} from './site-visit-review.mjs';
const searchable=value=>String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase();
const matchesQuery=(text,query)=>query.split(/\s+/).every(word=>text.includes(word)||(word.length>3&&word.endsWith('s')&&text.includes(word.slice(0,-1))));
const queryRank=(row,query)=>query.split(/\s+/).reduce((score,word)=>score+(matchesQuery(searchable(row.site.name),word)?3:matchesQuery(searchable(row.profile.fastScope+' '+row.profile.slowScope),word)?1:0),0);
export function siteGuideRows({sites,state},filters={}){
 const {query='',inventoryState='',logistics='',scope='all',profile='route',sort='name',maxHours=null}=filters;
 if(maxHours!==null&&(!Number.isFinite(maxHours)||maxHours<0||maxHours>3650))throw Error('Choose an allowance limit from 0 to 3650 hours, or leave it blank.');
 if(!['route','fast','slow'].includes(profile)||!['all','candidate','selected'].includes(scope)||!['name','shorter','longer'].includes(sort))throw Error('Choose a listed site-guide option.');
 const selected=new Set(state.selected),q=searchable(query.trim()),hours=state.settings.explorationHours;
 return sites.filter(s=>s.type==='site').map(site=>{
  const p=siteStay(site,state.settings.stayMode);if(!p)return null;
  const plannedDays=resolveSiteDays(site,state.settings,state.days),days=profile==='fast'?p.fast:profile==='slow'?p.slow:plannedDays;
  return {site,profile:p,days,hours:days*hours,plannedDays,selected:selected.has(site.id),custom:Object.hasOwn(state.days||{},site.id)};
 }).filter(row=>{
  if(!row)return false;
  const text=searchable([row.site.name,row.site.state,row.site.designation,row.profile.fastScope,row.profile.slowScope,row.profile.caveat].join(' '));
  return (!inventoryState||row.site.state===inventoryState)&&(!logistics||row.profile.tags.includes(logistics))
   &&(scope!=='candidate'||automaticSiteCandidate(row.site))&&(scope!=='selected'||row.selected)
   &&(maxHours===null||row.hours<=maxHours+1e-9)&&(!q||matchesQuery(text,q));
 })
 .sort((a,b)=>(sort==='shorter'?a.hours-b.hours:sort==='longer'?b.hours-a.hours:q?queryRank(b,q)-queryRank(a,q):0)||a.site.name.localeCompare(b.site.name));
}
