import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import cssnano from 'cssnano';
import postcss from 'postcss';
import copy from 'rollup-plugin-copy';
import sass from 'rollup-plugin-sass';
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
  sass({
    output: 'dist/app.min.css',
    options: {
      includePaths: ['node_modules']
    },
    processor: css => postcss([cssnano({ preset: 'advanced' })])
      .process(css, { from: undefined })
      .then(result => result.css)
  }),
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