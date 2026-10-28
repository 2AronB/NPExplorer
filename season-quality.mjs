// Editable prototype climate/access preferences, not researched forecasts or official NPS ratings.
export const PROFILE_SCORES={
 temperate:[3,4,6,8,9,8,6,6,9,9,6,4],
 alpine:[1,1,2,3,5,7,9,10,9,6,3,1],
 desert:[5,6,9,10,8,4,2,3,7,10,8,5],
 hotDesert:[9,10,10,8,3,1,0,0,2,7,10,9],
 coast:[5,5,6,7,8,9,9,9,10,8,6,5],
 north:[1,1,2,4,7,9,10,9,9,6,3,1],
 florida:[10,10,9,8,5,3,2,2,3,5,8,10]
};
export const PARK_SCORE_OVERRIDES={
 brca:[3,3,5,7,9,9,8,8,10,9,6,3],grca:[5,6,8,10,9,5,3,3,9,10,7,5],
 grsa:[2,3,5,7,9,9,7,7,10,7,4,2],blca:[3,3,5,7,9,9,8,8,10,9,5,3],meve:[3,3,5,7,9,9,8,8,10,9,5,3],
 pinn:[7,8,10,10,9,5,3,3,5,9,9,7],cong:[5,6,9,10,8,4,3,3,6,10,9,6],hosp:[5,6,9,10,9,6,3,3,8,10,9,6],
 acad:[2,2,3,5,7,9,8,8,10,10,5,3],cuva:[3,4,6,8,9,9,7,7,10,9,6,4],indu:[2,3,5,7,9,10,8,8,9,7,4,2],
 shen:[3,4,6,8,10,9,7,7,9,10,6,4],grsm:[4,5,7,10,10,8,7,7,9,10,7,5],neri:[3,4,6,9,10,8,7,7,10,10,6,4]
};
export function monthlyQuality(profile,month){
 if(!profile)return null;
 const value=profile.scores?.[month-1];
 if(Number.isFinite(value)&&value>=0&&value<=10)return value;
 // Preserve the intent of older exported month-bucket edits.
 return profile.bad?.includes(month)?2:profile.ideal?.includes(month)?9:6;
}
export const qualityColor=value=>value===null?'#a7aa9c':`hsl(${Math.round(value*11)}, ${Math.round(38-value)}%, ${Math.round(56-value*1.2)}%)`;
