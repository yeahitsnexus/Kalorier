import {useEffect,useState} from 'react'
import {sb,offLookup} from './lib/supabase'
import {scale,kcalGoal,macroGrams,type Food} from './lib/nutrition'
const MEALS=['Frokost','Lunsj','Middag','Mellommåltid']
const today=()=>new Date().toISOString().slice(0,10)
const Bar=({l,v,g}:{l:string;v:number;g:number})=><div className="mb-2"><div className="flex justify-between text-xs"><span>{l}</span><span>{Math.round(v)} / {g}</span></div>
<div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-green-600" style={{width:Math.min(100,v/g*100)+'%'}}/></div></div>

function Auth(){const[e,setE]=useState('');const[p,setP]=useState('');const[err,setErr]=useState('')
 const go=async(up:boolean)=>{const r=up?await sb.auth.signUp({email:e,password:p}):await sb.auth.signInWithPassword({email:e,password:p});if(r.error)setErr(r.error.message)}
 return <div className="p-6 max-w-sm mx-auto"><h1 className="text-2xl font-bold text-green-700 mb-4">Næringlogg</h1>
 <input className="border w-full p-2 mb-2 rounded" placeholder="E-post" value={e} onChange={x=>setE(x.target.value)}/>
 <input className="border w-full p-2 mb-2 rounded" type="password" placeholder="Passord" value={p} onChange={x=>setP(x.target.value)}/>
 <p className="text-red-600 text-sm">{err}</p><button className="bg-green-600 text-white w-full p-2 rounded mb-2" onClick={()=>go(false)}>Logg inn</button>
 <button className="w-full p-2 text-green-700" onClick={()=>go(true)}>Opprett konto</button></div>}

function Onboarding({onDone}:{onDone:()=>void}){
 const[f,setF]=useState<any>({sex:'m',age:25,height_cm:175,weight_kg:75,target_kg:72,activity:1.4,goal:'maintain',protein_pct:25,carb_pct:45,fat_pct:30})
 const set=(k:string)=>(x:any)=>setF({...f,[k]:isNaN(+x.target.value)?x.target.value:+x.target.value})
 const kcal=kcalGoal(f);const m=macroGrams(kcal,f.protein_pct,f.carb_pct,f.fat_pct)
 const save=async()=>{const u=(await sb.auth.getUser()).data.user!;await sb.from('profiles').upsert({id:u.id,...f,kcal_goal:kcal});onDone()}
 const L:any={age:'Alder',height_cm:'Høyde (cm)',weight_kg:'Vekt (kg)',target_kg:'Målvekt (kg)',protein_pct:'Protein %',carb_pct:'Karbohydrat %',fat_pct:'Fett %'}
 return <div className="p-4 max-w-sm mx-auto space-y-2"><h2 className="font-bold text-lg">Om deg</h2>
 {Object.keys(L).map(k=><label key={k} className="block text-sm">{L[k]}<input className="border w-full p-2 rounded" type="number" value={f[k]} onChange={set(k)}/></label>)}
 <select className="border w-full p-2 rounded" value={f.sex} onChange={set('sex')}><option value="m">Mann</option><option value="f">Kvinne</option></select>
 <select className="border w-full p-2 rounded" value={f.activity} onChange={set('activity')}><option value={1.2}>Lite aktiv</option><option value={1.4}>Lett aktiv</option><option value={1.6}>Aktiv</option><option value={1.8}>Svært aktiv</option></select>
 <select className="border w-full p-2 rounded" value={f.goal} onChange={set('goal')}><option value="lose">Ned i vekt</option><option value="maintain">Vedlikeholde</option><option value="gain">Opp i vekt</option></select>
 <div className="bg-green-50 p-3 rounded text-sm"><b>{kcal} kcal/dag</b> · P {m.protein} g · K {m.carbs} g · F {m.fat} g<br/><i>Estimat (Mifflin-St Jeor), ikke medisinsk rådgivning.</i></div>
 <button className="bg-green-600 text-white w-full p-2 rounded" onClick={save}>Lagre</button></div>}

function AddFood({day,meal,onClose}:{day:string;meal:number;onClose:()=>void}){
 const[q,setQ]=useState('');const[res,setRes]=useState<Food[]>([]);const[g,setG]=useState(100);const[bc,setBc]=useState('')
 useEffect(()=>{if(q.length<2)return;const t=setTimeout(async()=>setRes((await sb.from('foods').select('*').ilike('name',`%${q}%`).limit(25)).data??[]),250);return()=>clearTimeout(t)},[q])
 const add=async(fd:Food)=>{await sb.from('entries').insert({day,meal_id:meal,food_id:fd.id,grams:g});onClose()}
 const scan=async()=>{const p=await offLookup(bc);if(!p)return alert('Fant ikke produktet. Legg det inn som egen matvare.')
  const u=(await sb.auth.getUser()).data.user!;const{data}=await sb.from('foods').insert({...p,owner:u.id,source:'openfoodfacts'}).select().single();if(data)add(data)}
 return <div className="fixed inset-0 bg-white p-4 overflow-auto"><button onClick={onClose} className="float-right">Lukk</button>
 <input autoFocus className="border w-full p-2 rounded mb-2" placeholder="Søk matvare…" value={q} onChange={e=>setQ(e.target.value)}/>
 <div className="flex gap-2 mb-2"><input className="border p-2 rounded w-24" type="number" value={g} onChange={e=>setG(+e.target.value)}/><span className="self-center text-sm">g</span>
 <input className="border p-2 rounded flex-1" placeholder="Strekkode" value={bc} onChange={e=>setBc(e.target.value)}/><button onClick={scan} className="px-2">Slå opp</button></div>
 {res.map(r=>{const s=scale(r,g);return <button key={r.id} onClick={()=>add(r)} className="block w-full text-left border-b py-2"><div>{r.name}</div>
 <div className="text-xs text-slate-500">{Math.round(s.kcal)} kcal · P {s.protein.toFixed(1)} · K {s.carbs.toFixed(1)} · F {s.fat.toFixed(1)} ({g} g)</div></button>})}
 <p className="text-xs text-slate-400 mt-6">Kilde: Matvaretabellen.no, Mattilsynet. Strekkoder: Open Food Facts (ODbL). Sjekk gjeldende lisens før publisering.</p></div>}

function Today(){
 const[day,setDay]=useState(today());const[rows,setRows]=useState<any[]>([]);const[prof,setProf]=useState<any>(null);const[ex,setEx]=useState(0);const[add,setAdd]=useState<number|null>(null);const[ready,setReady]=useState(false)
 const load=async()=>{setRows((await sb.from('entries').select('id,grams,meal_id,foods(*)').eq('day',day)).data??[])
  setEx(((await sb.from('exercise').select('kcal').eq('day',day)).data??[]).reduce((a:number,x:any)=>a+x.kcal,0))
  setProf((await sb.from('profiles').select('*').maybeSingle()).data);setReady(true)}
 useEffect(()=>{load()},[day,add])
 if(!ready)return null
 if(!prof)return <Onboarding onDone={load}/>
 const tot=rows.reduce((a,r)=>{const s=scale(r.foods,r.grams);return{kcal:a.kcal+s.kcal,protein:a.protein+s.protein,carbs:a.carbs+s.carbs,fat:a.fat+s.fat}},{kcal:0,protein:0,carbs:0,fat:0})
 const m=macroGrams(prof.kcal_goal,prof.protein_pct,prof.carb_pct,prof.fat_pct)
 const del=async(id:number)=>{await sb.from('entries').delete().eq('id',id);load()}
 const dup=async(r:any)=>{await sb.from('entries').insert({day,meal_id:r.meal_id,food_id:r.foods.id,grams:r.grams});load()}
 return <div className="p-4 max-w-md mx-auto pb-20"><input type="date" value={day} onChange={e=>setDay(e.target.value)} className="mb-2"/>
 <div className="text-3xl font-bold">{Math.round(prof.kcal_goal-tot.kcal+ex)} <span className="text-sm font-normal">kcal igjen</span></div>
 <div className="text-xs text-slate-500 mb-3">Inntak {Math.round(tot.kcal)} − trening {ex} = netto {Math.round(tot.kcal-ex)}</div>
 <Bar l="Kalorier" v={tot.kcal} g={prof.kcal_goal}/><Bar l="Protein" v={tot.protein} g={m.protein}/><Bar l="Karbohydrat" v={tot.carbs} g={m.carbs}/><Bar l="Fett" v={tot.fat} g={m.fat}/>
 {MEALS.map((n,i)=><section key={n} className="mt-4"><div className="flex justify-between font-semibold"><span>{n}</span><button onClick={()=>setAdd(i+1)} className="text-green-700">+ Legg til</button></div>
 {rows.filter(r=>r.meal_id===i+1).map(r=>{const s=scale(r.foods,r.grams);return <div key={r.id} className="flex justify-between text-sm py-1 border-b">
 <div>{r.foods.name}<div className="text-xs text-slate-500">{r.grams} g · P {s.protein.toFixed(0)} K {s.carbs.toFixed(0)} F {s.fat.toFixed(0)}</div></div>
 <div className="text-right">{Math.round(s.kcal)}<div className="text-xs"><button onClick={()=>dup(r)}>Dupliser</button> · <button onClick={()=>del(r.id)}>Slett</button></div></div></div>})}</section>)}
 {add&&<AddFood day={day} meal={add} onClose={()=>setAdd(null)}/>}
 <button className="text-xs text-slate-400 mt-8" onClick={()=>sb.auth.signOut()}>Logg ut</button></div>}

export default function App(){const[s,setS]=useState<any>(undefined)
 useEffect(()=>{sb.auth.getSession().then(r=>setS(r.data.session));sb.auth.onAuthStateChange((_,x)=>setS(x))},[])
 return s===undefined?null:s?<Today/>:<Auth/>}
