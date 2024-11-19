import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  bundle: true,
  minify: true,
  dts: true,
  keepNames: true,
  external: [/^@serenityjs\//, "sqlite3"]
});
