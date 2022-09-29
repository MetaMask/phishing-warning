import { precacheAndRoute } from 'workbox-precaching'

window.addEventListener('check-if-service-worker-alive', (e) =>
  e.source.postMessage("yes I'm alive and well"),
);

precacheAndRoute(self.__WB_MANIFEST)