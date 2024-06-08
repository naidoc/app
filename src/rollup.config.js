import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import css from 'rollup-plugin-import-css';
import serve from 'rollup-plugin-serve';
import svelte from 'rollup-plugin-svelte';

const IS_DEV = !!process.env.ROLLUP_WATCH;

const plugins = [
  svelte({
    onwarn: (warning, handler) => {
      if(warning.code === 'a11y-missing-attribute') return;
      if(warning.code === 'a11y-click-events-have-key-events') return;
      if(warning.code === 'a11y-no-static-element-interactions') return;
      if(warning.code === 'a11y-label-has-associated-control') return;

      handler(warning);
    }
  }),
  commonjs(),
  resolve({ browser: true }),
  css({ output: 'app.css' }),
  json(),
  copy({
    targets: [
      { src: 'src/assets/*', dest: 'dist' },
      { src: 'node_modules/jszip/dist/jszip.min.js', dest: 'dist/js' },
      { src: 'node_modules/docx-preview/dist/docx-preview.min.js', dest: 'dist/js' }
    ]
  })
];

if(IS_DEV) {
  plugins.push(serve('dist'));
} else {
  plugins.push(terser({ sourceMap: { url: 'inline' } }));
}

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/js/app.min.js',
    format: 'iife'
  },
  plugins,
  watch: {
    clearScreen: true
  }
};