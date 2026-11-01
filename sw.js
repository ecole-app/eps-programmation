// Appli EPS Luqmân : fonctionne hors connexion.
// Pages du site : réseau d'abord (toujours la dernière version en ligne), copie locale si pas de réseau.
// Polices et scripts Firebase : copie locale d'abord, mise à jour en arrière-plan.
// Le nom du cache est propre à ce site : les autres applis du domaine (ASMB…) ne sont jamais touchées.
const CACHE = 'eps-programmation-v1';
const BASE = new URL('./', self.location).pathname;
const FICHIERS = ['./', 'index.html', 'baremes.html', 'baremes-data.js', 'appreciations.html', 'appreciations-ia.html',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/logo-luqman.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('eps-programmation-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function delai(ms){ return new Promise((_, ko) => setTimeout(() => ko(new Error('lent')), ms)); }

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === self.location.origin) {
    if (!u.pathname.startsWith(BASE)) return;           // autre appli du domaine : on ne touche à rien
    const cle = u.origin + u.pathname;                   // sans ?v=… pour retrouver la copie hors ligne
    e.respondWith(
      Promise.race([fetch(r), delai(6000)])
        .then(res => {
          if (res && res.ok) { const copie = res.clone(); caches.open(CACHE).then(c => c.put(cle, copie)); }
          return res;
        })
        .catch(() => caches.match(cle).then(m => m || caches.match(BASE + 'index.html')))
    );
    return;
  }
  if (/^(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com)$/.test(u.hostname)) {
    e.respondWith(caches.open(CACHE).then(c => c.match(r).then(m => {
      const reseau = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => m);
      return m || reseau;
    })));
  }
});
