// Pydantic is the source of truth. Never edit generated.ts manually.
import { compileFromFile } from 'json-schema-to-typescript';
import { mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const input = new URL('contracts/emotional-analysis.schema.json', root);
const output = new URL('apps/web/src/shared/contracts/generated.ts', root);
await mkdir(new URL('apps/web/src/shared/contracts/', root), { recursive: true });
const types = await compileFromFile(input.pathname, {
  bannerComment: '/* Generated from the Pydantic contract. Run npm run contracts:generate. */',
  style: { singleQuote: true, trailingComma: 'all' },
});
await writeFile(output, types, 'utf8');
