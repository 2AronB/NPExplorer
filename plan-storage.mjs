export const PLAN_KEY='long-way-plan-v1';
// Compare the complete saved value before every write. A stale tab never
// silently replaces a newer plan. This is a best-effort check, not a lock.
export function openPlanStorage(storage,onStatus=()=>{}){
 let expected=null,conflicted=false;
 try{expected=storage.getItem(PLAN_KEY);}catch(error){onStatus({kind:'error',message:error.message});}
 return {
  getItem:key=>storage.getItem(key),
  assertCurrent(){
   if(conflicted||storage.getItem(PLAN_KEY)!==expected){conflicted=true;onStatus({kind:'conflict'});throw Error('Another tab changed the saved trip. Download your inputs before loading the latest saved trip.');}
  },
  setItem(key,value){
   if(key!==PLAN_KEY)return storage.setItem(key,value);
   try{
    if(conflicted||storage.getItem(PLAN_KEY)!==expected){conflicted=true;throw Error('Another tab changed the saved trip. Download your inputs before loading the latest saved trip.');}
    storage.setItem(key,value);expected=value;onStatus({kind:'saved',at:new Date()});
   }catch(error){onStatus({kind:conflicted?'conflict':'error',message:error.message});throw error;}
  },
  check(){
   try{if(storage.getItem(PLAN_KEY)!==expected){conflicted=true;onStatus({kind:'conflict',message:'Another tab changed the saved trip. Download your inputs before loading the latest saved trip.'});}}
   catch(error){onStatus({kind:'error',message:error.message});}
  }
 };
}
