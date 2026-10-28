import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {runtimeFiles,projectRoot,buildSite} from '../scripts/build-site.mjs';
test('public runtime allowlist includes every local module, worker, data and HTML dependency',async()=>{
 const allowed=new Set(runtimeFiles);
 for(const file of runtimeFiles){
  const text=await fs.readFile(path.join(projectRoot,file),'utf8');
  const references=file.endsWith('.mjs')?[...text.matchAll(/(?:from\s*|import\s*\(|fetch\s*\(|new Worker\s*\()\s*['"](\.[^'"]+)['"]/g)].map(m=>m[1]):file==='index.html'?[...text.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]):[];
  for(const ref of references){if(/^(https?:|data:)/.test(ref))continue;const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),ref));assert.ok(allowed.has(resolved),file+' → '+ref);}
 }
});
test('build publishes exactly the runtime allowlist and excludes notes, reports and development files',async()=>{
 const output=await buildSite(),walk=async dir=>{const entries=await fs.readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(async e=>e.isDirectory()?(await walk(path.join(dir,e.name))).map(x=>e.name+'/'+x):[e.name]))).flat();};
 assert.deepEqual((await walk(output)).sort(),[...runtimeFiles,'.nojekyll'].sort());
 const html=await fs.readFile(path.join(output,'index.html'),'utf8');assert.ok(html.includes('PLANNING PROTOTYPE'));assert.ok(!html.includes('LOCAL FIRST DRAFT'));
 for(const name of ['PLANNING.md','README.md','server.mjs','package.json','tests','data/nps-source.json','park-priority.png'])assert.ok(!(await walk(output)).includes(name));
});
