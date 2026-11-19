import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({plugins:[react(),VitePWA({registerType:'autoUpdate',
manifest:{name:'Næringlogg',short_name:'Næringlogg',lang:'nb',display:'standalone',background_color:'#0f172a',theme_color:'#16a34a',
icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png'}]},
workbox:{runtimeCaching:[{urlPattern:/\/rest\/v1\/foods/,handler:'StaleWhileRevalidate',options:{cacheName:'foods'}}]}})]})
