import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const extensions = ['.ts', '.js'];

const config = {
  input: 'src/index.ts',
  external: ['readable-stream', 'readable-stream/transform'],
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    nodeResolve({ extensions, preferBuiltins: true }),
    babel({ babelHelpers: 'bundled', extensions }),
    replace({
      preventAssignment: true,
      delimiters: ['', ''],
      values: {
        "require('readable-stream/transform')": "require('stream').Transform",
        'require("readable-stream/transform")': 'require("stream").Transform',
        'readable-stream': 'stream',
      },
    }),
    commonjs(),
  ],
};

export default config;
