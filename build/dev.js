const { createWriteStream, promises: fs } = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const browserify = require('browserify');

const exorcist = require('exorcist');
const { copy } = require('fs-extra');
const { generateSW } = require('workbox-build');
const watchify = require('watchify');
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
  await generateSW({
    cleanupOutdatedCaches: true,
    babelPresetEnvTargets: babelConfig.presets[0][1].targets.browsers,
    cacheId: 'phishing-warning-page',
    // Pre-cache CSS, HTML, SVG, and JavaScript files,
    // The fonts and the favicon are conditionally fetched and not strictly necessary.
    globDirectory: distDirectory,
    globPatterns: ['**/*.{css,html,js,svg}'],
    mode: 'development',
    swDest: path.join(distDirectory, 'service-worker.js'),
  });
}

/**
 * Build a JavaScript bundle for the phishing warning page.
 */
async function main() {
  const bundler = browserify({
    debug: true,
    entries: [path.join(__dirname, '../src/index.ts')],
    extensions: ['.ts'],
    plugin: [watchify],
  });

  /**
   * Bundles the JavaScript and copies the static assets to the dist directory.
   */
  async function bundle() {
    console.log(`>>>>> Building ${new Date().toLocaleTimeString()} <<<<<`);
    await fs.rm(distDirectory, { force: true, recursive: true });
    await fs.mkdir(distDirectory);
    bundler.transform('babelify', { extensions: ['.ts', '.js', '.json'] });

    await pipeline(
      bundler.bundle(),
      exorcist(sourceMapPath),
      createWriteStream(path.join(distDirectory, 'bundle.js')),
    );

    await Promise.all([
      ...filesFromPackages.map(async ({ source, filename }) => {
        await fs.copyFile(source, path.join(distDirectory, filename));
      }),
      copy(staticDirectory, distDirectory, {
        overwrite: true,
        errorOnExist: true,
      }),
    ]);

    await generateServiceWorker();
  }

  bundler.on('update', bundle);
  bundle();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
