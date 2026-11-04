import fs from 'node:fs/promises';
import {currentInventory} from '../current-inventory.mjs';
import {REMOTE_PARKS} from '../remote-parks.mjs';
import {validateVisitorCenters,visitorCentersCsv} from '../visitor-centers.mjs';
const root=new URL('../',import.meta.url),data=JSON.parse(await fs.readFile(new URL('data/park-visitor-centers.json',root),'utf8'));
const {sites}=JSON.parse(await fs.readFile(new URL('data/sites.json',root),'utf8'));
validateVisitorCenters(data,[...currentInventory(sites).filter(s=>s.type==='park'),...REMOTE_PARKS].map(s=>s.id));
await fs.writeFile(new URL('data/park-visitor-centers.csv',root),visitorCentersCsv(data));
console.log('Generated 64 source-backed visitor-center starting points.');
