// Business Titan টিচার রিমাইন্ডার — সার্ভিস ওয়ার্কার
// পেজ আপডেট করলে নিচের ভার্সন নম্বর বাড়িয়ে দিন (v1 → v2)
const CACHE='bt-reminder-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(a=>c.add(a).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return; // Firebase/Google Fonts ইত্যাদি সরাসরি নেটওয়ার্কে যাবে
  if(req.mode==='navigate'){
    // পেজ: আগে নেটওয়ার্ক (সবসময় নতুন ভার্সন), অফলাইনে ক্যাশ
    e.respondWith(fetch(req).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return res;
    }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  // আইকন/ম্যানিফেস্ট: ক্যাশ থেকে দেখাও, পেছনে আপডেট করো
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(res=>{ if(res.ok){const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy));} return res; }).catch(()=>hit);
    return hit||net;
  }));
});
