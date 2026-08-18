// Nome do cache — MUDA para forçar o Edge a atualizar
const CACHE_NAME = "inquilinos-quatro";

// Lista de ficheiros a cachear — sem "./" porque o Edge Mobile não gosta
const FILES_TO_CACHE = [
  "index.html",
  "santa-barbara.html",
  "av-marconi.html",
  "capitao-roby.html",
  "vila-paulo-jorge.html",
  "av-eua.html",
  "manifest.json"
];

// Instalação do Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Ativação — apaga caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Interceção de pedidos
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Se existir na cache, devolve
      if (response) return response;

      // Caso contrário, vai buscar à internet
      return fetch(event.request);
    })
  );
});

