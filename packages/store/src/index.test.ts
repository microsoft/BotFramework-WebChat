/// <reference types="node" />

import { strictEqual } from 'node:assert';
import { test } from 'node:test';

test('import should work', async () => {
  await import('./index.ts');
});

test('createReadonlyMap should be exported', async () => {
  const { createReadonlyMap } = await import('./index.ts');
  const map = createReadonlyMap(new Map([['a', 1]]));
  const writable = map.mutate();

  writable.set('b', 2);

  const next = writable.commit();

  strictEqual(next.get('b'), 2);
  strictEqual(map.has('b'), false);
});
