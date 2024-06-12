import { readFile } from 'fs/promises';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import cssnano from 'cssnano';
import postcss from 'postcss';
import copy from 'rollup-plugin-copy';
import sass from 'rollup-plugin-sass';
import serve from 'rollup-plugin-serve';
import svelte from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';

const IS_PROD = !process.env.ROLLUP_WATCH;
const GEN_SOURCEMAP = true;

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/app.js',
    format: 'iife'
  },
  watch: { clearScreen: false },
  plugins: [
    commonjs(),
    resolve({ browser: true }),
    svelte({
      preprocess: [
        preprocess.replace([
          [/\{\s*'__NAIDOC_VERSION'\s*\}/g, pkg.version]
        ]),
        preprocess.typescript()
      ],
      emitCss: true,
      onwarn: (warning, handler) => {
        if(warning.code === 'a11y-missing-attribute') return;
        if(warning.code === 'a11y-click-events-have-key-events') return;
        if(warning.code === 'a11y-no-static-element-interactions') return;
        if(warning.code === 'a11y-label-has-associated-control') return;
        handler(warning);
      },
      compilerOptions: {
        enableSourcemap: GEN_SOURCEMAP,
        dev: !IS_PROD
      }
    }),
    typescript(),
    sass({
      output: 'dist/app.css',
      processor: IS_PROD && (css => postcss([cssnano({ preset: 'advanced' })])
        .process(css, { from: undefined })
        .then(result => result.css))
    }),
    copy({
      targets: [
        { src: 'src/assets/index.html', dest: 'dist' },
        { src: 'src/assets/web/*', dest: 'dist' },
        { src: 'src/assets/img/*', dest: 'dist/img' },
        { src: 'src/assets/font/*', dest: 'dist/font' },
        { src: 'node_modules/jszip/dist/jszip.min.js', dest: 'dist/lib', rename: 'jszip.js' },
        {
          src: 'node_modules/docx-preview/dist/docx-preview.min.js',
          dest: 'dist/lib',
          rename: 'docx-preview.js'
        }
      ]
    }),
    IS_PROD && terser({ sourceMap: { url: 'inline' } }),
    !IS_PROD && serve('dist')
  ]
};