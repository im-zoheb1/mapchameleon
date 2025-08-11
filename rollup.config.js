import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from '@rollup/plugin-terser';

export default [
  // ES Modules build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm'
    },
    external: ['leaflet', 'maplibre-gl'],
    plugins: [
      resolve(),
      commonjs(),
      typescript()
    ]
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    external: ['leaflet', 'maplibre-gl'],
    plugins: [
      resolve(),
      commonjs(),
      typescript()
    ]
  },
  // UMD build for browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MapChameleon',
      globals: {
        'leaflet': 'L',
        'maplibre-gl': 'maplibregl'
      }
    },
    external: ['leaflet', 'maplibre-gl'],
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      terser()
    ]
  }
];
