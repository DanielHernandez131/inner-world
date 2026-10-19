import assert from 'node:assert/strict';
import test from 'node:test';
import { postJson, ApiRequestError } from '../src/shared/api/client.ts';

test('network errors keep a Spanish recovery instruction instead of Failed to fetch', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(
    postJson('/api/test', {}, 1000),
    (error) =>
      error instanceof ApiRequestError &&
      error.message.includes('npm run dev:api') &&
      !error.message.includes('Failed to fetch'),
  );
});
test('a disconnected Vite proxy returning an empty 500 gives an actionable error', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 500 }));
  await assert.rejects(postJson('/api/test', {}, 1000), /backend/);
});
test('rate-limit errors preserve server wording and Retry-After', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(JSON.stringify({ error: { message: 'Límite local alcanzado.' } }), {
        status: 429,
        headers: { 'Retry-After': '60' },
      }),
  );
  await assert.rejects(
    postJson('/api/test', {}, 1000),
    (error) => error.message === 'Límite local alcanzado.' && error.retryAfterMs === 60000,
  );
});
test('timeouts explain that repeating a request may incur usage', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new DOMException('timeout', 'TimeoutError');
  });
  await assert.rejects(postJson('/api/test', {}, 1000), /otra llamada de IA/);
});
test('HTML from a wrong port is not exposed as a JSON parser error', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>wrong app</html>'));
  await assert.rejects(postJson('/api/test', {}, 1000), /127.0.0.1:5173/);
});
