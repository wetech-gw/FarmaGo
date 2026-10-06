/**
 * Service worker da FarmaGo.
 *
 * Este worker é deliberadamente "mudo": NÃO regista um listener de `fetch`.
 *
 * O FarmaGo é uma aplicação dinâmica e autenticada (cookie de sessão), com
 * dados que mudam constantemente — stock de medicamentos, preços, farmácias
 * validadas. Um cache de rede serviria HTML antigo ao utilizador depois de
 * uma venda ou de uma validação, o que é pior do que não ter cache. É por
 * isso que o `Cache-Control: no-store` em `/sw.js` vem acompanhado de zero
 * estratégia de cache aqui dentro.
 *
 * O que fica registado é apenas o ciclo de vida, para que:
 *   - uma nova versão seja activada imediatamente (`skipWaiting`);
 *   - a página aberta passe a ser controlada sem recarregar (`clients.claim`);
 *   - exista um ponto de registo para push notifications, quando estas forem
 *     ligadas ao backend.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});