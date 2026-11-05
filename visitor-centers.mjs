const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function googleMapsPin(center){
 if(!center||!Number.isFinite(center.lat)||Math.abs(center.lat)>90||!Number.isFinite(center.lng)||Math.abs(center.lng)>180)throw Error('Invalid visitor-center coordinates');
 return 'https://www.google.com/maps/search/?'+new URLSearchParams({api:'1',query:center.lat+','+center.lng});
}
function officialUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&/(^|\.)nps.gov$/.test(url.hostname);}catch{return false;}}
export function validateVisitorCenters(data,parkIds){
 if(data?.schemaVersion!==1||!/^\d{4}-\d{2}-\d{2}$/.test(data.reviewed)||!data.records)throw Error('Visitor-center data could not be loaded');
 const ids=Object.keys(data.records);if(ids.length!==parkIds.length||ids.some(id=>!parkIds.includes(id)))throw Error('Visitor-center inventory does not match the parks');
 for(const id of ids){const p=data.records[id];if(!p.reason||!p.note||!Array.isArray(p.alternatives)||!officialUrl(p.sourceUrl))throw Error('Invalid visitor-center review '+id);
  for(const c of [p.primary,...p.alternatives]){if(!c?.name||!officialUrl(c.informationUrl))throw Error('Invalid visitor-center source '+id);googleMapsPin(c);}
 }
 return data;
}
export function visitorCenterHtml(record,reviewed){
 if(!record)return '';
 const pin=c=>`<a href="${escape(googleMapsPin(c))}" target="_blank" rel="noopener noreferrer">View ${escape(c.name)} on Google Maps ↗</a>`;
 const center=c=>`<strong>${escape(c.name)}</strong><p class="visitor-center-links">${pin(c)} <a href="${escape(c.informationUrl)}" target="_blank" rel="noopener noreferrer">NPS visitor information ↗</a></p>`;
 return `<section class="visitor-center-card" aria-label="Suggested visitor center"><p class="eyebrow">SUGGESTED FIRST STOP</p>${center(record.primary)}<p>${escape(record.reason)}</p><p class="visitor-center-access">${escape(record.note)}</p>${record.alternatives.length?`<details><summary>Other useful centers · ${record.alternatives.length}</summary><p>Choose the center for your entrance, district or transport. These are selected alternatives, not every facility.</p><ul>${record.alternatives.map(c=>`<li>${center(c)}</li>`).join('')}</ul></details>`:''}<details><summary>Sources & location details</summary><p class="visitor-center-coordinates">${record.primary.lat.toFixed(5)}, ${record.primary.lng.toFixed(5)}</p><p class="fineprint">Planning suggestion, not a measured size or popularity ranking. Facility pin, not a verified parking entrance or driving route. Check travel-year hours and access with NPS. <a href="${escape(record.sourceUrl)}" target="_blank" rel="noopener noreferrer">NPS coordinate source</a> · reviewed ${escape(reviewed)}.</p><a class="visitor-center-download" href="./data/park-visitor-centers.csv" download>All 64 park starting points · CSV</a></details></section>`;
}
export function visitorCentersCsv(data){
 const rows=[['Park','Suggested center','Latitude','Longitude','Google Maps pin','Why this center','Access and district note','NPS visitor information','NPS coordinate source','Reviewed']];
 for(const p of Object.values(data.records).sort((a,b)=>a.park.localeCompare(b.park)))rows.push([p.park,p.primary.name,p.primary.lat,p.primary.lng,googleMapsPin(p.primary),p.reason,p.note,p.primary.informationUrl,p.sourceUrl,data.reviewed]);
 return rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
}
