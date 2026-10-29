import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const runtimeFiles=[
 'seasonal-access.mjs','data/seasonal-access-audit.json','calendar.mjs','reservation-ui.mjs','data/reservation-requirements.json','index.html','style.css','app.mjs','calibration.mjs','current-inventory.mjs',
 'excursions.mjs','location-detail.mjs','map-markers.mjs','optimizer.mjs',
 'personal-priority.mjs','plan-defaults.mjs','remote-parks.mjs','season-quality.mjs',
 'transport-ui.mjs','trip-export.mjs','itinerary-workbook.mjs','park-highlights.mjs','trip-optimizer.mjs','worker.mjs',
 'data/sites.json','data/states.json','data/seasonal-research/seasonal-access.json',
 'vendor/leaflet.js','vendor/leaflet.css','vendor/topojson-client.min.js','vendor/exceljs.min.js',
 'vendor/LEAFLET-LICENSE.txt','vendor/TOPOJSON-LICENSE.txt','vendor/US-ATLAS-LICENSE.txt','vendor/EXCELJS-LICENSE.txt'
];
export async function buildSite(){
 const hash=createHash('sha256');for(const file of runtimeFiles)hash.update(await fs.readFile(path.join(projectRoot,file)));const version=hash.digest('hex').slice(0,12);
 const versionAssets=text=>text.replace(/(["'])([^"'\s?]+\.(?:mjs|css|js))\1/g,(match,quote,url)=>url.startsWith('http')?match:quote+url+'?v='+version+quote);
 const destination=path.resolve(projectRoot,'dist');
 if(destination===projectRoot||path.dirname(destination)!==projectRoot||path.basename(destination)!=='dist')throw Error('Unsafe build destination');
 try{const entry=await fs.lstat(destination);if(entry.isSymbolicLink())throw Error('Build destination must not be a symbolic link');}catch(error){if(error.code!=='ENOENT')throw error;}
 // Only the explicitly checked generated dist directory can be replaced.
 await fs.rm(destination,{recursive:true,force:true});await fs.mkdir(destination,{recursive:true});
 for(const relative of runtimeFiles){
  const source=path.resolve(projectRoot,relative),target=path.resolve(destination,relative);
  if(!source.startsWith(projectRoot+path.sep)||!target.startsWith(destination+path.sep))throw Error('Invalid publication path');
  await fs.mkdir(path.dirname(target),{recursive:true});
  if(relative==='index.html'){const html=await fs.readFile(source,'utf8');await fs.writeFile(target,versionAssets(html.replace('LOCAL FIRST DRAFT','PLANNING PROTOTYPE')));}
  else if(relative.endsWith('.mjs'))await fs.writeFile(target,versionAssets(await fs.readFile(source,'utf8')));
  else await fs.copyFile(source,target);
 }
 await fs.writeFile(path.join(destination,'.nojekyll'),'');
 console.log(`Static website ready: ${destination} (${runtimeFiles.length+1} files)`);
 return destination;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildSite();

