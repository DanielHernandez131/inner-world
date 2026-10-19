// Pydantic is the source of truth. Never edit generated.ts manually.
import { compileFromFile } from 'json-schema-to-typescript';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const input = new URL('contracts/emotional-analysis.schema.json', root);
const output = new URL('apps/web/src/shared/contracts/generated.ts', root);
await mkdir(new URL('apps/web/src/shared/contracts/', root), { recursive: true });
const types = await compileFromFile(fileURLToPath(input), {
  bannerComment: '/* Generated from the Pydantic contract. Run npm run contracts:generate. */',
  style: { singleQuote: true, trailingComma: 'all' },
  ignoreMinAndMaxItems: true,
});
await writeFile(output, types, 'utf8');

for (const name of [
  'exploration-request',
  'exploration-response',
  'adventure-request',
  'adventure-response',
]) {
  const types = await compileFromFile(
    fileURLToPath(new URL(`contracts/${name}.schema.json`, root)),
    {
      bannerComment: '/* Generated from Pydantic. Run npm run contracts:generate. */',
      style: { singleQuote: true, trailingComma: 'all' },
      ignoreMinAndMaxItems: true,
    },
  );
  await writeFile(new URL(`apps/web/src/shared/contracts/${name}.ts`, root), types, 'utf8');
}
