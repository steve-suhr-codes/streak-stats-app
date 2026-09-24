import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/main.ts' },
  format: ['esm'],
  target: 'node22',
  // The shared package ships TypeScript source, so bundle it into the build.
  noExternal: ['@streak-stats/shared'],
  clean: true,
});
