self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));try{await self.registration.unregister();}catch(e){}const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clientsList){client.navigate(client.url.includes('?')?client.url+'&swreset=1':client.url+'?swreset=1');}})());});
self.addEventListener('fetch',()=>{});
