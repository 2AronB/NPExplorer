import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));
 if(!file.startsWith(root+path.sep)||path.relative(root,file).split(path.sep).some(s=>s.startsWith('.'))){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);});
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
