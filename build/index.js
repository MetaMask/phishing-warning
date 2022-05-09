const { createWriteStream, promises: fs } = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const browserify = require('browserify');
const minifyStream = require('minify-stream');
const exorcist = require('exorcist');

const distDirectory = path.resolve(__dirname, '..', 'dist');
const srcDirectory = path.resolve(__dirname, '..', 'src');
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

  await fs.copyFile(
    path.join(srcDirectory, 'index.html'),
    path.join(distDirectory, 'index.html'),
  );
}

main().catch(console.error);
