export type Profile={sex:'m'|'f';age:number;height_cm:number;weight_kg:number;activity:number;goal:'lose'|'maintain'|'gain'}
export type Food={id:number;name:string;kcal:number;protein:number;carbs:number;fat:number;fiber?:number}
// Mifflin-St Jeor × aktivitet, justert for mål. Estimat, ikke medisinsk rådgivning.
export function kcalGoal(p:Profile){
 const bmr=10*p.weight_kg+6.25*p.height_cm-5*p.age+(p.sex==='m'?5:-161)
 return Math.round(bmr*p.activity+({lose:-500,maintain:0,gain:300})[p.goal])}
export function macroGrams(kcal:number,pP:number,pC:number,pF:number){
 return {protein:Math.round(kcal*pP/100/4),carbs:Math.round(kcal*pC/100/4),fat:Math.round(kcal*pF/100/9)}}
// Matvaretabellen er per 100 g spiselig del → skaler til faktisk mengde i gram
export const scale=(f:Food,grams:number)=>{const k=grams/100
 return {kcal:f.kcal*k,protein:f.protein*k,carbs:f.carbs*k,fat:f.fat*k,fiber:(f.fiber??0)*k}}
export const UNITS:Record<string,number>={g:1,ml:1,ss:15,ts:5,kopp:240} // ml→g forutsetter tetthet ≈ 1
