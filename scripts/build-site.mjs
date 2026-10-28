import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const runtimeFiles=[
 'index.html','style.css','app.mjs','calibration.mjs','current-inventory.mjs',
 'excursions.mjs','location-detail.mjs','map-markers.mjs','optimizer.mjs',
 'personal-priority.mjs','plan-defaults.mjs','remote-parks.mjs','season-quality.mjs',
 'transport-ui.mjs','trip-export.mjs','trip-optimizer.mjs','worker.mjs',
 'data/sites.json','data/states.json',
 'vendor/leaflet.js','vendor/leaflet.css','vendor/topojson-client.min.js','vendor/xlsx.mini.min.js',
 'vendor/LEAFLET-LICENSE.txt','vendor/TOPOJSON-LICENSE.txt','vendor/US-ATLAS-LICENSE.txt','vendor/SHEETJS-LICENSE.txt'
];
export async function buildSite(){
 const destination=path.resolve(projectRoot,'dist');
 if(destination===projectRoot||path.dirname(destination)!==projectRoot||path.basename(destination)!=='dist')throw Error('Unsafe build destination');
 try{const entry=await fs.lstat(destination);if(entry.isSymbolicLink())throw Error('Build destination must not be a symbolic link');}catch(error){if(error.code!=='ENOENT')throw error;}
 // Only the explicitly checked generated dist directory can be replaced.
 await fs.rm(destination,{recursive:true,force:true});await fs.mkdir(destination,{recursive:true});
 for(const relative of runtimeFiles){
  const source=path.resolve(projectRoot,relative),target=path.resolve(destination,relative);
  if(!source.startsWith(projectRoot+path.sep)||!target.startsWith(destination+path.sep))throw Error('Invalid publication path');
  await fs.mkdir(path.dirname(target),{recursive:true});
  if(relative==='index.html'){const html=await fs.readFile(source,'utf8');await fs.writeFile(target,html.replace('LOCAL FIRST DRAFT','PLANNING PROTOTYPE'));}
  else await fs.copyFile(source,target);
 }
 await fs.writeFile(path.join(destination,'.nojekyll'),'');
 console.log(`Static website ready: ${destination} (${runtimeFiles.length+1} files)`);
 return destination;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildSite();
