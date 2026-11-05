import {validVisitDays,durationHelp} from './visit-durations.mjs';
import {PARK_HIGHLIGHTS} from './park-highlights.mjs';

const https=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
export function validSummaryPhoto(photo){
 return !!photo&&https(photo.src)&&https(photo.sourceUrl)&&https(photo.licenseUrl)&&['public-domain','CC0','CC-BY-4.0','CC-BY-SA-4.0'].includes(photo.license)&&['alt','credit'].every(key=>typeof photo[key]==='string'&&photo[key].trim());
}
export function validDraftSummaryPhoto(photo){
 return !!photo&&photo.reviewStatus==='draft'&&photo.license==='unverified'&&photo.licenseUrl===null&&https(photo.src)&&https(photo.sourceUrl)&&['alt','credit'].every(key=>typeof photo[key]==='string'&&photo[key].trim());
}
export function summaryRecord(data,id){
 const record=data?.version===1?data.records?.[id]:null;
 if(!record)return null;
 return {
  near:record.near&&['city','state'].every(key=>typeof record.near[key]==='string'&&record.near[key].trim())&&https(record.near.sourceUrl)?record.near:null,
  description:typeof record.description==='string'&&record.description.trim()&&https(record.descriptionSourceUrl)?record.description:null,
  photo:validSummaryPhoto(record.photo)||validDraftSummaryPhoto(record.photo)?record.photo:null
 };
}
export function popupPreferenceError(site,field,value){
 if(field==='days')return validVisitDays(site,value)?'':durationHelp(site);
 if(field==='priority')return Number.isInteger(value)&&value>=1&&value<=5?'':'Choose a whole-number priority from 1 to 5.';
 return 'Unknown visit preference.';
}
export function mountMapSummary({site,record,selected,onSaveField,onToggle,onMore}){
 const box=document.createElement('section');box.className='map-site-summary';
 const heading=document.createElement('h3');heading.textContent=site.shortName;box.append(heading);
 const meta=document.createElement('p');meta.className='summary-meta';
 meta.textContent=(site.designation||site.kind||(site.type==='park'?'National Park':'Personal stop'))+(record?.near?`, near ${record.near.city}, ${record.near.state}`:site.state?' · '+site.state:'');box.append(meta);
 const fields=document.createElement('div');fields.className='summary-preferences';
 const error=document.createElement('p');error.className='summary-error';error.setAttribute('role','status');error.hidden=true;
 for(const [field,title,suffix,min,max,step]of [['days','Exploration day equivalents','days planned',site.type==='site'?.25:1,365,site.type==='site'?.25:1],['priority','Priority','/5',1,5,1]]){
  const label=document.createElement('label');label.className='summary-number';
  const text=document.createElement('span');text.textContent=field==='days'?'Exploration days':title;text.title=title;label.append(text);
  const row=document.createElement('span');row.className='summary-number-row';
  const input=document.createElement('input');input.type='number';input.min=min;input.max=max;input.step=step;input.required=true;input.value=site[field]??1;input.dataset.popupField=field;input.dataset.siteId=site.id;input.setAttribute('aria-label',title+' for '+site.shortName);
  const unit=document.createElement('span');unit.textContent=field==='days'?'planned':suffix;row.append(input,unit);label.append(row);fields.append(label);
  input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();commit(true);input.blur();}};
  const commit=showError=>{
   const value=input.value===''?NaN:Number(input.value),message=popupPreferenceError(site,field,value);
   if(message){if(showError){input.setAttribute('aria-invalid','true');error.hidden=false;error.textContent=message;}return;}
   try{onSaveField(field,value);input.removeAttribute('aria-invalid');error.hidden=true;}catch(e){input.setAttribute('aria-invalid','true');error.hidden=false;error.textContent=e.message;}
  };
  input.oninput=()=>commit(false);input.onchange=()=>commit(true);input.onblur=()=>commit(true);
  input.onkeyup=e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown')commit(false);};
 }
 box.append(fields,error);
 const description=record?.description||PARK_HIGHLIGHTS[site.id]?.experiences.slice(0,2).map(item=>item.title+': '+item.description).join(' ')||site.note||site.profile?.note;
 if(description){const text=document.createElement('p');text.className='summary-description';text.textContent=description;box.append(text);}
 if(record?.photo){
  const photo=record.photo,figure=document.createElement('figure'),img=document.createElement('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';img.referrerPolicy='no-referrer';
  img.onerror=()=>{figure.hidden=true;};
  const caption=document.createElement('figcaption'),source=document.createElement('a'),license=document.createElement('a');
  source.href=photo.sourceUrl;source.textContent=photo.credit;source.target='_blank';source.rel='noopener noreferrer';
  caption.append(source,document.createTextNode(' · '));
  if(validDraftSummaryPhoto(photo)){
   const mark=document.createElement('strong');mark.className='summary-photo-draft';mark.textContent='Draft photo — rights unverified';caption.append(mark);
  }else{
   license.href=photo.licenseUrl;license.textContent=photo.license;license.target='_blank';license.rel='noopener noreferrer';caption.append(license);
  }
  figure.append(img,caption);box.append(figure);
 }
 const actions=document.createElement('div');actions.className='summary-actions';
 const label=document.createElement('label');label.className='summary-trip-toggle';
 const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.dataset.popupSelect=site.id;checkbox.checked=selected;label.append(checkbox,document.createTextNode('Add to trip'));actions.append(label);checkbox.onchange=()=>onToggle(checkbox.checked);
 const more=document.createElement('a');more.href='#detail';more.textContent='More info ↓';more.onclick=e=>{e.preventDefault();onMore();};actions.append(more);box.append(actions);
 return box;
}
