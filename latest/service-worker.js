if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let c={};const f=e=>i(e,o),d={module:{uri:o},exports:c,require:f};s[o]=Promise.all(n.map((e=>d[e]||f(e)))).then((e=>(r(...e),c)))}}define(["./workbox-0d02fa54"],(function(e){"use strict";e.setCacheNameDetails({prefix:"phishing-warning-page"}),self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"bundle.js",revision:"af029f65c65fc2d5c736cf3e6900b99d"},{url:"design-tokens.css",revision:"5450cd51aeb0ca36c56137439f9b7847"},{url:"globalthis.js",revision:"a042e6951e4877b286a95fe3c08c028b"},{url:"index.css",revision:"5deb1ccb53927480ffb5dc79933053b7"},{url:"index.html",revision:"0e17fb779bea896bfb8b9fdeee3fcb98"},{url:"lockdown-install.js",revision:"c7dc122a07581e6e022f0f53a00abe9e"},{url:"lockdown-more.js",revision:"8c5643c834685df14b32726bf2d42a21"},{url:"lockdown-run.js",revision:"5cd1b9bf5d9c0f266fc8283bc706f6f5"},{url:"metamask-fox.svg",revision:"19bb5b823b525eabd6d7da6bf4ed98ea"}],{}),e.cleanupOutdatedCaches()}));
//# sourceMappingURL=service-worker.js.map