import copy from 'rollup-plugin-copy';
import css from 'rollup-plugin-import-css';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import svelte from 'rollup-plugin-svelte';
import terser from '@rollup/plugin-terser';

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
  resolve({ browser: true }),
  css({ output: 'app.css' }),
  copy({
    targets: [{ src: 'src/assets/*', dest: 'dist' }]
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
    file: 'dist/app.js',
    format: 'iife'
  },
  plugins,
  watch: {
    clearScreen: true
  }
};