const CACHE="history-v4";
const ASSETS=["./","./index.html","./atlas.html","./history-data.js","./atlas-links.js","./icon.svg","./manifest.webmanifest"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  // Global historical GeoJSON, map tiles and Leaflet assets are external.
  // Do not store them in the PWA cache: files are large and use third-party licences.
  if(new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(resp=>{
    if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{})}
    return resp;
  }).catch(()=>event.request.mode==="navigate"?caches.match("./index.html"):Response.error())));
});
