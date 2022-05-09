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
const designTokensCss = require.resolve(
  '@metamask/design-tokens/src/css/design-tokens.css',
);
const sourceMapPath = path.join(distDirectory, 'bundle.js.map');

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
    fs.copyFile(designTokensCss, path.join(distDirectory, 'design-tokens.css')),
    copy(staticDirectory, distDirectory, {
      overwrite: false,
      errorOnExist: true,
    }),
  ]);
}
main().catch(console.error);
