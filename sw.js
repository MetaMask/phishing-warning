import { precacheAndRoute } from 'workbox-precaching';


self.addEventListener('message', (event) => {
  console.log('event.data:', event.data)
})


precacheAndRoute([
  { revision: 'dc4d5a06714d6143aa65183ff9da2a64', url: 'bundle.js' },
  { revision: '7d427f37ea8ea0c74b5fae7ac17c43c9', url: 'design-tokens.css' },
  { revision: 'd2a351a8944ee912c28bed6940f606b1', url: 'favicon.ico' },
  {
    revision: 'cd393be20accd12b36efefde5bb590db',
    url: 'fonts/EuclidCircularB-Bold-WebXL.ttf',
  },
  {
    revision: 'd5aac9e768d285a459e8b4ea0ff490bf',
    url: 'fonts/EuclidCircularB-Regular-WebXL.ttf',
  },
  {
    revision: 'eaba73fe46034f1cb5c01ad173441b41',
    url: 'fonts/EuclidCircularB-RegularItalic-WebXL.ttf',
  },
  { revision: 'a042e6951e4877b286a95fe3c08c028b', url: 'globalthis.js' },
  { revision: 'dd144e79c52695361a74132bcf8df807', url: 'index.css' },
  { revision: 'eb7f1c5730d22014e98e18bf4f552c6b', url: 'index.html' },
  { revision: '0a1030c97ecbe0e2b00f0d86b2ed0bf9', url: 'lockdown-install.js' },
  { revision: '8c5643c834685df14b32726bf2d42a21', url: 'lockdown-more.js' },
  { revision: 'f25896dd75865d1092d1fe29b744338c', url: 'lockdown-run.js' },
  { revision: 'd4fe81bfdf75c4a4895a2132b2132479', url: 'manifest.webmanifest' },
  { revision: '19bb5b823b525eabd6d7da6bf4ed98ea', url: 'metamask-fox.svg' },
]);
