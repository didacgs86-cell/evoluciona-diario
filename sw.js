/* Bump this name whenever app assets change. Never caches personal data or exports. */
const CACHE='evoluciona-static-v1.1.0';
const FILES=['./','./index.html','./styles.css','./gym-core.js','./gym-ui.js','./core.js','./app.js','./vault.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('evoluciona-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin)return;
// Navigation: prefer fresh HTML, fall back offline. Assets: network first to avoid mixed releases.
event.respondWith(fetch(event.request).then(response=>{if(response.ok&&FILES.some(f=>new URL(f,self.registration.scope).href===u.href)){const clone=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,clone)));}return response;}).catch(async()=>{const cached=await caches.match(event.request);if(cached)return cached;if(event.request.mode==='navigate')return caches.match('./index.html');return Response.error();}));});
