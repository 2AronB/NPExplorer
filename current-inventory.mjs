// Keep the retained 2022 boundary snapshot reproducible, while applying a
// separately sourced designation update to the runtime inventory.
export function currentInventory(sites){return sites.map(s=>s.id!=='chir'?s:{...s,type:'park',name:'Chiricahua National Park',shortName:'Chiricahua',designation:'National Park',days:2,stayNote:'Two full days for the scenic drive, rock formations and longer hiking loops. Draft hiking/highlights allowance.',designationSource:'https://www.nps.gov/chir/index.htm'});}
