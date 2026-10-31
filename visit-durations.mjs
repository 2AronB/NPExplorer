export const sharesExploration=s=>s?.type==='park'||s?.type==='site';
export const validVisitDays=(site,n)=>typeof n==='number'&&Number.isFinite(n)&&n>=(site?.type==='site'?.25:1)&&n<=365&&Number.isInteger(n*(site?.type==='site'?4:1));
export const durationHelp=site=>site?.type==='site'?'Choose 0.25–365 exploration days, in quarter-day steps.':'Choose 1–365 whole exploration days.';
