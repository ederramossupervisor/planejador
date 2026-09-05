// Aumente esse número toda vez que publicar uma atualização do app.
// Isso força o Service Worker antigo a sair e o novo a assumir,
// evitando o problema clássico de "o app só abre certo em aba anônima".
const VERSAO_CACHE = "planejador-aulas-v1";

const ARQUIVOS_ESSENCIAIS = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(VERSAO_CACHE).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== VERSAO_CACHE)
          .map((nome) => caches.delete(nome))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const url = new URL(evento.request.url);

  // Nunca interceptar chamadas ao Google Apps Script — elas precisam
  // sempre buscar dados atuais na rede, nunca vir do cache.
  if (url.hostname.includes("script.google.com") || url.hostname.includes("googleusercontent.com")) {
    return;
  }

  // Só cuidamos de requisições do nosso próprio site (GET).
  if (evento.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Estratégia "network first, cache como reserva": tenta buscar a
  // versão mais nova na internet; se não conseguir (offline), usa
  // a última versão salva.
  evento.respondWith(
    fetch(evento.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(VERSAO_CACHE).then((cache) => cache.put(evento.request, copia));
        return resposta;
      })
      .catch(() => caches.match(evento.request))
  );
});
