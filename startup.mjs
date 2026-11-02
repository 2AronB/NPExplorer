// Keep controls inactive until saved inputs, data and event handlers are ready.
// A missing/mixed asset must leave a recovery message, not a plausible empty trip.
const main=document.getElementById('plannerMain'),status=document.getElementById('startupStatus');
try{
 await import('./app.mjs');
 main.inert=false;main.removeAttribute('aria-busy');status.hidden=true;
 document.getElementById('export').disabled=false;document.getElementById('import').disabled=false;
}catch(error){
 console.error('Planner startup failed:',error);
 main.hidden=true;
 const message=document.createElement('p');message.textContent='The planner could not finish loading. Your saved inputs have not been cleared. Reload to try again.';
 const retry=document.createElement('button');retry.type='button';retry.textContent='Reload planner';retry.addEventListener('click',()=>location.reload());
 status.setAttribute('role','alert');status.replaceChildren(message,retry);
}
