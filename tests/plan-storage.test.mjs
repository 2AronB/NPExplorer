import test from 'node:test';
import assert from 'node:assert/strict';
import {openPlanStorage,PLAN_KEY} from '../plan-storage.mjs';
function fixture(){const values=new Map([[PLAN_KEY,'original']]);return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
test('stale tabs cannot overwrite a later saved plan, even without a storage event',()=>{
 const storage=fixture(),events=[],a=openPlanStorage(storage),b=openPlanStorage(storage,s=>events.push(s));
 a.setItem(PLAN_KEY,'newer');assert.throws(()=>b.setItem(PLAN_KEY,'stale'),/Another tab/);
 assert.equal(storage.getItem(PLAN_KEY),'newer');assert.equal(events.at(-1).kind,'conflict');
 assert.throws(()=>b.setItem(PLAN_KEY,'try again'),/Another tab/);
});
test('quota failure retains prior saved inputs and permits a retry',()=>{
 const storage=fixture(),events=[],write=storage.setItem;let full=true;
 storage.setItem=(k,v)=>{if(full)throw Error('Quota exceeded');write(k,v);};
 const plan=openPlanStorage(storage,s=>events.push(s));assert.throws(()=>plan.setItem(PLAN_KEY,'changed'),/Quota/);
 assert.equal(storage.getItem(PLAN_KEY),'original');assert.equal(events.at(-1).kind,'error');
 full=false;plan.setItem(PLAN_KEY,'changed');assert.equal(events.at(-1).kind,'saved');
});
test('external clear and unavailable storage are reported without startup failure',()=>{
 const storage=fixture(),events=[],plan=openPlanStorage(storage,s=>events.push(s));storage.values.clear();plan.check();
 assert.equal(events.at(-1).kind,'conflict');assert.throws(()=>plan.setItem(PLAN_KEY,'old'),/Another tab/);
 assert.doesNotThrow(()=>openPlanStorage({getItem(){throw Error('blocked');}},s=>events.push(s)));
 assert.equal(events.at(-1).kind,'error');
});
test('a stale tab must fail its preflight before replacing recovery or the active plan',()=>{
 const storage=fixture(),a=openPlanStorage(storage),b=openPlanStorage(storage);a.setItem(PLAN_KEY,'latest');
 let recovery='original recovery';assert.throws(()=>{b.assertCurrent();recovery='stale recovery';},/Another tab/);
 assert.equal(recovery,'original recovery');assert.equal(storage.getItem(PLAN_KEY),'latest');
});
