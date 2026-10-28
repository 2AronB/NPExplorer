import {optimizeTrip,tripDetours} from './trip-optimizer.mjs';
self.onmessage=({data})=>{
 try{
  const result=optimizeTrip(data.stops,data.settings,progress=>self.postMessage({progress}));
  const lookup=new Map(data.stops.map(s=>[s.id,s]));
  self.postMessage({result,suggestions:result?tripDetours(data.candidates,result,lookup,data.settings):[]});
 }catch(e){self.postMessage({error:e.message});}
};
