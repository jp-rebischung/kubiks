// Garde le jeu en mémoire sur le téléphone pour pouvoir y jouer sans connexion.
// Avec une connexion, le téléphone prend toujours la dernière version mise en ligne ;
// sans connexion, il utilise la copie gardée en mémoire.
// (Changer ce numéro n'est plus obligatoire, mais ça ne fait pas de mal.)
const VERSION = "kubiks-v3";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then(r => { const copie = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copie)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
