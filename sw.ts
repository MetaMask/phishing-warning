import { precacheAndRoute } from 'workbox-precaching'

window.addEventListener('check-if-service-worker-alive', (e: any) =>
  e.source.postMessage("yes I'm alive and well"),
);

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST)