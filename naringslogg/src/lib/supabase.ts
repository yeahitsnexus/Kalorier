import {createClient} from '@supabase/supabase-js'
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY)
export async function offLookup(barcode:string){ // null = ikke funnet → be brukeren legge inn selv
 const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);const j=await r.json()
 if(j.status!==1)return null;const n=j.product.nutriments
 return {name:j.product.product_name||barcode,kcal:n['energy-kcal_100g']??0,protein:n.proteins_100g??0,carbs:n.carbohydrates_100g??0,fat:n.fat_100g??0,barcode}}
