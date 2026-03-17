const CACHE_NAME = "toner-manager-v1";
const urlsToCache = [
 "/", "/index.html", "/registo.html", "/stock.html", "/manutencao.html",
 "/historico.html", "/dashboard.html", "/style.css", "/script.js", "/icon.png"
];
self.addEventListener("install", event => {
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache)));
});
self.addEventListener("fetch", event => {
 if(event.request.method!=="GET") return;
 event.respondWith(caches.match(event.request).then(resp=>resp||fetch(event.request)));
});