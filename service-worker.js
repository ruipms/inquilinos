const CACHE_NAME = "inquilinos-network-first-v1";

// Instalação — aqui já não fazemos pre-cache de todas as páginas
self.addEventListener("install", event => {
  self.skipWaiting();
});

// Ativação — limpar caches antigos
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
  self.clients.claim();
});

// Estratégia: NETWORK FIRST para pedidos de navegação (HTML)
self.addEventListener("fetch", event => {
  const request = event.request;

  // Só aplicamos a estratégia especial a pedidos de navegação (páginas)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Se conseguir da rede, guarda em cache e devolve
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(() => {
          // Se não houver rede, tenta cache
          return caches.match(request);
        })
    );
    return;
  }

  // Para o resto (CSS, JS, imagens, manifest, etc.) usamos cache-first
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(networkResponse => {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, copy);
        });
        return networkResponse;
      });
    })
  );
});


