// Editorial discovery shortlists, reviewed 2026-11-02. Membership is independent
// of personal priorities and optimizer scoring. Top 10 is a subset of Top 25.
export const TOP_PARKS=['yell','yose','grca','zion','glac','grte','olym','acad','mora','dena',
 'brca','arch','redw','sequ','grsm','ever','havo','romo','crla','cany','deva','kefj','glba','katm','meve'];
export function filterPlaces(sites,{type='park',region='all',shortlist='all',query='',selected=[]}={}){
 const chosen=new Set(selected),top=new Set(TOP_PARKS.slice(0,shortlist==='top10'?10:25)),q=query.trim().toLowerCase();
 return sites.filter(s=>
  (type==='selected'?chosen.has(s.id):type==='all'?s.type!=='custom':s.type==='park')&&
  (region==='all'||region==='conus'&&!s.remote&&s.type!=='custom'||region==='remote'&&!!s.remote||s.remote?.region===region)&&
  (shortlist==='all'||s.type==='park'&&top.has(s.id))&&
  `${s.name} ${s.state||''} ${s.designation||''}`.toLowerCase().includes(q));
}
