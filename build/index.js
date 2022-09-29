const { createWriteStream, promises: fs } = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const browserify = require('browserify');
const minifyStream = require('minify-stream');
const exorcist = require('exorcist');
const { copy } = require('fs-extra');
const { generateSW, injectManifest } = require('workbox-build');
const babelConfig = require('../.babelrc.json');

const rootDirectory = path.resolve(__dirname, '..');
const distDirectory = path.join(rootDirectory, 'dist');
const staticDirectory = path.join(rootDirectory, 'static');
const sourceMapPath = path.join(distDirectory, 'bundle.js.map');

// This workaround is needed because the minified lockdown module isn't
// exported by ses, but "require.resolve" only works for exported modules.
const lockdownSource = require.resolve('ses/lockdown');
const minifiedLockdownSource = path.join(
  path.dirname(lockdownSource),
  'lockdown.umd.min.js',
);

const filesFromPackages = [
  {
    source: require.resolve(
      '@metamask/design-tokens/src/css/design-tokens.css',
    ),
    filename: 'design-tokens.css',
  },
  {
    source: require.resolve('globalthis/dist/browser.js'),
    filename: 'globalthis.js',
  },
  {
    source: minifiedLockdownSource,
    filename: 'lockdown-install.js',
  },
];

/**
 * Generate a service worker using Workbox.
 *
 * Documentation about the `generateSW` function can be found here:
 * {@link https://developer.chrome.com/docs/workbox/modules/workbox-build/#generatesw }
 *
 * This service worker will pre-cache all essential components of the page. It does not perform
 * any runtime caching.
 */
async function generateServiceWorker() {
  // await generateSW({
  //   babelPresetEnvTargets: babelConfig.presets[0][1].targets.browsers,
  //   cacheId: 'phishing-warning-page',
  //   cleanupOutdatedCaches: true,
  //   // Pre-cache CSS, HTML, SVG, and JavaScript files,
  //   // The fonts and the favicon are conditionally fetched and not strictly necessary.
  //   globDirectory: distDirectory,
  //   globPatterns: ['**/*.{css,html,js,svg}'],
  //   // eslint-disable-next-line node/no-process-env
  //   mode: process.env.NODE_ENV,
  //   swDest: path.join(distDirectory, 'service-worker.js'),
  // });
  try{

    await injectManifest({
      // cleanupOutdatedCaches: true,
      // // Pre-cache CSS, HTML, SVG, and JavaScript files,
      // // The fonts and the favicon are conditionally fetched and not strictly necessary.
      globDirectory: distDirectory,
      globPatterns: [
        '**/*.{js,css,ico,ttf,html,webmanifest,svg}'
      ],
      // // eslint-disable-next-line node/no-process-env
      // mode: process.env.NODE_ENV,
      swDest: path.join(distDirectory, 'service-worker.js'),
      swSrc: path.join(rootDirectory,'sw.js'),
    })
  } catch (err) {
    console.log("errr:", err)
  }
}

/**
 * Build a JavaScript bundle for the phishing warning page.
 */
async function main() {
  await fs.rm(distDirectory, { force: true, recursive: true });
  await fs.mkdir(distDirectory);

  const bundler = browserify({
    debug: true,
    entries: [path.join(__dirname, '../src/index.ts')],
    extensions: ['.ts'],
  });
  bundler.transform('babelify', { extensions: ['.ts', '.js', '.json'] });
  await pipeline(
    bundler.bundle(),
    minifyStream(),
    exorcist(sourceMapPath),
    createWriteStream(path.join(distDirectory, 'bundle.js')),
  );

  await Promise.all([
    ...filesFromPackages.map(async ({ source, filename }) => {
      await fs.copyFile(source, path.join(distDirectory, filename));
    }),
    copy(staticDirectory, distDirectory, {
      overwrite: false,
      errorOnExist: true,
    }),
  ]);

  await generateServiceWorker();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
