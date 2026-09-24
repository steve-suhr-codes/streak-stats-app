// Production entry point (Vercel and `npm start`). Runs the tsup bundle built by `npm run build`.
//
// Vercel runs backends file-by-file without bundling, which breaks our TypeScript source under
// Node's ES modules (extensionless imports, the TS-source shared package). The bundle has none of
// those issues. Keep src/ free of index/app/server.ts so Vercel detects this file as the entry.
import './dist/index.js';
