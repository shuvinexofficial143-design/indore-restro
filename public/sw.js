const CACHE="royal-offline-v1";
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.add("/offline.html"))));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("royal-offline-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{const r=event.request;if(r.method!=="GET"||r.mode!=="navigate")return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;event.respondWith(fetch(r).catch(()=>caches.match("/offline.html").then(response=>response||Response.error())))});
