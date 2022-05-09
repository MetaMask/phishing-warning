const { createWriteStream, promises: fs } = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const browserify = require('browserify');
const minifyStream = require('minify-stream');
const exorcist = require('exorcist');
const { copy } = require('fs-extra');

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
    source: require.resolve('globalthis/implementation.browser.js'),
    filename: 'globalthis.js',
  },
  {
    source: minifiedLockdownSource,
    filename: 'lockdown-install.js',
  },
];

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
}
main().catch(console.error);
