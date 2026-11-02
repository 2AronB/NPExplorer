import {MAX_PLAN_IMPORT_BYTES} from './plan-defaults.mjs';

// Publish imported inputs only after validation and durable browser persistence.
// Callers retain their active trip/result when reading, validation or saving fails.
export async function importPlanFile(file,{validate,storage,key='long-way-plan-v1'}){
 if(!file||!Number.isFinite(file.size)||file.size<0||typeof file.text!=='function')throw Error('Choose a JSON plan file.');
 if(file.size>MAX_PLAN_IMPORT_BYTES)throw Error('Plan file exceeds the 5 MB import limit.');
 const next=validate(JSON.parse(await file.text()));
 try{storage.setItem(key,JSON.stringify(next));}
 catch{throw Error('Could not save the imported plan: browser storage is full or unavailable. Your existing trip was kept. Export a JSON backup before trying again.');}
 return next;
}
